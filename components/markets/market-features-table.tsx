'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { MarketFeature } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatNum, formatPct } from '@/lib/format'
import { PercentValue } from '@/components/primitives'

type SortKey = keyof MarketFeature
type SortDir = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string; render?: (f: MarketFeature) => React.ReactNode }[] = [
  { key: 'symbol', label: 'Symbol' },
  { key: 'mid', label: 'Mid', render: (f) => <span className="font-mono tabular-nums">{formatNum(f.mid, 4)}</span> },
  { key: 'spread_pct', label: 'Spread %', render: (f) => <span className="font-mono tabular-nums text-xtext-soft">{formatPct(f.spread_pct)}</span> },
  { key: 'return_1m_pct', label: 'Return 1m %', render: (f) => <PercentValue value={f.return_1m_pct} /> },
  { key: 'realized_vol_1m_pct', label: 'Vol 1m %', render: (f) => <span className="font-mono tabular-nums text-xtext-soft">{formatPct(f.realized_vol_1m_pct)}</span> },
  { key: 'order_book_imbalance_l1', label: 'OBI L1', render: (f) => <PercentValue value={f.order_book_imbalance_l1} digits={3} /> },
  { key: 'order_book_imbalance_l5', label: 'OBI L5', render: (f) => <PercentValue value={f.order_book_imbalance_l5} digits={3} /> },
  { key: 'trade_imbalance_30s', label: 'Trade imb.', render: (f) => <PercentValue value={f.trade_imbalance_30s} digits={3} /> },
  { key: 'funding_rate', label: 'Funding', render: (f) => <span className="font-mono tabular-nums text-xtext-soft">{formatNum(f.funding_rate, 6)}</span> },
  { key: 'liquidity_score', label: 'Liquidity', render: (f) => <span className="font-mono tabular-nums text-xtext">{formatNum(f.liquidity_score, 2)}</span> },
]

export function MarketFeaturesTable({ features }: { features: MarketFeature[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('liquidity_score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    const copy = [...features]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'string' || typeof bv === 'string') {
        return sortDir === 'asc'
          ? String(av ?? '').localeCompare(String(bv ?? ''))
          : String(bv ?? '').localeCompare(String(av ?? ''))
      }
      const an = (av as number) ?? -Infinity
      const bn = (bv as number) ?? -Infinity
      return sortDir === 'asc' ? an - bn : bn - an
    })
    return copy
  }, [features, sortKey, sortDir])

  const toggle = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-xborder text-left">
            {COLUMNS.map((col) => (
              <th key={col.key as string} className="px-3 py-2.5 font-medium text-xtext-muted">
                <button
                  type="button"
                  onClick={() => toggle(col.key)}
                  className="inline-flex items-center gap-1 transition-colors hover:text-xtext"
                >
                  {col.label}
                  {sortKey === col.key &&
                    (sortDir === 'asc' ? (
                      <ArrowUp className="size-3" />
                    ) : (
                      <ArrowDown className="size-3" />
                    ))}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((f, i) => (
            <tr
              key={f.symbol}
              className={cn(
                'border-b border-xborder/50 transition-colors hover:bg-xpanel-2/60',
                i % 2 === 1 && 'bg-xpanel-2/30',
              )}
            >
              {COLUMNS.map((col) => (
                <td key={col.key as string} className="px-3 py-2.5">
                  {col.key === 'symbol' ? (
                    <span className="font-mono font-medium text-xtext">{f.symbol}</span>
                  ) : col.render ? (
                    col.render(f)
                  ) : (
                    <span className="font-mono tabular-nums text-xtext-soft">
                      {formatNum(f[col.key] as number)}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
