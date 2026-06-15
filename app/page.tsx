import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Database,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { DecisionPreviewCard } from '@/components/decision-preview-card'
import {
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/ui'

const systemSteps = [
  { label: 'Venue scan', icon: Database },
  { label: 'Candidate generation', icon: ScanSearch },
  { label: 'Risk and cost gates', icon: ShieldCheck },
  { label: 'Decision receipt', icon: CheckCircle2 },
]

const principles = [
  {
    title: 'Verifier-first',
    body: 'Every candidate is checked before being shown as a decision.',
  },
  {
    title: 'Cost-aware',
    body: 'Spread, slippage buffer, and funding impact are considered.',
  },
  {
    title: 'Decision clarity',
    body: 'Market context, candidate quality, and gate outcomes stay connected.',
  },
]

export default function LandingPage() {
  return (
    <AppShell>
      <section className="fade-in mx-auto max-w-[1200px] px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pb-28 lg:pt-32">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
          <div>
            <h1 className="max-w-3xl text-balance text-[2.7rem] font-semibold leading-[1.03] tracking-[-0.045em] text-text-primary sm:text-6xl lg:text-[4.15rem]">
              Verifier-first strategy intelligence for crypto markets.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-text-secondary sm:text-lg">
              xZro evaluates market data and strategy candidates, then
              returns a concise decision through cost and risk gates.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className={primaryButtonClass}>
                Open dashboard
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/about" className={secondaryButtonClass}>
                View system
              </Link>
            </div>
          </div>

          <DecisionPreviewCard />
        </div>
      </section>

      <section
        id="system"
        className="border-y border-border-subtle bg-surface-1/55"
      >
        <div className="mx-auto grid max-w-[1200px] divide-y divide-border-subtle px-4 sm:px-6 md:grid-cols-4 md:divide-x md:divide-y-0">
          {systemSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.label}
                className="flex items-center gap-3 py-5 md:px-5 md:first:pl-0 md:last:pr-0"
              >
                <span className="mono-number text-[11px] text-text-muted">
                  0{index + 1}
                </span>
                <Icon className="size-4 text-accent" strokeWidth={1.5} />
                <span className="text-sm text-text-secondary">{step.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:py-24">
        <div className="flex flex-col justify-between gap-4 border-b border-border-subtle pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-accent">
              Why xZro
            </p>
            <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-text-primary sm:text-3xl">
              Decision quality before action.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-text-secondary">
            A focused interface for market state, candidate quality, and gate
            outcomes.
          </p>
        </div>

        <div className="grid divide-y divide-border-subtle md:grid-cols-3 md:divide-x md:divide-y-0">
          {principles.map((item, index) => (
            <div
              key={item.title}
              className="py-8 md:px-7 md:first:pl-0 md:last:pr-0"
            >
              <span className="mono-number text-xs text-text-muted">
                0{index + 1}
              </span>
              <h3 className="mt-5 text-base font-medium text-text-primary">
                {item.title}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-border-subtle pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-text-secondary">
            Inspect the current market state in the strategy console.
          </p>
          <Link href="/dashboard" className={primaryButtonClass}>
            Open dashboard
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </AppShell>
  )
}
