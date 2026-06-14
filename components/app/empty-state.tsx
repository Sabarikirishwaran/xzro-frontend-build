import Link from 'next/link'
import { Inbox } from 'lucide-react'

export function EmptyState({
  title = 'No agent cycle has been run yet.',
  description = 'Start with a 5-symbol Hyperliquid smoke test.',
  icon,
  cta = true,
}: {
  title?: string
  description?: string
  icon?: React.ReactNode
  cta?: boolean
}) {
  return (
    <div className="x-panel flex flex-col items-center gap-4 rounded-2xl px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl border border-xborder bg-xpanel-2 text-xtext-muted">
        {icon ?? <Inbox className="size-6" strokeWidth={1.5} />}
      </span>
      <div>
        <h3 className="font-heading text-lg font-semibold text-xtext">{title}</h3>
        <p className="mt-1 text-sm text-xtext-muted">{description}</p>
      </div>
      {cta && (
        <Link
          href="/app/run"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Run Agent Cycle
        </Link>
      )}
    </div>
  )
}
