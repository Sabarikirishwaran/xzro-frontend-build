export type VenueMode = 'hyperliquid' | 'mock'

export type XzroCycleRequest = {
  venue: VenueMode
  symbols?: string[]
  use_all_venue_symbols: boolean
  hyperliquid_universe_max_symbols?: number
  max_symbols_deep_analysis?: number
  horizon_minutes: number[]
  portfolio_budget_usd: number
  include_raw_books?: boolean
  use_mock_on_error?: boolean
}

export type XzroHealth = {
  ok?: boolean
  auth?: string
  mode?: string
  venue?: string
  error?: string
  [key: string]: unknown
}

export type XzroCycleResponse = {
  ok?: boolean
  mode?: string
  cycle_id?: string
  runtime_ms?: number
  elapsed_ms?: number
  venue?: string
  features?: unknown[]
  directions?: unknown[]
  templates?: unknown[]
  candidates?: unknown[]
  candidates_generated?: unknown[]
  candidates_validated?: unknown[]
  candidates_watchlisted?: unknown[]
  scenario_evaluations?: unknown[]
  ticks?: unknown[]
  portfolio_plan?: Record<string, unknown>
  portfolio_validation?: Record<string, unknown>
  rejections?: unknown[]
  warnings?: unknown[]
  error?: string
  [key: string]: unknown
}

export type HealthState = 'checking' | 'online' | 'offline' | 'auth_error'

export type DecisionTone = 'neutral' | 'success' | 'warning'

export type DecisionView = {
  label: string
  caption: string
  tone: DecisionTone
}

export type CandidateRow = {
  id: string
  symbol: string
  side: string
  score?: number
  expectedNetReturnPct?: number
  estimatedCostPct?: number
  riskScore?: number
  gate: string
  gateTone: DecisionTone
  reason?: string
}

export type FeatureRow = {
  symbol: string
  mid?: number
  spreadPct?: number
  fundingRate?: number
  obiL1?: number
  obiL5?: number
  vol1m?: number
  liquidity?: number
}

export type GateRow = {
  label: string
  value: string
  tone: 'neutral' | 'success' | 'warning' | 'danger'
}

export type NormalizedResult = {
  cycleId: string
  mode: string
  venue: string
  horizonMinutes: number
  runtimeMs?: number
  decision: DecisionView
  candidates: CandidateRow[]
  features: FeatureRow[]
  gates: GateRow[]
  selectedCandidate?: CandidateRow
  rationale?: string
  warnings: string[]
  raw: XzroCycleResponse
  fallback: boolean
}
