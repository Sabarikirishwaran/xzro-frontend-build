import type { XzroCycleResponse } from './types'

export class XzroRequestError extends Error {
  code?: string
  status: number

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'XzroRequestError'
    this.status = status
    this.code = code
  }
}

type ApiEnvelope = {
  authenticated?: boolean
  code?: string
  error?: string
  [key: string]: unknown
}

export type XzroAccessStatus = {
  authenticated: boolean
}

async function parseResponse(res: Response): Promise<ApiEnvelope | null> {
  const text = await res.text()

  if (!text) return null

  try {
    return JSON.parse(text) as ApiEnvelope
  } catch {
    return { error: 'Unexpected service response.' }
  }
}

export async function runXzroCycle(
  budget: number,
): Promise<XzroCycleResponse> {
  const res = await fetch('/api/xzro/cycle', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ portfolio_budget_usd: budget }),
  })
  const data = await parseResponse(res)

  if (!res.ok) {
    throw new XzroRequestError(
      res.status === 408 || res.status === 504
        ? 'Market scan timed out.'
        : 'The scan could not be completed.',
      res.status,
      data?.code,
    )
  }

  return (data ?? {}) as XzroCycleResponse
}

export async function getXzroAccessStatus(): Promise<XzroAccessStatus> {
  const res = await fetch('/api/xzro/session', {
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })
  const data = await parseResponse(res)

  if (!res.ok) {
    throw new XzroRequestError(
      'Access status could not be checked.',
      res.status,
      data?.code,
    )
  }

  return {
    authenticated: data?.authenticated === true,
  }
}

export function buildLocalSafeResult(): XzroCycleResponse {
  return {
    ok: true,
    cycle_id: `reference_${Date.now().toString(36)}`,
    elapsed_ms: 4,
    features: [
      {
        symbol: 'BTC-PERP',
        mid: 63000,
        spread_pct: 0.01,
        funding_rate: -0.00008,
        order_book_imbalance_l1: -0.45,
        order_book_imbalance_l5: -0.3825,
        realized_vol_proxy_pct: 0.0436,
        liquidity_score: 1,
      },
      {
        symbol: 'ETH-PERP',
        mid: 3420,
        spread_pct: 0.014,
        funding_rate: 0.00004,
        order_book_imbalance_l1: 0.19,
        order_book_imbalance_l5: 0.16,
        realized_vol_proxy_pct: 0.052,
        liquidity_score: 0.94,
      },
      {
        symbol: 'SOL-PERP',
        mid: 146.2,
        spread_pct: 0.022,
        funding_rate: 0.00011,
        order_book_imbalance_l1: 0.08,
        order_book_imbalance_l5: 0.04,
        realized_vol_proxy_pct: 0.071,
        liquidity_score: 0.86,
      },
    ],
    scenario_evaluations: [
      {
        candidate_id: 'reference_btc_30m',
        symbol: 'BTC-PERP',
        side: 'short',
        robust_score: 0,
        expected_net_return_pct: -0.063,
        estimated_cost_pct: 0.078,
        decision: 'reject',
        reasons: ['net edge below minimum'],
      },
      {
        candidate_id: 'reference_eth_30m',
        symbol: 'ETH-PERP',
        side: 'long',
        robust_score: 0,
        expected_net_return_pct: -0.041,
        estimated_cost_pct: 0.061,
        decision: 'reject',
        reasons: ['cost-adjusted edge below minimum'],
      },
      {
        candidate_id: 'reference_sol_30m',
        symbol: 'SOL-PERP',
        side: 'long',
        robust_score: 0.12,
        expected_net_return_pct: 0.018,
        estimated_cost_pct: 0.052,
        decision: 'reject',
        reasons: ['risk threshold not met'],
      },
    ],
    portfolio_plan: {
      decision: 'no_trade',
    },
    portfolio_validation: {
      decision: 'no_trade',
      hard_failures: [],
      soft_warnings: [],
      approved_candidate_ids: [],
    },
    warnings: [],
  }
}
