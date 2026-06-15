import { NextRequest } from 'next/server'
import {
  jsonNoStore,
  protectCycleEndpoint,
} from '@/lib/server/xzro-api-protection'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const MAX_REQUEST_BYTES = 8_192
const MAX_RESPONSE_BYTES = 2_000_000
const BACKEND_TIMEOUT_MS = 240_000

type ScanRequest = {
  portfolio_budget_usd?: unknown
}

function getBackendConfig() {
  const rawUrl = process.env.XZRO_BACKEND_URL
  const apiKey = process.env.XZRO_BACKEND_API_KEY

  if (!rawUrl || !apiKey) return null

  try {
    const url = new URL(rawUrl)
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null
    }

    return { apiKey, url: url.toString().replace(/\/$/, '') }
  } catch {
    return null
  }
}

async function readRequest(req: NextRequest): Promise<ScanRequest | null> {
  const contentType = (req.headers.get('content-type') ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase()
  const contentLength = Number(req.headers.get('content-length') ?? 0)

  if (
    contentType !== 'application/json' ||
    !Number.isFinite(contentLength) ||
    contentLength > MAX_REQUEST_BYTES
  ) {
    return null
  }

  const text = await req.text()
  if (!text || Buffer.byteLength(text, 'utf8') > MAX_REQUEST_BYTES) return null

  try {
    const body = JSON.parse(text) as ScanRequest
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null

    const allowedKeys = new Set(['portfolio_budget_usd'])
    if (Object.keys(body).some((key) => !allowedKeys.has(key))) return null

    return body
  } catch {
    return null
  }
}

async function readUpstreamJson(res: Response) {
  const declaredLength = Number(res.headers.get('content-length') ?? 0)
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_RESPONSE_BYTES
  ) {
    throw new Error('Response too large')
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('Missing response body')

  const decoder = new TextDecoder()
  let totalBytes = 0
  let text = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    totalBytes += value.byteLength
    if (totalBytes > MAX_RESPONSE_BYTES) {
      await reader.cancel()
      throw new Error('Response too large')
    }
    text += decoder.decode(value, { stream: true })
  }

  text += decoder.decode()
  return JSON.parse(text) as unknown
}

function sanitizeResponse(value: unknown, depth = 0): unknown {
  if (depth > 12) return null
  if (Array.isArray(value)) {
    return value.slice(0, 2_000).map((item) => sanitizeResponse(item, depth + 1))
  }
  if (!value || typeof value !== 'object') return value

  const output: Record<string, unknown> = {}

  for (const [key, item] of Object.entries(value)) {
    if (
      /(?:authorization|api[_-]?key|access[_-]?token|secret|password|raw[_-]?books?)/i.test(
        key,
      )
    ) {
      continue
    }
    output[key] = sanitizeResponse(item, depth + 1)
  }

  return output
}

export async function POST(req: NextRequest) {
  const blocked = await protectCycleEndpoint(req)
  if (blocked) return blocked

  const backend = getBackendConfig()
  if (!backend) {
    return jsonNoStore(
      {
        error: 'Service temporarily unavailable.',
        code: 'service_unavailable',
      },
      { status: 503 },
    )
  }

  const request = await readRequest(req)
  const budget = request?.portfolio_budget_usd

  if (
    typeof budget !== 'number' ||
    !Number.isFinite(budget) ||
    budget < 10 ||
    budget > 1_000
  ) {
    return jsonNoStore(
      { error: 'Invalid scan request.', code: 'invalid_request' },
      { status: 400 },
    )
  }

  const payload = {
    venue: 'hyperliquid',
    use_all_venue_symbols: true,
    hyperliquid_universe_max_symbols: 8,
    max_symbols_deep_analysis: 8,
    horizon_minutes: [30],
    portfolio_budget_usd: budget,
    include_raw_books: false,
    use_mock_on_error: true,
  }

  try {
    const res = await fetch(`${backend.url}/api/agent/cycle`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${backend.apiKey}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    })

    if (!res.ok) {
      return jsonNoStore(
        {
          error: 'The scan could not be completed.',
          code: 'upstream_unavailable',
        },
        { status: res.status === 408 || res.status === 504 ? 504 : 502 },
      )
    }

    const data = await readUpstreamJson(res)
    if (!data || typeof data !== 'object') throw new Error('Invalid response')

    return jsonNoStore(sanitizeResponse(data))
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')

    return jsonNoStore(
      {
        error: timedOut
          ? 'The scan timed out.'
          : 'The scan could not be completed.',
        code: 'upstream_unavailable',
      },
      { status: timedOut ? 504 : 502 },
    )
  }
}
