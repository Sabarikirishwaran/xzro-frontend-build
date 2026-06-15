import { NextRequest } from 'next/server'
import {
  createBrowserSession,
  hasValidSessionConfiguration,
  jsonNoStore,
  protectSessionStatus,
  readBrowserSession,
  setBrowserSessionCookie,
} from '@/lib/server/xzro-api-protection'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const blocked = await protectSessionStatus(req)
  if (blocked) return blocked

  if (!hasValidSessionConfiguration()) {
    return jsonNoStore(
      {
        error: 'Service temporarily unavailable.',
        code: 'server_config_invalid',
      },
      { status: 503 },
    )
  }

  const currentSession = readBrowserSession(req)
  if (currentSession.authenticated) {
    return jsonNoStore({ authenticated: true })
  }

  const session = createBrowserSession()
  if (!session) {
    return jsonNoStore(
      {
        error: 'Service temporarily unavailable.',
        code: 'server_config_missing',
      },
      { status: 503 },
    )
  }

  const response = jsonNoStore({ authenticated: true })
  setBrowserSessionCookie(response, session)
  return response
}
