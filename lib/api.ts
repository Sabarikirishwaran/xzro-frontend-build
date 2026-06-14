import type { AgentCycleRequest, AgentCycleResponse, HealthResponse } from './types'

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/backend/health', { cache: 'no-store' })
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

export async function runAgentCycle(
  payload: AgentCycleRequest,
): Promise<AgentCycleResponse> {
  const res = await fetch('/api/backend/agent-cycle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) {
    const detail = data?.detail
    const message =
      detail?.message || data?.message || `Agent cycle failed: ${res.status}`
    const error = new Error(message) as Error & { detail?: unknown; status?: number }
    error.detail = detail ?? data
    error.status = res.status
    throw error
  }
  return data as AgentCycleResponse
}
