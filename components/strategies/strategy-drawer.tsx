'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { StatusBadge } from '@/components/primitives'
import { RawJsonViewer } from '@/components/raw-json-viewer'
import type { StrategyView } from '@/components/strategies/strategy-utils'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-xborder px-5 py-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-xtext-muted">{title}</p>
      {children}
    </div>
  )
}

export function StrategyDrawer({
  strategy,
  onClose,
}: {
  strategy: StrategyView | null
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!strategy) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <aside className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-xborder bg-xpanel x-scroll">
        <header className="sticky top-0 flex items-start justify-between gap-4 border-b border-xborder bg-xpanel/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="font-mono text-lg font-semibold text-xtext">{strategy.symbol}</p>
            <p className="mt-0.5 font-mono text-xs text-xtext-muted">{strategy.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {strategy.verified === undefined ? (
              <StatusBadge value="Unverified" tone="neutral" dot />
            ) : strategy.verified ? (
              <StatusBadge value="Verified" tone="success" dot />
            ) : (
              <StatusBadge value="Failed" tone="danger" dot />
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-xborder p-1.5 text-xtext-muted transition-colors hover:text-xtext"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 px-5 py-4 text-sm">
          <div>
            <p className="text-xs text-xtext-muted">Family</p>
            <p className="text-xtext-soft">{strategy.family ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-xtext-muted">Side</p>
            <p className="text-xtext-soft">{strategy.side ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-xtext-muted">Horizon</p>
            <p className="text-xtext-soft">
              {strategy.horizonMinutes !== undefined ? `${strategy.horizonMinutes}m` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-xtext-muted">Candidates</p>
            <p className="text-xtext-soft">{strategy.candidateCount ?? 0}</p>
          </div>
        </div>

        {strategy.forecastAssumption && (
          <Section title="Forecast assumption">
            <p className="text-sm leading-relaxed text-xtext-soft">{strategy.forecastAssumption}</p>
          </Section>
        )}

        {strategy.executeIf && (
          <Section title="Abstract formula — execute_if">
            <code className="block whitespace-pre-wrap rounded-lg bg-xbg/60 px-3 py-2 font-mono text-xs leading-relaxed text-xaccent">
              {strategy.executeIf}
            </code>
          </Section>
        )}

        {strategy.hookCondition && (
          <Section title="Hook condition">
            <code className="block whitespace-pre-wrap rounded-lg bg-xbg/60 px-3 py-2 font-mono text-xs leading-relaxed text-xcyan">
              {strategy.hookCondition}
            </code>
          </Section>
        )}

        {strategy.branches !== undefined && (
          <Section title="Branches">
            <RawJsonViewer data={strategy.branches} defaultOpen />
          </Section>
        )}

        {strategy.freeParameters !== undefined && (
          <Section title="Free parameters">
            <RawJsonViewer data={strategy.freeParameters} defaultOpen />
          </Section>
        )}

        {strategy.verification !== undefined && (
          <Section title="Formal verification result">
            <RawJsonViewer data={strategy.verification} defaultOpen />
          </Section>
        )}

        <Section title="Raw template">
          <RawJsonViewer data={strategy.raw} />
        </Section>
      </aside>
    </div>
  )
}
