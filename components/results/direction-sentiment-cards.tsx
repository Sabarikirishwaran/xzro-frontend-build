'use client'

import type { DirectionRow, SentimentRow } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatPct } from '@/lib/format'
import { StatusBadge } from '@/components/primitives'

function ProbBar({ up = 0, flat = 0, down = 0 }: { up?: number; flat?: number; down?: number }) {
  const total = up + flat + down || 1
  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-xpanel-2">
      <span style={{ width: `${(up / total) * 100}%` }} className="bg-xaccent-strong" />
      <span style={{ width: `${(flat / total) * 100}%` }} className="bg-xneutral/50" />
      <span style={{ width: `${(down / total) * 100}%` }} className="bg-xdanger" />
    </div>
  )
}

export function DirectionCards({ directions }: { directions?: DirectionRow[] }) {
  if (!directions?.length) {
    return <p className="px-5 py-8 text-center text-sm text-xtext-muted">No direction priors.</p>
  }
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {directions.map((d, i) => (
        <div key={`${d.symbol}-${i}`} className="rounded-xl border border-xborder bg-xpanel-2 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-semibold text-xtext">{d.symbol}</span>
            {d.direction && (
              <span
                className={cn(
                  'text-xs font-medium uppercase',
                  d.direction.toLowerCase() === 'up'
                    ? 'text-xaccent-strong'
                    : d.direction.toLowerCase() === 'down'
                      ? 'text-xdanger'
                      : 'text-xtext-muted',
                )}
              >
                {d.direction}
              </span>
            )}
          </div>
          <div className="mt-3">
            <ProbBar up={d.prob_up} flat={d.prob_flat} down={d.prob_down} />
            <div className="mt-2 flex justify-between font-mono text-xs text-xtext-muted">
              <span className="text-xaccent-strong">{formatPct((d.prob_up ?? 0) * 100, { digits: 1 })}</span>
              <span>{formatPct((d.prob_flat ?? 0) * 100, { digits: 1 })}</span>
              <span className="text-xdanger">{formatPct((d.prob_down ?? 0) * 100, { digits: 1 })}</span>
            </div>
          </div>
          {(d.model_confidence !== undefined || d.model_name) && (
            <p className="mt-3 truncate text-xs text-xtext-muted">
              {d.model_name ?? 'model'}
              {d.model_confidence !== undefined &&
                ` · conf ${formatPct(d.model_confidence * 100, { digits: 0 })}`}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export function SentimentCards({ sentiments }: { sentiments?: SentimentRow[] }) {
  if (!sentiments?.length) {
    return (
      <p className="px-5 py-8 text-center text-sm text-xtext-muted">
        No sentiment data (Elfa disabled or fallback).
      </p>
    )
  }
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {sentiments.map((s, i) => (
        <div key={`${s.symbol}-${i}`} className="rounded-xl border border-xborder bg-xpanel-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold text-xtext">{s.symbol}</span>
            {s.attention_spike && <StatusBadge value="Attention spike" tone="cyan" />}
          </div>
          {s.narrative && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-xtext-soft">{s.narrative}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-xtext-muted">
            {s.sentiment_score !== undefined && <span>score {s.sentiment_score.toFixed(2)}</span>}
            {s.social_momentum !== undefined && <span>mom {s.social_momentum.toFixed(2)}</span>}
            {s.credible_accounts_mentioning !== undefined && (
              <span>{s.credible_accounts_mentioning} accts</span>
            )}
          </div>
          {s.risk_flags?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {s.risk_flags.map((f) => (
                <span key={f} className="rounded bg-xwarning/10 px-1.5 py-0.5 text-[10px] text-xwarning">
                  {f}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
