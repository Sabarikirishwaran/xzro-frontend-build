import { cn } from '@/lib/utils'
import type { DecisionTone } from '@/lib/types'

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('panel', className)} {...props}>
      {children}
    </div>
  )
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
      <div>
        <h2 className="text-sm font-medium tracking-[-0.01em] text-text-primary">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs leading-5 text-text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

const badgeTone: Record<DecisionTone, string> = {
  neutral: 'border-border-subtle bg-white/[0.035] text-text-secondary',
  success: 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300',
  warning: 'border-amber-300/20 bg-amber-300/[0.07] text-amber-200',
}

export function DataBadge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: DecisionTone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium',
        badgeTone[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export const primaryButtonClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45'

export const secondaryButtonClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border-subtle bg-white/[0.025] px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:border-border-strong hover:bg-white/[0.05] hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-45'
