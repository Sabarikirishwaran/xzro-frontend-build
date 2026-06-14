import { NextResponse } from 'next/server'

export const maxDuration = 300

export async function POST(req: Request) {
  const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'
  const body = await req.json()

  try {
    const res = await fetch(`${backendUrl}/agent/cycle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
      {
        error: 'Backend unavailable',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 503 },
    )
  }
}
