import type { AgentCycleRequest } from './types'

export type PresetKey =
  | 'hyperliquidSmoke'
  | 'hyperliquidTenSymbols'
  | 'orderlyMantle'
  | 'advancedBenchmark'

export type Preset = {
  key: PresetKey
  label: string
  description: string
  advanced?: boolean
  payload: AgentCycleRequest
}

export const PRESETS: Record<PresetKey, Preset> = {
  hyperliquidSmoke: {
    key: 'hyperliquidSmoke',
    label: 'Hyperliquid Smoke',
    description: 'Fastest path. Five fixed symbols, no portfolio composition.',
    payload: {
      venue: 'hyperliquid',
      use_all_venue_symbols: false,
      symbols: ['BTC-PERP', 'ETH-PERP', 'SOL-PERP', 'HYPE-PERP', 'AVAX-PERP'],
      enable_elfa: false,
      samples_per_symbol: 1,
      min_ticks_per_symbol: 5,
      warmup_timeout_s: 45,
      enable_horizon_search: true,
      horizon_minutes: [30],
      enable_portfolio_composition: false,
      portfolio_budget_usd: 100,
    },
  },
  hyperliquidTenSymbols: {
    key: 'hyperliquidTenSymbols',
    label: 'Hyperliquid 10 Symbols',
    description: 'Normal demo. Universe scan with portfolio composition.',
    payload: {
      venue: 'hyperliquid',
      use_all_venue_symbols: true,
      hyperliquid_universe_max_symbols: 10,
      hyperliquid_universe_min_active_symbols: 5,
      hyperliquid_universe_quorum_grace_s: 20,
      enable_elfa: false,
      samples_per_symbol: 1,
      min_ticks_per_symbol: 5,
      warmup_timeout_s: 60,
      enable_horizon_search: true,
      horizon_minutes: [30],
      enable_portfolio_composition: true,
      portfolio_budget_usd: 100,
    },
  },
  orderlyMantle: {
    key: 'orderlyMantle',
    label: 'Orderly Mantle',
    description: 'Mantle / Orderly path with multi-horizon search.',
    payload: {
      venue: 'orderly',
      use_all_orderly_symbols: true,
      orderly_universe_max_symbols: 12,
      orderly_universe_quote: 'USDC',
      orderly_universe_best_effort: true,
      orderly_universe_min_active_symbols: 3,
      orderly_universe_quorum_grace_s: 35,
      samples_per_symbol: 1,
      min_ticks_per_symbol: 50,
      warmup_timeout_s: 180,
      enable_horizon_search: true,
      horizon_minutes: [30, 120, 480],
      enable_portfolio_composition: true,
      portfolio_budget_usd: 100,
    },
  },
  advancedBenchmark: {
    key: 'advancedBenchmark',
    label: 'Advanced Benchmark',
    description: 'Heavy run. Too slow for live demos. Elfa enabled.',
    advanced: true,
    payload: {
      venue: 'hyperliquid',
      use_all_venue_symbols: true,
      hyperliquid_universe_max_symbols: 30,
      hyperliquid_universe_min_active_symbols: 15,
      hyperliquid_universe_quorum_grace_s: 45,
      enable_elfa: true,
      elfa_best_effort: true,
      elfa_max_symbols_per_cycle: 6,
      samples_per_symbol: 1,
      min_ticks_per_symbol: 20,
      warmup_timeout_s: 180,
      enable_horizon_search: true,
      horizon_minutes: [30, 120, 480],
      enable_portfolio_composition: true,
      portfolio_budget_usd: 100,
    },
  },
}

export const PRESET_ORDER: PresetKey[] = [
  'hyperliquidSmoke',
  'hyperliquidTenSymbols',
  'orderlyMantle',
  'advancedBenchmark',
]

export const RUNNING_STAGES: [number, string][] = [
  [0, 'Connecting to backend'],
  [5, 'Collecting market ticks'],
  [20, 'Building market features'],
  [35, 'Collecting intelligence'],
  [50, 'Generating LLM strategies'],
  [70, 'Running formal verifier'],
  [82, 'Evaluating risk and walk-forward'],
  [92, 'Composing portfolio decision'],
  [98, 'Waiting for backend response'],
]

export const STORAGE_KEYS = {
  latestResult: 'xzro.latestCycleResult',
  latestPayload: 'xzro.latestCyclePayload',
  settings: 'xzro.frontendSettings',
} as const
