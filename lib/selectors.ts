import type { AgentCycleResponse } from './types'

export type PipelineStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped'

export type PipelineStage = {
  id: string
  label: string
  description: string
  status: PipelineStatus
  count?: number
}

export function getVenue(result?: AgentCycleResponse | null): string {
  return result?.ticks?.[0]?.venue ?? result?.features?.[0]?.venue ?? 'unknown'
}

export function getSymbolCount(result?: AgentCycleResponse | null): number {
  if (!result?.features) return 0
  return new Set(result.features.map((f) => f.symbol)).size
}

export function getPaperOrderCount(result?: AgentCycleResponse | null): number {
  return result?.paper_orders?.length ?? 0
}

export function getPortfolioDecision(result?: AgentCycleResponse | null): string {
  return result?.portfolio_plan?.decision ?? 'unknown'
}

export function getElfaFallbackCount(result?: AgentCycleResponse | null): number {
  if (!result?.rejections) return 0
  return result.rejections.filter((r) =>
    (r.stage ?? '').toLowerCase().startsWith('elfa'),
  ).length
}

export function getPipelineStages(
  result?: AgentCycleResponse | null,
): PipelineStage[] {
  const r = result
  const has = (arr?: any[]) => (arr?.length ?? 0) > 0
  const passOrPending = (cond: boolean, count?: number): PipelineStatus =>
    !r ? 'pending' : cond ? 'passed' : 'pending'

  return [
    {
      id: 'market-data',
      label: 'Market Data',
      description: 'Live ticks collected from the venue feed.',
      status: passOrPending(has(r?.ticks)),
      count: r?.ticks?.length,
    },
    {
      id: 'features',
      label: 'Features',
      description: 'Order-flow and microstructure features.',
      status: passOrPending(has(r?.features)),
      count: r?.features?.length,
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      description: 'Direction priors and sentiment fallback.',
      status: passOrPending(has(r?.directions)),
      count: r?.directions?.length,
    },
    {
      id: 'llm-strategy',
      label: 'LLM Strategy',
      description: 'Conditional strategy templates proposed.',
      status: passOrPending(has(r?.templates)),
      count: r?.templates?.length,
    },
    {
      id: 'formal-verifier',
      label: 'Formal Verifier',
      description: 'Each formula checked before becoming a candidate.',
      status: passOrPending(has(r?.formula_verifications)),
      count: r?.formula_verifications?.length,
    },
    {
      id: 'scenario',
      label: 'Scenario Checks',
      description: 'Candidates evaluated against scenarios.',
      status: passOrPending(has(r?.scenario_evaluations)),
      count: r?.scenario_evaluations?.length,
    },
    {
      id: 'risk',
      label: 'Risk Validation',
      description: 'Cost, slippage, funding and exposure gates.',
      status: passOrPending(has(r?.candidates_validated)),
      count: r?.candidates_validated?.length,
    },
    {
      id: 'walk-forward',
      label: 'Walk-Forward',
      description: 'Out-of-sample and overfit reality checks.',
      status: passOrPending(has(r?.walk_forward_results)),
      count: r?.walk_forward_results?.length,
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      description: 'Approve, watch, or no-trade decision.',
      status: passOrPending(!!r?.portfolio_plan),
    },
    {
      id: 'paper-execution',
      label: 'Paper Execution',
      description: 'Simulated orders, only if edge survives.',
      status: !r
        ? 'pending'
        : getPaperOrderCount(r) > 0
          ? 'passed'
          : 'skipped',
      count: r?.paper_orders?.length,
    },
  ]
}
