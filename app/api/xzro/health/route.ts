import { NextRequest } from 'next/server'
import {
  jsonNoStore,
  protectHealthEndpoint,
} from '@/lib/server/xzro-api-protection'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BACKEND_TIMEOUT_MS = 8_000

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

export async function GET(req: NextRequest) {
  const blocked = await protectHealthEndpoint(req)
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

  try {
    const res = await fetch(`${backend.url}/api/health`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${backend.apiKey}`,
      },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    })

    if (!res.ok) {
      return jsonNoStore(
        { error: 'Service unavailable.', code: 'upstream_unavailable' },
        { status: 503 },
      )
    }

    return jsonNoStore({ ok: true })
  } catch {
    return jsonNoStore(
      { error: 'Service unavailable.', code: 'upstream_unavailable' },
      { status: 503 },
    )
  }
}
