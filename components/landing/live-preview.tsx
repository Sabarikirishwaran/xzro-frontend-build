'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLatestCycleResult } from '@/lib/hooks'
import {
  getPaperOrderCount,
  getPortfolioDecision,
  getSymbolCount,
  getVenue,
} from '@/lib/selectors'
import { StatusBadge, MonoValue } from '@/components/primitives'
import { decisionLabel, decisionTone, shortId } from '@/lib/format'

export function LivePreview() {
  const { result, loaded } = useLatestCycleResult()

  return (
    <div className="x-panel rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-xtext">Live agent preview</h3>
        <Link
          href="/app"
          className="inline-flex items-center gap-1 text-xs text-xaccent-strong hover:underline"
        >
          Open dashboard <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {!loaded ? (
        <p className="text-sm text-xtext-muted">Loading…</p>
      ) : !result ? (
        <p className="text-sm leading-relaxed text-xtext-muted">
          No cycle loaded yet. Run a smoke test from the dashboard.
        </p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Field label="Cycle ID">
            <MonoValue>{shortId(result.cycle_id, 14)}</MonoValue>
          </Field>
          <Field label="Venue">
            <MonoValue>{getVenue(result)}</MonoValue>
          </Field>
          <Field label="Symbols">
            <MonoValue>{getSymbolCount(result)}</MonoValue>
          </Field>
          <Field label="Decision">
            <StatusBadge
              value={decisionLabel(getPortfolioDecision(result))}
              tone={decisionTone(getPortfolioDecision(result))}
            />
          </Field>
          <Field label="Paper orders">
            <MonoValue>{getPaperOrderCount(result)}</MonoValue>
          </Field>
        </dl>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs uppercase tracking-wide text-xtext-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
