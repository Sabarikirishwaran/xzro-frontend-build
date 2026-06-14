export type Venue = 'orderly' | 'hyperliquid'

export type AgentCycleRequest = {
  venue?: Venue
  symbols?: string[]
  use_all_venue_symbols?: boolean
  use_all_orderly_symbols?: boolean
  hyperliquid_universe_max_symbols?: number
  hyperliquid_universe_min_active_symbols?: number
  hyperliquid_universe_quorum_grace_s?: number
  orderly_universe_max_symbols?: number
  orderly_universe_quote?: string
  orderly_universe_best_effort?: boolean
  orderly_universe_min_active_symbols?: number
  orderly_universe_quorum_grace_s?: number
  enable_elfa?: boolean
  elfa_best_effort?: boolean
  elfa_max_symbols_per_cycle?: number
  samples_per_symbol?: number
  min_ticks_per_symbol?: number
  warmup_timeout_s?: number
  enable_horizon_search?: boolean
  horizon_minutes?: number[]
  enable_portfolio_composition?: boolean
  portfolio_budget_usd?: number
}

export type MarketFeature = {
  symbol: string
  spread_pct?: number
  mid?: number
  return_5s_pct?: number
  return_30s_pct?: number
  return_1m_pct?: number
  realized_vol_1m_pct?: number
  order_book_imbalance_l1?: number
  order_book_imbalance_l5?: number
  trade_imbalance_30s?: number
  funding_rate?: number
  quote_age_ms?: number
  liquidity_score?: number
}

export type DirectionRow = {
  symbol: string
  horizon_seconds?: number
  prob_up?: number
  prob_down?: number
  prob_flat?: number
  direction?: string
  model_confidence?: number
  model_name?: string
  domain_warning?: string
}

export type SentimentRow = {
  source?: string
  symbol: string
  sentiment_score?: number
  social_momentum?: number
  attention_spike?: boolean
  credible_accounts_mentioning?: number
  narrative?: string
  risk_flags?: string[]
  confidence?: number
}

export type HorizonSearchRow = {
  horizon_minutes: number
  decision: string
  symbols?: string[]
  templates_generated?: number
  llm_templates_valid?: number
  fallback_templates?: number
  cache_hit_templates?: number
  repaired_templates?: number
  candidates_generated?: number
  scenario_passed?: number
  risk_validated?: number
  walk_forward_passed?: number
  overfit_passed?: number
  selected_for_critic?: number
  portfolio_selected?: number
  watchlisted?: number
  best_candidate_id?: string
  best_symbol?: string
  best_expected_net_return_pct?: number
  best_robust_score?: number
  best_survival_rate?: number
  min_required_edge_pct?: number
  reason?: string
}

export type PortfolioPlan = {
  plan_id?: string
  decision: string
  allocations?: any[]
  expected_net_return_pct?: number
  worst_case_net_return_pct?: number
  gross_exposure_usd?: number
  net_long_usd?: number
  net_short_usd?: number
  max_symbol_weight?: number
  max_horizon_weight?: number
  hedge_ratio?: number
  llm_rationale?: string
}

export type Rejection = {
  stage: string
  symbol?: string
  candidate_id?: string
  reason?: string
  error_type?: string
  error_message?: string
  active_symbols?: string[]
  skipped_symbols?: Record<string, number>
  [key: string]: any
}

export type AgentCycleResponse = {
  cycle_id: string
  ticks?: any[]
  features?: MarketFeature[]
  sentiments?: SentimentRow[]
  directions?: DirectionRow[]
  templates?: any[]
  formula_verifications?: any[]
  candidates_generated?: any[]
  scenario_evaluations?: any[]
  horizon_search?: HorizonSearchRow[]
  selected_horizon_minutes?: number | null
  portfolio_plan?: PortfolioPlan
  portfolio_validation?: any
  diversity_selection?: any
  overfit_metrics?: any[]
  walk_forward_results?: any[]
  candidates_validated?: any[]
  candidates_watchlisted?: any[]
  hook_events?: any[]
  last_mile_results?: any[]
  paper_orders?: any[]
  rejections?: Rejection[]
  [key: string]: any
}

export type HealthResponse = {
  ok?: boolean
  venue?: string
  missing?: string[]
  orderly_auto_universe?: Record<string, any>
  portfolio_composition?: Record<string, any>
  [key: string]: any
}

export type FrontendSettings = {
  defaultVenue: Venue
  defaultPreset: string
  enableAdvanced: boolean
  autoSaveResult: boolean
}
