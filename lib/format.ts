export function formatPct(
  value?: number,
  opts: { digits?: number; sign?: boolean } = {},
): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  const { digits = 3, sign = false } = opts
  const str = `${value.toFixed(digits)}%`
  if (sign && value > 0) return `+${str}`
  return str
}

export function formatUsd(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

export function formatNum(value?: number, digits = 4): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  return value.toLocaleString('en-US', { maximumFractionDigits: digits })
}

export function shortId(id?: string, len = 10): string {
  if (!id) return '—'
  if (id.length <= len) return id
  return `${id.slice(0, len)}…`
}

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'cyan' | 'violet'

export function decisionTone(decision?: string): Tone {
  switch ((decision ?? '').toLowerCase()) {
    case 'approved':
    case 'trade':
      return 'success'
    case 'watch':
    case 'pending':
      return 'cyan'
    case 'reject':
      return 'danger'
    case 'no_trade':
    default:
      return 'neutral'
  }
}

export function decisionLabel(decision?: string): string {
  switch ((decision ?? '').toLowerCase()) {
    case 'approved':
      return 'Approved'
    case 'trade':
      return 'Trade'
    case 'watch':
      return 'Watch'
    case 'no_trade':
      return 'No Trade'
    case 'reject':
      return 'Rejected'
    case 'unknown':
      return 'Unknown'
    default:
      return decision ?? 'Unknown'
  }
}
