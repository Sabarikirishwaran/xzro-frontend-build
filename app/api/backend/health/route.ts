import { NextResponse } from 'next/server'

export async function GET() {
  const backendUrl = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'
  try {
    const res = await fetch(`${backendUrl}/health`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Backend unavailable. Start the FastAPI server or check BACKEND_URL.',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 503 },
    )
  }
}
