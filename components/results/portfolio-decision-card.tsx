import { ShieldCheck, CircleDollarSign, Eye, ShieldAlert } from 'lucide-react'
import type { PortfolioPlan } from '@/lib/types'
import { Panel } from '@/components/primitives'
import { PercentValue } from '@/components/primitives'
import { formatUsd, decisionLabel } from '@/lib/format'
import { NoTradeExplainer } from './no-trade-explainer'

export function PortfolioDecisionCard({
  plan,
  paperOrderCount = 0,
}: {
  plan?: PortfolioPlan
  paperOrderCount?: number
}) {
  const decision = (plan?.decision ?? 'unknown').toLowerCase()
  const isNoTrade = decision === 'no_trade' || paperOrderCount === 0

  const config = {
    approved: { icon: ShieldCheck, tone: 'text-xaccent-strong', ring: 'border-xaccent-strong/40 bg-xaccent-strong/10' },
    trade: { icon: CircleDollarSign, tone: 'text-xaccent-strong', ring: 'border-xaccent-strong/40 bg-xaccent-strong/10' },
    watch: { icon: Eye, tone: 'text-xcyan', ring: 'border-xcyan/40 bg-xcyan/10' },
    no_trade: { icon: ShieldCheck, tone: 'text-xtext-muted', ring: 'border-xborder bg-xpanel-2' },
    reject: { icon: ShieldAlert, tone: 'text-xdanger', ring: 'border-xdanger/40 bg-xdanger/10' },
    unknown: { icon: ShieldAlert, tone: 'text-xtext-muted', ring: 'border-xborder bg-xpanel-2' },
  }[decision] ?? { icon: ShieldAlert, tone: 'text-xtext-muted', ring: 'border-xborder bg-xpanel-2' }

  const Icon = config.icon

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center gap-4 border-b border-xborder p-5">
        <span className={`grid size-12 place-items-center rounded-2xl border ${config.ring}`}>
          <Icon className={`size-6 ${config.tone}`} strokeWidth={1.5} />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-xtext-muted">Portfolio decision</p>
          <p className={`font-heading text-xl font-semibold ${config.tone}`}>
            {decisionLabel(plan?.decision)}
          </p>
        </div>
      </div>

      <div className="p-5">
        {isNoTrade ? (
          <NoTradeExplainer rationale={plan?.llm_rationale} />
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Metric label="Expected net" value={<PercentValue value={plan?.expected_net_return_pct} />} />
            <Metric label="Worst case" value={<PercentValue value={plan?.worst_case_net_return_pct} />} />
            <Metric label="Gross exposure" value={formatUsd(plan?.gross_exposure_usd)} />
            <Metric label="Net long" value={formatUsd(plan?.net_long_usd)} />
            <Metric label="Net short" value={formatUsd(plan?.net_short_usd)} />
            <Metric label="Allocations" value={`${plan?.allocations?.length ?? 0}`} />
          </div>
        )}

        {!isNoTrade && plan?.llm_rationale && (
          <p className="mt-4 border-t border-xborder pt-4 text-sm leading-relaxed text-xtext-muted">
            {plan.llm_rationale}
          </p>
        )}
      </div>
    </Panel>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-xtext-muted">{label}</span>
      <span className="font-mono text-sm text-xtext-soft">{value}</span>
    </div>
  )
}
