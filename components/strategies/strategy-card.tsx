'use client'

import { ArrowRight, ShieldCheck, ShieldX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/primitives'
import type { StrategyView } from '@/components/strategies/strategy-utils'

export function StrategyCard({
  strategy,
  onOpen,
}: {
  strategy: StrategyView
  onOpen: (s: StrategyView) => void
}) {
  const verified = strategy.verified
  return (
    <button
      type="button"
      onClick={() => onOpen(strategy)}
      className="x-panel group flex flex-col gap-3 rounded-2xl p-4 text-left transition-colors hover:border-xborder-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold text-xtext">{strategy.symbol}</p>
          <p className="mt-0.5 text-xs text-xtext-muted">{strategy.family ?? 'strategy'}</p>
        </div>
        {verified === undefined ? (
          <StatusBadge value="Unverified" tone="neutral" dot />
        ) : verified ? (
          <StatusBadge value="Verified" tone="success" dot />
        ) : (
          <StatusBadge value="Failed" tone="danger" dot />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {strategy.side && (
          <span
            className={cn(
              'rounded-md px-2 py-0.5 font-medium',
              strategy.side.toLowerCase() === 'long'
                ? 'bg-xaccent-strong/10 text-xaccent-strong'
                : 'bg-xdanger/10 text-xdanger',
            )}
          >
            {strategy.side}
          </span>
        )}
        {strategy.horizonMinutes !== undefined && (
          <span className="rounded-md bg-xpanel-2 px-2 py-0.5 font-mono text-xtext-muted">
            {strategy.horizonMinutes}m
          </span>
        )}
      </div>

      {strategy.executeIf && (
        <code className="line-clamp-2 rounded-lg bg-xbg/60 px-3 py-2 font-mono text-xs leading-relaxed text-xtext-soft">
          {strategy.executeIf}
        </code>
      )}

      <div className="mt-auto flex items-center justify-between pt-1 text-xs text-xtext-muted">
        <span className="inline-flex items-center gap-1.5">
          {verified ? (
            <ShieldCheck className="size-3.5 text-xaccent-strong" />
          ) : (
            <ShieldX className="size-3.5 text-xtext-muted" />
          )}
          {strategy.candidateCount !== undefined
            ? `${strategy.candidateCount} candidates`
            : 'no candidates'}
        </span>
        <span className="inline-flex items-center gap-1 text-xtext-soft opacity-0 transition-opacity group-hover:opacity-100">
          Details <ArrowRight className="size-3" />
        </span>
      </div>
    </button>
  )
}
