'use client'

import { useMemo, useState } from 'react'
import { Activity, BarChart3, Search } from 'lucide-react'
import { useLatestCycleResult } from '@/lib/hooks'
import { getVenue } from '@/lib/selectors'
import type { MarketFeature } from '@/lib/types'
import { PageHeader } from '@/components/app/page-header'
import { EmptyState } from '@/components/app/empty-state'
import { Panel, PanelHeader } from '@/components/primitives'
import { MarketFeaturesTable } from '@/components/markets/market-features-table'
import { LiquiditySpreadScatter, ObiBarChart } from '@/components/markets/market-charts'

export default function MarketsPage() {
  const { result, loaded } = useLatestCycleResult()
  const [search, setSearch] = useState('')
  const [maxSpread, setMaxSpread] = useState('')
  const [minLiquidity, setMinLiquidity] = useState('')

  const features = useMemo<MarketFeature[]>(() => result?.features ?? [], [result])

  const filtered = useMemo(() => {
    return features.filter((f) => {
      if (search && !f.symbol.toLowerCase().includes(search.toLowerCase())) return false
      if (maxSpread && (f.spread_pct ?? Infinity) > Number(maxSpread)) return false
      if (minLiquidity && (f.liquidity_score ?? -Infinity) < Number(minLiquidity)) return false
      return true
    })
  }, [features, search, maxSpread, minLiquidity])

  if (loaded && !result) {
    return (
      <>
        <PageHeader title="Markets" description="Scanned symbols and microstructure features." />
        <EmptyState
          icon={<BarChart3 className="size-6" />}
          title="No market data yet"
          description="Run an agent cycle to scan a perp universe and populate market features."
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Markets"
        description={`${features.length} symbols scanned on ${getVenue(result)}.`}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Liquidity vs Spread"
            description="Each point is a symbol. Lower spread and higher liquidity are better."
            icon={<Activity className="size-4" />}
          />
          <div className="p-4">
            <LiquiditySpreadScatter features={features} />
          </div>
        </Panel>
        <Panel>
          <PanelHeader
            title="Order Book Imbalance (L5)"
            description="Positive favors bids, negative favors asks."
            icon={<BarChart3 className="size-4" />}
          />
          <div className="p-4">
            <ObiBarChart features={features} />
          </div>
        </Panel>
      </div>

      <Panel className="mt-5">
        <PanelHeader title="Market Features" description="Sortable microstructure snapshot per symbol." />
        <div className="grid gap-3 border-b border-xborder px-5 py-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-xtext-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbol"
              className="w-full rounded-lg border border-xborder bg-xpanel-2 py-2 pl-9 pr-3 text-sm text-xtext placeholder:text-xtext-muted focus:border-xaccent-strong focus:outline-none"
            />
          </div>
          <input
            type="number"
            value={maxSpread}
            onChange={(e) => setMaxSpread(e.target.value)}
            placeholder="Spread % less than"
            className="w-full rounded-lg border border-xborder bg-xpanel-2 px-3 py-2 text-sm text-xtext placeholder:text-xtext-muted focus:border-xaccent-strong focus:outline-none"
          />
          <input
            type="number"
            value={minLiquidity}
            onChange={(e) => setMinLiquidity(e.target.value)}
            placeholder="Liquidity greater than"
            className="w-full rounded-lg border border-xborder bg-xpanel-2 px-3 py-2 text-sm text-xtext placeholder:text-xtext-muted focus:border-xaccent-strong focus:outline-none"
          />
        </div>
        {filtered.length > 0 ? (
          <MarketFeaturesTable features={filtered} />
        ) : (
          <p className="px-5 py-10 text-center text-sm text-xtext-muted">
            No symbols match the current filters.
          </p>
        )}
      </Panel>
    </>
  )
}
