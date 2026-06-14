import { Check, Circle, Minus, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PipelineStage, PipelineStatus } from '@/lib/selectors'

const statusConfig: Record<
  PipelineStatus,
  { icon: typeof Check; ring: string; text: string }
> = {
  passed: { icon: Check, ring: 'border-xaccent-strong/50 bg-xaccent-strong/10 text-xaccent-strong', text: 'text-xtext' },
  running: { icon: Loader2, ring: 'border-xcyan/50 bg-xcyan/10 text-xcyan', text: 'text-xtext' },
  failed: { icon: X, ring: 'border-xdanger/50 bg-xdanger/10 text-xdanger', text: 'text-xtext' },
  skipped: { icon: Minus, ring: 'border-xborder bg-xpanel-2 text-xtext-muted', text: 'text-xtext-muted' },
  pending: { icon: Circle, ring: 'border-xborder bg-xpanel-2 text-xtext-muted', text: 'text-xtext-muted' },
}

export function PipelineTimeline({ stages }: { stages: PipelineStage[] }) {
  return (
    <ol className="flex flex-col">
      {stages.map((stage, i) => {
        const cfg = statusConfig[stage.status]
        const Icon = cfg.icon
        const isLast = i === stages.length - 1
        return (
          <li key={stage.id} className="relative flex gap-4 pb-5 last:pb-0">
            {!isLast && (
              <span className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-xborder" />
            )}
            <span
              className={cn(
                'relative z-10 grid size-8 shrink-0 place-items-center rounded-full border',
                cfg.ring,
              )}
            >
              <Icon
                className={cn('size-4', stage.status === 'running' && 'animate-spin')}
                strokeWidth={2}
              />
            </span>
            <div className="flex flex-1 items-start justify-between gap-3 pt-1">
              <div>
                <p className={cn('text-sm font-medium', cfg.text)}>{stage.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-xtext-muted">
                  {stage.description}
                </p>
              </div>
              {stage.count !== undefined && (
                <span className="shrink-0 font-mono text-xs tabular-nums text-xtext-muted">
                  {stage.count}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
