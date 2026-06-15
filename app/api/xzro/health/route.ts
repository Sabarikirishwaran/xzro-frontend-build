import { NextResponse } from 'next/server'

export async function GET() {
  const backendUrl = process.env.XZRO_BACKEND_URL
  const apiKey = process.env.XZRO_BACKEND_API_KEY

  if (!backendUrl || !apiKey) {
    return NextResponse.json(
      { error: 'Backend configuration missing' },
      { status: 500 },
    )
  }

  try {
    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/health`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    })

    const text = await res.text()

    try {
      return NextResponse.json(JSON.parse(text), { status: res.status })
    } catch {
      return NextResponse.json(
        { error: 'Backend returned non-JSON response', raw: text },
        { status: res.status },
      )
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Backend unavailable' },
      { status: 503 },
    )
  }
}
