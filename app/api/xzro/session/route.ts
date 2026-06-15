import { NextRequest } from 'next/server'
import {
  clearDemoSessionCookie,
  createDemoSession,
  hasValidDemoConfiguration,
  isDemoAccessRequired,
  jsonNoStore,
  protectAccessAttempt,
  protectSessionStatus,
  readDemoSession,
  setDemoSessionCookie,
  verifyDemoCode,
} from '@/lib/server/xzro-api-protection'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 4_096

export async function GET(req: NextRequest) {
  const blocked = await protectSessionStatus(req)
  if (blocked) return blocked

  if (!hasValidDemoConfiguration()) {
    return jsonNoStore(
      {
        error: 'Service temporarily unavailable.',
        code: 'server_config_invalid',
      },
      { status: 503 },
    )
  }

  const session = readDemoSession(req)

  return jsonNoStore({
    required: isDemoAccessRequired(),
    authenticated: session.authenticated,
  })
}

export async function POST(req: NextRequest) {
  const blocked = await protectAccessAttempt(req)
  if (blocked) return blocked

  if (!hasValidDemoConfiguration()) {
    return jsonNoStore(
      {
        error: 'Service temporarily unavailable.',
        code: 'service_unavailable',
      },
      { status: 503 },
    )
  }

  if (!isDemoAccessRequired()) {
    return jsonNoStore({ authenticated: true, required: false })
  }

  const contentType = (req.headers.get('content-type') ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase()
  const contentLength = Number(req.headers.get('content-length') ?? 0)

  if (
    contentType !== 'application/json' ||
    !Number.isFinite(contentLength) ||
    contentLength > MAX_BODY_BYTES
  ) {
    return jsonNoStore(
      { error: 'Invalid request.', code: 'invalid_request' },
      { status: 400 },
    )
  }

  try {
    const text = await req.text()
    if (!text || Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
      throw new Error('Invalid body')
    }

    const body = JSON.parse(text) as { accessCode?: unknown }
    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).some((key) => key !== 'accessCode')
    ) {
      throw new Error('Invalid body')
    }
    const accessCode =
      typeof body.accessCode === 'string' ? body.accessCode : ''

    if (!verifyDemoCode(accessCode)) {
      return jsonNoStore(
        { error: 'Access denied.', code: 'access_denied' },
        { status: 401 },
      )
    }

    const session = createDemoSession()
    if (!session) {
      return jsonNoStore(
        {
          error: 'Service temporarily unavailable.',
          code: 'server_config_missing',
        },
        { status: 503 },
      )
    }

    const response = jsonNoStore({ authenticated: true, required: true })
    setDemoSessionCookie(response, session)
    return response
  } catch {
    return jsonNoStore(
      { error: 'Invalid request.', code: 'invalid_request' },
      { status: 400 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  const blocked = await protectAccessAttempt(req)
  if (blocked) return blocked

  const response = jsonNoStore({ authenticated: false })
  clearDemoSessionCookie(response)
  return response
}
