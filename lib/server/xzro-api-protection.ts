import 'server-only'

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { isIP } from 'node:net'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const SESSION_TTL_SECONDS = 8 * 60 * 60
const RATE_LIMIT_TIMEOUT_MS = 2_500
const MINIMUM_DEMO_KEY_LENGTH = 24

const COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Host-xzro-demo-session'
    : 'xzro-demo-session'

type LimitGroup = {
  global: Ratelimit
  ip: Ratelimit
  session?: Ratelimit
}

type RateLimiters = {
  access: LimitGroup
  cycle: LimitGroup
  health: LimitGroup
}

type SessionPayload = {
  expiresAt: number
  id: string
}

let rateLimiters: RateLimiters | null = null

export function jsonNoStore(
  body: unknown,
  init: ResponseInit = {},
): NextResponse {
  const headers = new Headers(init.headers)
  headers.set('Cache-Control', 'no-store, max-age=0')
  headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  headers.set('Pragma', 'no-cache')
  headers.set('Referrer-Policy', 'no-referrer')
  headers.set('X-Content-Type-Options', 'nosniff')

  return NextResponse.json(body, { ...init, headers })
}

export function isDemoAccessRequired() {
  return Boolean(process.env.FRONTEND_DEMO_KEY)
}

export function hasValidDemoConfiguration() {
  const key = process.env.FRONTEND_DEMO_KEY
  return !key || key.length >= MINIMUM_DEMO_KEY_LENGTH
}

export function isSameOriginRequest(req: Request) {
  const origin = req.headers.get('origin')
  const host =
    req.headers.get('x-forwarded-host') ?? req.headers.get('host')

  if (!origin || !host) return process.env.NODE_ENV !== 'production'

  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase()
  } catch {
    return false
  }
}

export function getClientIp(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    if (process.env.VERCEL !== '1') return null

    const candidate = req.headers
      .get('x-vercel-forwarded-for')
      ?.split(',')[0]
      ?.trim()

    return candidate && isIP(candidate) ? candidate : null
  }

  const forwarded =
    req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip')

  const candidate = forwarded?.split(',')[0]?.trim()

  if (candidate && isIP(candidate)) return candidate
  return '127.0.0.1'
}

function getIdentifierSecret() {
  return process.env.XZRO_BACKEND_API_KEY
}

function hashIdentifier(scope: string, value: string) {
  const secret = getIdentifierSecret()
  if (!secret) throw new Error('Identifier secret is not configured')

  return createHmac('sha256', secret)
    .update(`${scope}:${value}`)
    .digest('base64url')
}

function createRateLimiters() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  const redis = new Redis({
    url,
    token,
    retry: false,
    signal: () => AbortSignal.timeout(RATE_LIMIT_TIMEOUT_MS),
  })

  const build = (
    prefix: string,
    tokens: number,
    window: `${number} ${'s' | 'm' | 'h' | 'd'}`,
  ) =>
    new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tokens, window),
      analytics: false,
      ephemeralCache: new Map(),
      prefix,
      timeout: 0,
    })

  return {
    access: {
      global: build('xzro:access:global', 100, '15 m'),
      ip: build('xzro:access:ip', 5, '15 m'),
    },
    cycle: {
      global: build('xzro:cycle:global', 120, '60 s'),
      ip: build('xzro:cycle:ip', 8, '60 s'),
      session: build('xzro:cycle:session', 8, '60 s'),
    },
    health: {
      global: build('xzro:health:global', 300, '60 s'),
      ip: build('xzro:health:ip', 30, '60 s'),
      session: build('xzro:health:session', 30, '60 s'),
    },
  } satisfies RateLimiters
}

function getRateLimiters() {
  if (!rateLimiters) rateLimiters = createRateLimiters()
  return rateLimiters
}

async function applyLimit(
  limiter: Ratelimit,
  identifier: string,
) {
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      limiter.limit(identifier),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Rate limit request timed out')),
          RATE_LIMIT_TIMEOUT_MS,
        )
        timer.unref?.()
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function rateLimitedResponse(limit: number, remaining: number, reset: number) {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))

  return jsonNoStore(
    {
      error: 'Too many requests. Please wait and try again.',
      code: 'rate_limited',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(Math.max(0, remaining)),
        'X-RateLimit-Reset': String(reset),
      },
    },
  )
}

function protectionUnavailableResponse() {
  return jsonNoStore(
    {
      error: 'Service temporarily unavailable.',
      code: 'service_unavailable',
    },
    { status: 503 },
  )
}

function invalidSourceResponse() {
  return jsonNoStore(
    { error: 'Invalid request.', code: 'invalid_request' },
    { status: 400 },
  )
}

