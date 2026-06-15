import { randomUUID } from 'node:crypto'
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

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value)
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

function finiteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined
}

function firstFiniteNumber(...values: unknown[]) {
  return values.map(finiteNumber).find((value) => value !== undefined)
}

function safeSymbol(value: unknown) {
  if (typeof value !== 'string') return 'UNKNOWN'
  const normalized = value.trim().toUpperCase()
  return /^[A-Z0-9][A-Z0-9._/-]{0,31}$/.test(normalized)
    ? normalized
    : 'UNKNOWN'
}

function safeSide(value: unknown) {
  const normalized = String(value ?? '').toLowerCase()
  return ['long', 'short', 'flat'].includes(normalized)
    ? normalized
    : 'flat'
}

function safeCandidateDecision(value: unknown) {
  const normalized = String(value ?? '').toLowerCase()
  if (
    ['pass', 'passed', 'accept', 'accepted', 'approved', 'selected', 'trade']
      .includes(normalized)
  ) {
    return 'approved'
  }
  if (['watch', 'watchlist', 'watchlisted'].includes(normalized)) {
    return 'watchlist'
  }
  return 'reject'
}

function safePortfolioDecision(value: unknown) {
  const normalized = String(value ?? '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  if (
    ['selected', 'accepted', 'approved', 'trade', 'candidate_selected']
      .includes(normalized)
  ) {
    return 'selected'
  }
  if (['watch', 'watchlist', 'watchlisted'].includes(normalized)) {
    return 'watchlist'
  }
  return 'no_trade'
}

function canonicalReason(row: UnknownRecord) {
  const reasonValues = Array.isArray(row.reasons)
    ? row.reasons
    : [row.reason, row.rationale, row.rejection_reason]
  const reason = reasonValues
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase()

  if (reason.includes('flat') || safeSide(row.side ?? row.action) === 'flat') {
    return 'market direction is flat'
  }
  if (reason.includes('liquidity')) return 'liquidity threshold not met'
  if (reason.includes('risk') || reason.includes('survival')) {
    return 'risk threshold not met'
  }
  if (reason.includes('cost')) return 'cost-adjusted edge below minimum'
  if (reason.includes('edge') || reason.includes('minimum')) {
    return 'net edge below minimum'
  }
  return 'candidate did not pass verification'
}

function sanitizeCandidate(value: unknown, index: number) {
  if (!isRecord(value)) return null

  const decision = safeCandidateDecision(value.decision ?? value.gate)

  return {
    candidate_id: `candidate-${index + 1}`,
    symbol: safeSymbol(value.symbol ?? value.instrument),
    side: safeSide(value.side ?? value.action),
    decision,
    reasons: decision === 'approved' ? [] : [canonicalReason(value)],
    score: firstFiniteNumber(
      value.score,
      value.entry_score,
      value.signal_score,
    ),
    expected_net_return_pct: firstFiniteNumber(
      value.expected_net_return_pct,
      value.expectedNetReturnPct,
    ),
    estimated_cost_pct: firstFiniteNumber(
      value.estimated_cost_pct,
      value.cost_pct,
    ),
    risk_score: firstFiniteNumber(
      value.risk_score,
      value.riskScore,
      value.robust_score,
    ),
    horizon_minutes: 30,
  }
}

function sanitizeFeature(value: unknown) {
  if (!isRecord(value)) return null

  return {
    symbol: safeSymbol(value.symbol),
    mid: finiteNumber(value.mid),
    spread_pct: finiteNumber(value.spread_pct),
    funding_rate: finiteNumber(value.funding_rate),
    order_book_imbalance_l1: finiteNumber(value.order_book_imbalance_l1),
    order_book_imbalance_l5: finiteNumber(value.order_book_imbalance_l5),
    realized_vol_1m_pct: firstFiniteNumber(
      value.realized_vol_1m_pct,
      value.realized_vol_proxy_pct,
    ),
    liquidity_score: finiteNumber(value.liquidity_score),
  }
}

function firstRecordArray(data: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = data[key]
    if (Array.isArray(value) && value.some(isRecord)) return value
  }
  return []
}

function sanitizeCycleResponse(value: unknown) {
  if (!isRecord(value)) throw new Error('Invalid response')

  const plan = isRecord(value.portfolio_plan) ? value.portfolio_plan : {}
  const validation = isRecord(value.portfolio_validation)
    ? value.portfolio_validation
    : {}
  const candidates = firstRecordArray(value, [
    'scenario_evaluations',
    'candidates',
    'candidates_generated',
    'templates',
  ])
    .slice(0, 64)
    .map(sanitizeCandidate)
    .filter((item) => item !== null)
  const features = (Array.isArray(value.features) ? value.features : [])
    .slice(0, 64)
    .map(sanitizeFeature)
    .filter((item) => item !== null)
  const decision = safePortfolioDecision(
    plan.decision ?? plan.action ?? validation.decision,
  )
  const hasHardFailure =
    Array.isArray(validation.hard_failures) &&
    validation.hard_failures.length > 0

  return {
    ok: value.ok === true,
    cycle_id: `cycle_${randomUUID().replaceAll('-', '').slice(0, 12)}`,
    runtime_ms: firstFiniteNumber(value.runtime_ms, value.elapsed_ms),
    venue: 'hyperliquid',
    selected_horizon_minutes: 30,
    features,
    scenario_evaluations: candidates,
    portfolio_plan: { decision },
    portfolio_validation: {
      decision,
      hard_failures: hasHardFailure ? ['verification_failed'] : [],
      soft_warnings: [],
      approved_candidate_ids: candidates
        .filter((candidate) => candidate.decision === 'approved')
        .map((candidate) => candidate.candidate_id),
    },
    warnings: [],
  }
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
    return jsonNoStore(sanitizeCycleResponse(data))
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
