import type {
  XzroCycleRequest,
  XzroCycleResponse,
  XzroHealth,
} from './types'

export class XzroRequestError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'XzroRequestError'
    this.status = status
    this.details = details
  }
}

async function parseResponse(res: Response) {
  const text = await res.text()

  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { error: 'Unexpected response from backend.' }
  }
}

export async function getXzroHealth(): Promise<XzroHealth> {
  const res = await fetch('/api/xzro/health', { cache: 'no-store' })
  const data = await parseResponse(res)

  if (!res.ok) {
    throw new XzroRequestError(
      res.status === 401 || res.status === 403
        ? 'Authentication failed.'
        : 'Backend unavailable.',
      res.status,
      data,
    )
  }

  return (data ?? {}) as XzroHealth
}

export async function runXzroCycle(
  payload: XzroCycleRequest,
): Promise<XzroCycleResponse> {
  const res = await fetch('/api/xzro/cycle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseResponse(res)

  if (!res.ok) {
    const record =
      data && typeof data === 'object' ? (data as Record<string, unknown>) : null
    const detail =
      record?.detail && typeof record.detail === 'object'
        ? (record.detail as Record<string, unknown>)
        : null
    const backendMessage =
      typeof detail?.message === 'string'
        ? detail.message
        : typeof record?.error === 'string'
          ? record.error
          : null

    throw new XzroRequestError(
      res.status === 401 || res.status === 403
        ? 'Authentication failed.'
        : res.status === 408 || res.status === 504
          ? 'Market scan timed out.'
          : backendMessage || 'Backend rejected the request.',
      res.status,
      data,
    )
  }

  return (data ?? {}) as XzroCycleResponse
}

export function buildHyperliquidPayload(
  budget = 100,
  includeRawBooks = false,
  useFallback = true,
): XzroCycleRequest {
  return {
    venue: 'hyperliquid',
    use_all_venue_symbols: true,
    hyperliquid_universe_max_symbols: 8,
    max_symbols_deep_analysis: 8,
    horizon_minutes: [30],
    portfolio_budget_usd: budget,
    include_raw_books: includeRawBooks,
    use_mock_on_error: useFallback,
  }
}

export function buildSafeSamplePayload(budget = 100): XzroCycleRequest {
  return {
    venue: 'mock',
    symbols: ['BTC-PERP', 'ETH-PERP', 'SOL-PERP'],
    use_all_venue_symbols: false,
    horizon_minutes: [30],
    portfolio_budget_usd: budget,
  }
}

export function buildLocalSafeResult(): XzroCycleResponse {
  return {
    ok: true,
    mode: 'safe_sample',
    cycle_id: `safe_${Date.now().toString(36)}`,
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
        candidate_id: 'safe_btc_30m',
        symbol: 'BTC-PERP',
        side: 'short',
        robust_score: 0,
        expected_net_return_pct: -0.063,
        estimated_cost_pct: 0.078,
        decision: 'reject',
        reasons: ['net edge below minimum'],
      },
      {
        candidate_id: 'safe_eth_30m',
        symbol: 'ETH-PERP',
        side: 'long',
        robust_score: 0,
        expected_net_return_pct: -0.041,
        estimated_cost_pct: 0.061,
        decision: 'reject',
        reasons: ['cost-adjusted edge below minimum'],
      },
      {
        candidate_id: 'safe_sol_30m',
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
      llm_rationale: 'No candidate cleared the current cost and risk thresholds.',
    },
    portfolio_validation: {
      decision: 'no_trade',
      hard_failures: [],
      soft_warnings: ['safe sample used'],
      approved_candidate_ids: [],
    },
    warnings: ['Local safe sample loaded.'],
  }
}
