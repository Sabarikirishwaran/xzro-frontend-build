'use client'

import { useMemo, useState } from 'react'
import { Brain, Search } from 'lucide-react'
import { useLatestCycleResult } from '@/lib/hooks'
import { PageHeader } from '@/components/app/page-header'
import { EmptyState } from '@/components/app/empty-state'
import { StrategyCard } from '@/components/strategies/strategy-card'
import { StrategyDrawer } from '@/components/strategies/strategy-drawer'
import {
  buildStrategyViews,
  type StrategyView,
} from '@/components/strategies/strategy-utils'

type VerifFilter = 'all' | 'verified' | 'failed'

export default function StrategiesPage() {
  const { result, loaded } = useLatestCycleResult()
  const [search, setSearch] = useState('')
  const [side, setSide] = useState<string>('all')
  const [verif, setVerif] = useState<VerifFilter>('all')
  const [active, setActive] = useState<StrategyView | null>(null)

  const strategies = useMemo(() => buildStrategyViews(result), [result])

  const sides = useMemo(() => {
    const s = new Set<string>()
    strategies.forEach((st) => st.side && s.add(st.side))
    return ['all', ...Array.from(s)]
  }, [strategies])

  const filtered = useMemo(() => {
    return strategies.filter((st) => {
      if (search && !st.symbol.toLowerCase().includes(search.toLowerCase())) return false
      if (side !== 'all' && st.side !== side) return false
      if (verif === 'verified' && st.verified !== true) return false
      if (verif === 'failed' && st.verified === true) return false
      return true
    })
  }, [strategies, search, side, verif])

  if (loaded && strategies.length === 0) {
    return (
      <>
        <PageHeader title="Strategies" description="LLM-generated templates and their verification status." />
        <EmptyState
          icon={<Brain className="size-6" />}
          title="No strategy templates yet"
          description="When the LLM proposes conditional strategies, they appear here with their formal verification status."
        />
      </>
    )
  }

  const verifiedCount = strategies.filter((s) => s.verified === true).length

  return (
    <>
      <PageHeader
        title="Strategies"
        description={`${strategies.length} templates proposed · ${verifiedCount} passed formal verification.`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-xtext-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol"
            className="w-full rounded-lg border border-xborder bg-xpanel-2 py-2 pl-9 pr-3 text-sm text-xtext placeholder:text-xtext-muted focus:border-xaccent-strong focus:outline-none"
          />
        </div>
        <select
          value={side}
          onChange={(e) => setSide(e.target.value)}
          className="rounded-lg border border-xborder bg-xpanel-2 px-3 py-2 text-sm text-xtext-soft focus:border-xaccent-strong focus:outline-none"
        >
          {sides.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All sides' : s}
            </option>
          ))}
        </select>
        <div className="inline-flex rounded-lg border border-xborder bg-xpanel-2 p-1 text-sm">
          {(['all', 'verified', 'failed'] as VerifFilter[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVerif(v)}
              className={
                verif === v
                  ? 'rounded-md bg-primary px-3 py-1 font-medium capitalize text-primary-foreground'
                  : 'rounded-md px-3 py-1 capitalize text-xtext-muted transition-colors hover:text-xtext'
              }
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <StrategyCard key={s.id} strategy={s} onOpen={setActive} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-xtext-muted">
          No strategies match the current filters.
        </p>
      )}

      <StrategyDrawer strategy={active} onClose={() => setActive(null)} />
    </>
  )
}
