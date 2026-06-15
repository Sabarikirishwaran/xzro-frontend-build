export function formatPct(value?: number, digits = 3): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  return `${value.toFixed(digits)}%`
}

export function formatPrice(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 4 })
}

export function formatDuration(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  if (value < 1000) return `${Math.round(value)}ms`
  return `${(value / 1000).toFixed(1)}s`
}

export function shortId(value?: string, length = 14): string {
  if (!value) return '—'
  return value.length > length ? `${value.slice(0, length)}…` : value
}

export function formatTime(value?: Date | null): string {
  if (!value) return 'Never'
  return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
