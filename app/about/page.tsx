import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { primaryButtonClass } from '@/components/ui'

export const metadata: Metadata = {
  title: 'System',
  description: 'How the xZro verifier-first strategy decision flow works.',
}

const sections = [
  {
    title: 'What xZro does',
    body: 'xZro scans venue state, produces strategy candidates, checks their expected edge, and returns a verified decision.',
  },
  {
    title: 'How decisions are formed',
    body: 'Candidates are evaluated against expected edge, market costs, liquidity, and risk criteria.',
  },
  {
    title: 'What users receive',
    body: 'A concise decision summary, candidate set, gate results, and market features.',
  },
]

const flow = [
  'Venue state',
  'Feature extraction',
  'Candidate generation',
  'Gate checks',
  'Decision',
]

export default function AboutPage() {
  return (
    <AppShell>
      <section className="fade-in mx-auto max-w-[960px] px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">System</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-text-primary sm:text-5xl">
          From market state to verified decision.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary">
          xZro turns market data into a structured strategy decision through a
          disciplined verification flow.
        </p>

        <div className="mt-14 divide-y divide-border-subtle border-y border-border-subtle">
          {sections.map((section, index) => (
            <div
              key={section.title}
              className="grid gap-3 py-7 sm:grid-cols-[56px_220px_1fr]"
            >
              <span className="mono-number text-xs text-text-muted">
                0{index + 1}
              </span>
              <h2 className="text-sm font-medium text-text-primary">
                {section.title}
              </h2>
              <p className="max-w-xl text-sm leading-6 text-text-secondary">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="text-sm font-medium text-text-primary">System flow</h2>
          <div className="mt-5 flex flex-col border-y border-border-subtle sm:flex-row sm:items-center">
            {flow.map((step, index) => (
              <div
                key={step}
                className="flex flex-1 items-center justify-between border-b border-border-subtle py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0"
              >
                <span className="text-xs text-text-secondary">{step}</span>
                {index < flow.length - 1 && (
                  <ArrowRight className="size-3.5 text-text-muted" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Link href="/dashboard" className={`${primaryButtonClass} mt-10`}>
          Open dashboard
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </AppShell>
  )
}
