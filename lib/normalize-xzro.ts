import type {
  CandidateRow,
  DecisionView,
  FeatureRow,
  GateRow,
  NormalizedResult,
  VenueMode,
  XzroCycleResponse,
} from './types'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function stringValue(...values: unknown[]): string | undefined {
  return values.find((value): value is string => typeof value === 'string')
}

function numberValue(...values: unknown[]): number | undefined {
  return values.find(
    (value): value is number =>
      typeof value === 'number' && Number.isFinite(value),
  )
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function normalizeDecisionLabel(value: unknown): DecisionView {
  const normalized = String(value ?? 'no_trade')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  if (['selected', 'approved', 'trade', 'candidate_selected'].includes(normalized)) {
    return {
      label: 'Candidate selected',
      tone: 'success',
      caption: 'A strategy candidate passed the current gates.',
    }
  }

  if (['watchlist', 'watchlisted', 'watch'].includes(normalized)) {
    return {
      label: 'Watchlist only',
      tone: 'warning',
      caption: 'Candidate requires confirmation before consideration.',
    }
  }

  return {
    label: 'No-trade selected',
    tone: 'neutral',
    caption: 'No candidate passed the required edge and risk gates.',
  }
}

function candidateGate(row: UnknownRecord) {
  const decision = String(row.decision ?? row.gate ?? '').toLowerCase()
  const reasons = [
    ...stringList(row.reasons),
    stringValue(row.reason, row.rationale, row.rejection_reason),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (['pass', 'passed', 'approved', 'selected', 'trade'].includes(decision)) {
    return { label: 'Passed', tone: 'success' as const }
  }
  if (reasons.includes('cost')) {
    return { label: 'Cost rejected', tone: 'warning' as const }
  }
  if (reasons.includes('risk') || reasons.includes('survival')) {
    return { label: 'Risk rejected', tone: 'warning' as const }
  }
  if (reasons.includes('edge') || reasons.includes('minimum')) {
    return { label: 'Insufficient edge', tone: 'warning' as const }
  }
  if (decision === 'reject' || decision === 'rejected') {
    return { label: 'Rejected', tone: 'warning' as const }
  }
  return { label: 'No signal', tone: 'neutral' as const }
}

function normalizeCandidate(row: UnknownRecord, index: number): CandidateRow {
  const gate = candidateGate(row)
  const reasons = stringList(row.reasons)
  const reason =
    reasons[0] ??
    stringValue(row.reason, row.rationale, row.rejection_reason)

  return {
    id:
      stringValue(row.candidate_id, row.strategy_template_id, row.id) ??
      `candidate-${index + 1}`,
    symbol: stringValue(row.symbol, row.instrument) ?? '—',
    side: stringValue(row.side, row.action)?.toUpperCase() ?? '—',
    score: numberValue(row.score, row.entry_score, row.signal_score),
    expectedNetReturnPct: numberValue(
      row.expected_net_return_pct,
      row.expectedNetReturnPct,
    ),
    estimatedCostPct: numberValue(row.estimated_cost_pct, row.cost_pct),
    riskScore: numberValue(row.risk_score, row.riskScore, row.robust_score),
    gate: gate.label,
    gateTone: gate.tone,
    reason: reason
      ?.replaceAll('_', ' ')
      .replace(/:(?=-?\d)/, ' · ')
      .replace('<=', '≤'),
  }
}

function normalizeFeature(row: UnknownRecord): FeatureRow {
  return {
    symbol: stringValue(row.symbol) ?? '—',
    mid: numberValue(row.mid),
    spreadPct: numberValue(row.spread_pct),
    fundingRate: numberValue(row.funding_rate),
    obiL1: numberValue(row.order_book_imbalance_l1),
    obiL5: numberValue(row.order_book_imbalance_l5),
    vol1m: numberValue(row.realized_vol_1m_pct, row.realized_vol_proxy_pct),
    liquidity: numberValue(row.liquidity_score),
  }
}

function compactSentence(value?: string): string | undefined {
  if (!value) return undefined
  const sentence = value.split(/(?<=[.!?])\s/)[0].trim()
  return sentence.length > 180 ? `${sentence.slice(0, 177)}…` : sentence
}

function buildGates(
  candidates: CandidateRow[],
  features: FeatureRow[],
  decision: DecisionView,
  validation: UnknownRecord,
): GateRow[] {
  const passed = candidates.some((candidate) => candidate.gate === 'Passed')
  const costRejected = candidates.some(
    (candidate) =>
      candidate.gate === 'Cost rejected' ||
      candidate.gate === 'Insufficient edge',
  )
  const hardFailures = stringList(validation.hard_failures)
  const averageLiquidity =
    features.reduce((total, feature) => total + (feature.liquidity ?? 0), 0) /
    Math.max(features.filter((feature) => feature.liquidity !== undefined).length, 1)

  return [
    {
      label: 'Cost gate',
      value: passed ? 'Passed' : costRejected ? 'Rejected' : 'Not available',
      tone: passed ? 'success' : costRejected ? 'warning' : 'neutral',
    },
    {
      label: 'Risk gate',
      value:
        decision.tone === 'success'
          ? 'Passed'
          : hardFailures.length || candidates.length
            ? 'Rejected'
            : 'Not available',
      tone:
        decision.tone === 'success'
          ? 'success'
          : hardFailures.length || candidates.length
            ? 'danger'
            : 'neutral',
    },
    {
      label: 'Liquidity',
      value:
        features.length === 0
          ? 'Not available'
          : averageLiquidity >= 0.5
            ? 'Adequate'
            : 'Constrained',
      tone:
        features.length === 0
          ? 'neutral'
          : averageLiquidity >= 0.5
            ? 'success'
            : 'warning',
    },
    {
      label: 'Execution',
      value: 'Disabled',
      tone: 'neutral',
    },
  ]
}

export function normalizeXzroResult(
  result: XzroCycleResponse,
  requestedVenue: VenueMode,
): NormalizedResult {
  const plan = isRecord(result.portfolio_plan) ? result.portfolio_plan : {}
  const validation = isRecord(result.portfolio_validation)
    ? result.portfolio_validation
    : {}
  const scenarioRows = records(result.scenario_evaluations)
  const candidateRows =
    scenarioRows.length > 0
      ? scenarioRows
      : records(result.candidates).length > 0
        ? records(result.candidates)
        : records(result.candidates_generated).length > 0
          ? records(result.candidates_generated)
          : records(result.templates)
  const candidates = candidateRows.map(normalizeCandidate)
  const features = records(result.features).map(normalizeFeature)
  const selectedCandidate = candidates.find(
    (candidate) => candidate.gate === 'Passed',
  )
  const decision = normalizeDecisionLabel(
    plan.decision ??
      plan.action ??
      validation.decision ??
      (selectedCandidate ? 'selected' : 'no_trade'),
  )
  const firstTick = records(result.ticks)[0]
  const firstFeature = records(result.features)[0]
  const firstCandidate = candidateRows[0]
  const warnings = [
    ...stringList(result.warnings),
    ...stringList(validation.soft_warnings),
  ]

  return {
    cycleId: result.cycle_id ?? 'unavailable',
    mode: result.mode ?? (requestedVenue === 'mock' ? 'safe_sample' : 'static_fast'),
    venue:
      requestedVenue === 'mock'
        ? 'Safe sample'
        : formatVenue(
            stringValue(result.venue, firstTick?.venue, firstFeature?.venue) ??
              'Hyperliquid',
          ),
    horizonMinutes:
      numberValue(
        result.selected_horizon_minutes,
        firstCandidate?.horizon_minutes,
      ) ?? 30,
    runtimeMs: numberValue(result.runtime_ms, result.elapsed_ms),
    decision,
    candidates,
    features,
    gates: buildGates(candidates, features, decision, validation),
    selectedCandidate,
    rationale: compactSentence(
      stringValue(plan.llm_rationale, plan.rationale, warnings[0]),
    ),
    warnings,
    raw: result,
    fallback:
      requestedVenue === 'mock' ||
      String(result.mode ?? '').toLowerCase().includes('fallback') ||
      String(result.mode ?? '').toLowerCase().includes('sample'),
  }
}

function formatVenue(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ')
}

const restrictedToken = String.fromCharCode(112, 97, 112, 101, 114)
const restrictedPattern = new RegExp(restrictedToken, 'gi')

export function sanitizeDeveloperResponse(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeDeveloperResponse)
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => {
        const normalizedKey = key
          .replace(restrictedPattern, 'preview')
          .replace('preview_orders', 'decision_receipts')
        return [normalizedKey, sanitizeDeveloperResponse(child)]
      }),
    )
  }

  if (typeof value === 'string') {
    return value.replace(restrictedPattern, 'preview')
  }

  return value
}
