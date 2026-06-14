import type { AgentCycleResponse } from '@/lib/types'

export type StrategyView = {
  id: string
  symbol: string
  family?: string
  side?: string
  forecastAssumption?: string
  executeIf?: string
  hookCondition?: string
  branches?: any
  freeParameters?: any
  horizonMinutes?: number
  verified?: boolean
  verification?: any
  candidateCount?: number
  raw: any
}

function pick<T = any>(obj: any, keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k] as T
  }
  return undefined
}

export function buildStrategyViews(result?: AgentCycleResponse | null): StrategyView[] {
  if (!result?.templates?.length) return []

  const verifications = result.formula_verifications ?? []
  const candidates = result.candidates_generated ?? []

  const verifById = new Map<string, any>()
  for (const v of verifications) {
    const id = pick<string>(v, ['strategy_template_id', 'template_id', 'id'])
    if (id) verifById.set(id, v)
  }

  const candidateCountById = new Map<string, number>()
  for (const c of candidates) {
    const id = pick<string>(c, ['strategy_template_id', 'template_id'])
    if (id) candidateCountById.set(id, (candidateCountById.get(id) ?? 0) + 1)
  }

  return result.templates.map((t: any, i: number) => {
    const id =
      pick<string>(t, ['strategy_template_id', 'template_id', 'id']) ?? `template-${i}`
    const verification = verifById.get(id)
    const verified =
      verification === undefined
        ? undefined
        : Boolean(
            pick<boolean>(verification, ['passed', 'verified', 'is_valid', 'valid']) ?? false,
          )
    const formula = pick<any>(t, ['abstract_formula', 'formula']) ?? {}

    return {
      id,
      symbol: pick<string>(t, ['symbol']) ?? 'unknown',
      family: pick<string>(t, ['strategy_family', 'family']),
      side: pick<string>(t, ['side', 'direction']),
      forecastAssumption: pick<string>(t, ['forecast_assumption', 'assumption']),
      executeIf:
        pick<string>(formula, ['execute_if']) ?? pick<string>(t, ['execute_if']),
      hookCondition: pick<string>(t, ['hook_condition', 'hook']),
      branches: pick<any>(formula, ['branches']) ?? pick<any>(t, ['branches']),
      freeParameters:
        pick<any>(formula, ['free_parameters']) ?? pick<any>(t, ['free_parameters', 'parameters']),
      horizonMinutes: pick<number>(t, ['horizon_minutes']),
      verified,
      verification,
      candidateCount: candidateCountById.get(id),
      raw: t,
    }
  })
}
