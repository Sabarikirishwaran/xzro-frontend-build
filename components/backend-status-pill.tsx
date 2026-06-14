'use client'

import { cn } from '@/lib/utils'
import type { HealthStatus } from '@/lib/hooks'

export function BackendStatusPill({
  status,
  venue,
  missingCount,
  className,
}: {
  status: HealthStatus
  venue?: string
  missingCount?: number
  className?: string
}) {
  const config = {
    checking: { dot: 'bg-xneutral animate-pulse', label: 'Checking', text: 'text-xtext-muted' },
    healthy: { dot: 'bg-xaccent-strong', label: 'Healthy', text: 'text-xaccent-strong' },
    offline: { dot: 'bg-xdanger', label: 'Offline', text: 'text-xdanger' },
  }[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-xborder bg-xpanel-2 px-3 py-1.5 text-xs font-medium',
        className,
      )}
    >
      <span className={cn('size-2 rounded-full', config.dot)} />
      <span className={config.text}>{config.label}</span>
      {status === 'healthy' && venue && (
        <span className="text-xtext-muted">· {venue}</span>
      )}
      {status === 'healthy' && missingCount ? (
        <span className="text-xwarning">· {missingCount} missing</span>
      ) : null}
    </span>
  )
}
