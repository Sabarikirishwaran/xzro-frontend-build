import { NextResponse } from 'next/server'

export const maxDuration = 300

export async function POST(req: Request) {
  const backendUrl = process.env.XZRO_BACKEND_URL
  const apiKey = process.env.XZRO_BACKEND_API_KEY

  if (!backendUrl || !apiKey) {
    return NextResponse.json(
      { error: 'Service configuration missing' },
      { status: 500 },
    )
  }

  try {
    const payload = await req.json()

    if (
      !payload ||
      typeof payload !== 'object' ||
      !['hyperliquid', 'mock'].includes(payload.venue) ||
      !Array.isArray(payload.horizon_minutes)
    ) {
      return NextResponse.json(
        { error: 'Invalid scan payload' },
        { status: 400 },
      )
    }

    const res = await fetch(
      `${backendUrl.replace(/\/$/, '')}/api/agent/cycle`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    )

    const text = await res.text()

    try {
      return NextResponse.json(JSON.parse(text), { status: res.status })
    } catch {
      return NextResponse.json(
        { error: 'Service returned an unexpected response', raw: text },
        { status: res.status },
      )
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Service request failed' },
      { status: 503 },
    )
  }
}
