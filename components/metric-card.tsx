import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/format'

type MetricCardProps = {
  label: string
  value: string | number
  hint?: string
  tone?: Tone
  icon?: React.ReactNode
}

const valueTone: Record<Tone, string> = {
  neutral: 'text-xtext',
  success: 'text-xaccent-strong',
  warning: 'text-xwarning',
  danger: 'text-xdanger',
  cyan: 'text-xcyan',
  violet: 'text-xviolet',
}

export function MetricCard({
  label,
  value,
  hint,
  tone = 'neutral',
  icon,
}: MetricCardProps) {
  return (
    <div className="x-panel flex flex-col gap-3 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-xtext-muted">
          {label}
        </span>
        {icon && <span className="text-xaccent-strong/70">{icon}</span>}
      </div>
      <div className={cn('font-heading text-2xl font-semibold tabular-nums', valueTone[tone])}>
        {value}
      </div>
      {hint && <p className="text-xs leading-relaxed text-xtext-muted">{hint}</p>}
    </div>
  )
}
