import { cn } from '@/lib/utils'
import type { HealthState } from '@/lib/types'

const states: Record<
  HealthState,
  { label: string; dot: string; text: string }
> = {
  checking: {
    label: 'Checking backend',
    dot: 'animate-pulse bg-zinc-500',
    text: 'text-text-muted',
  },
  online: {
    label: 'Backend online',
    dot: 'bg-emerald-400',
    text: 'text-text-secondary',
  },
  offline: {
    label: 'Backend unavailable',
    dot: 'bg-rose-400',
    text: 'text-rose-300',
  },
  auth_error: {
    label: 'Auth failed',
    dot: 'bg-amber-300',
    text: 'text-amber-200',
  },
}

export function StatusBadge({
  state,
  compact = false,
  className,
}: {
  state: HealthState
  compact?: boolean
  className?: string
}) {
  const config = states[state]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white/[0.025] px-2.5 py-1.5 text-xs',
        config.text,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} />
      {!compact && config.label}
      <span className="sr-only">{compact ? config.label : ''}</span>
    </span>
  )
}