async function enforceLimits(
  req: NextRequest,
  groupName: keyof RateLimiters,
  sessionId?: string,
) {
  const ip = getClientIp(req)
  const limiters = getRateLimiters()

  if (!ip) return invalidSourceResponse()
  if (!limiters || !getIdentifierSecret()) {
    return protectionUnavailableResponse()
  }

  const group = limiters[groupName]

  try {
    const checks = [
      applyLimit(group.global, hashIdentifier(groupName, 'global')),
      applyLimit(group.ip, hashIdentifier(`${groupName}:ip`, ip)),
    ]

    if (group.session && sessionId) {
      checks.push(
        applyLimit(
          group.session,
          hashIdentifier(`${groupName}:session`, sessionId),
        ),
      )
    }

    const results = await Promise.all(checks)
    const blocked = results.find((result) => !result.success)

    if (blocked) {
      return rateLimitedResponse(
        blocked.limit,
        blocked.remaining,
        blocked.reset,
      )
    }

    return null
  } catch {
    return protectionUnavailableResponse()
  }
}

function sessionSigningKey() {
  const demoKey = process.env.FRONTEND_DEMO_KEY
  const backendKey = process.env.XZRO_BACKEND_API_KEY
  if (!demoKey || !backendKey) return null

  return createHash('sha256')
    .update(`xzro-demo-session:${demoKey}:${backendKey}`)
    .digest()
}

function signSessionPayload(payload: string) {
  const key = sessionSigningKey()
  if (!key) return null
  return createHmac('sha256', key).update(payload).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const leftHash = createHash('sha256').update(left).digest()
  const rightHash = createHash('sha256').update(right).digest()
  return timingSafeEqual(leftHash, rightHash)
}

export function verifyDemoCode(providedCode: string) {
  const expectedCode = process.env.FRONTEND_DEMO_KEY
  if (!expectedCode || expectedCode.length < MINIMUM_DEMO_KEY_LENGTH) {
    return false
  }

  return safeEqual(providedCode, expectedCode)
}

export function createDemoSession() {
  const payload: SessionPayload = {
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
    id: randomBytes(24).toString('base64url'),
  }
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = signSessionPayload(encoded)
  if (!signature) return null

  return {
    expires: new Date(payload.expiresAt),
    id: payload.id,
    token: `${encoded}.${signature}`,
  }
}

export function readDemoSession(req: NextRequest) {
  if (!isDemoAccessRequired()) {
    return { authenticated: true, id: null }
  }

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return { authenticated: false, id: null }

  const separator = token.lastIndexOf('.')
  if (separator < 1) return { authenticated: false, id: null }

  const encoded = token.slice(0, separator)
  const suppliedSignature = token.slice(separator + 1)
  const expectedSignature = signSessionPayload(encoded)

  if (!expectedSignature || !safeEqual(suppliedSignature, expectedSignature)) {
    return { authenticated: false, id: null }
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8'),
    ) as SessionPayload

    if (
      typeof payload.id !== 'string' ||
      payload.id.length < 20 ||
      typeof payload.expiresAt !== 'number' ||
      payload.expiresAt <= Date.now()
    ) {
      return { authenticated: false, id: null }
    }

    return { authenticated: true, id: payload.id }
  } catch {
    return { authenticated: false, id: null }
  }
}

export function setDemoSessionCookie(
  response: NextResponse,
  session: ReturnType<typeof createDemoSession>,
) {
  if (!session) return

  response.cookies.set(COOKIE_NAME, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: session.expires,
  })
}

export function clearDemoSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  })
}

export async function protectAccessAttempt(req: NextRequest) {
  if (!isSameOriginRequest(req)) return invalidSourceResponse()
  return enforceLimits(req, 'access')
}

async function protectAuthenticatedEndpoint(
  req: NextRequest,
  group: 'cycle' | 'health',
) {
  if (req.method !== 'GET' && !isSameOriginRequest(req)) {
    return invalidSourceResponse()
  }

  if (!hasValidDemoConfiguration()) {
    return protectionUnavailableResponse()
  }

  const rateLimited = await enforceLimits(req, group)
  if (rateLimited) return rateLimited

  const session = readDemoSession(req)

  if (!session.authenticated) {
    return jsonNoStore(
      { error: 'Access required.', code: 'access_required' },
      { status: 401 },
    )
  }

  if (!session.id) return null

  const limiters = getRateLimiters()
  if (!limiters || !getIdentifierSecret()) {
    return protectionUnavailableResponse()
  }

  try {
    const limiter = limiters[group].session
    if (!limiter) return null

    const result = await applyLimit(
      limiter,
      hashIdentifier(`${group}:session`, session.id),
    )

    return result.success
      ? null
      : rateLimitedResponse(result.limit, result.remaining, result.reset)
  } catch {
    return protectionUnavailableResponse()
  }
}

export function protectCycleEndpoint(req: NextRequest) {
  return protectAuthenticatedEndpoint(req, 'cycle')
}

export function protectHealthEndpoint(req: NextRequest) {
  return protectAuthenticatedEndpoint(req, 'health')
}

export function protectSessionStatus(req: NextRequest) {
  return enforceLimits(req, 'health')
}
