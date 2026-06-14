import type { AgentCycleResponse, Rejection } from '@/lib/types'
import type { Tone } from '@/lib/format'

export type Severity = 'hard' | 'soft' | 'fallback' | 'info'

export type AuditRow = {
  stage: string
  symbol?: string
  candidateId?: string
  severity: Severity
  reason: string
  details: Record<string, any>
}

export const severityTone: Record<Severity, Tone> = {
  hard: 'danger',
  soft: 'warning',
  fallback: 'cyan',
  info: 'neutral',
}

export const severityLabel: Record<Severity, string> = {
  hard: 'Hard failure',
  soft: 'Soft warning',
  fallback: 'Best-effort',
  info: 'Info',
}

function classifySeverity(r: Rejection): Severity {
  const stage = (r.stage ?? '').toLowerCase()
  const reason = `${r.reason ?? ''} ${r.error_type ?? ''}`.toLowerCase()
  if (stage.startsWith('elfa') || reason.includes('fallback') || reason.includes('best_effort')) {
    return 'fallback'
  }
  if (
    reason.includes('warn') ||
    stage.includes('portfolio_validation') ||
    reason.includes('degrade')
  ) {
    return 'soft'
  }
  if (
    stage.includes('verification') ||
    stage.includes('scenario') ||
    stage.includes('risk') ||
    stage.includes('walk_forward') ||
    reason.includes('fail') ||
    reason.includes('reject') ||
    reason.includes('error')
  ) {
    return 'hard'
  }
  return 'info'
}

const KNOWN = new Set([
  'stage',
  'symbol',
  'candidate_id',
  'reason',
  'error_type',
  'error_message',
])

export function buildAuditRows(result?: AgentCycleResponse | null): AuditRow[] {
  if (!result?.rejections?.length) return []
  return result.rejections.map((r) => {
    const details: Record<string, any> = {}
    for (const [k, v] of Object.entries(r)) {
      if (!KNOWN.has(k)) details[k] = v
    }
    return {
      stage: r.stage ?? 'unknown',
      symbol: r.symbol,
      candidateId: r.candidate_id,
      severity: classifySeverity(r),
      reason: r.reason ?? r.error_message ?? r.error_type ?? '—',
      details,
    }
  })
}

export const SEVERITY_ORDER: Severity[] = ['hard', 'soft', 'fallback', 'info']
