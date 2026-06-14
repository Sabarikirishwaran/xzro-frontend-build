'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  Activity,
  Boxes,
  BrainCircuit,
  FileBarChart,
  GitBranch,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { useLatestCycleResult } from '@/lib/hooks'
import {
  getElfaFallbackCount,
  getPaperOrderCount,
  getPipelineStages,
  getSymbolCount,
  getVenue,
} from '@/lib/selectors'
import { decisionLabel, decisionTone, shortId } from '@/lib/format'
import { PageHeader } from '@/components/app/page-header'
import { EmptyState } from '@/components/app/empty-state'
import { Panel, PanelHeader, StatusBadge, CopyButton } from '@/components/primitives'
import { MetricCard } from '@/components/metric-card'
import { PipelineTimeline } from '@/components/results/pipeline-timeline'
import { HorizonSummaryTable } from '@/components/results/horizon-summary-table'
import { PortfolioDecisionCard } from '@/components/results/portfolio-decision-card'
import {
  DirectionCards,
  SentimentCards,
} from '@/components/results/direction-sentiment-cards'
import { MarketFeaturesTable } from '@/components/markets/market-features-table'
import { RawJsonViewer } from '@/components/raw-json-viewer'

export default function ResultsPage() {
  const { result, loaded } = useLatestCycleResult()
  const stages = useMemo(() => getPipelineStages(result), [result])

  if (loaded && !result) {
    return (
      <>
        <PageHeader title="Results Explorer" description="Make a full cycle response understandable." />
        <EmptyState
          icon={<FileBarChart className="size-6" />}
          title="No cycle to explore"
          description="Run an agent cycle and the full response will be broken down here."
        />
      </>
    )
  }

  if (!result) return null

  const decision = result.portfolio_plan?.decision

  return (
    <>
      <PageHeader
        title="Results Explorer"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-mono">{shortId(result.cycle_id, 18)}</span>
            <StatusBadge value={getVenue(result)} tone="neutral" />
            <StatusBadge value={decisionLabel(decision)} tone={decisionTone(decision)} />
          </span>
        }
        action={<CopyButton text={result.cycle_id} label="Copy cycle ID" />}
      />

      {/* 1. Cycle summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Symbols scanned"
          value={getSymbolCount(result)}
          icon={<Boxes className="size-5" strokeWidth={1.5} />}
          hint={`${result.ticks?.length ?? 0} ticks collected`}
        />
        <MetricCard
          label="Templates"
          value={result.templates?.length ?? 0}
          tone="cyan"
          icon={<BrainCircuit className="size-5" strokeWidth={1.5} />}
          hint={`${result.formula_verifications?.length ?? 0} verifications`}
        />
        <MetricCard
          label="Selected horizon"
          value={result.selected_horizon_minutes ? `${result.selected_horizon_minutes}m` : '—'}
          icon={<TrendingUp className="size-5" strokeWidth={1.5} />}
          hint={`${result.horizon_search?.length ?? 0} horizons searched`}
        />
        <MetricCard
          label="Paper orders"
          value={getPaperOrderCount(result)}
          tone={getPaperOrderCount(result) > 0 ? 'success' : 'neutral'}
          icon={<ShieldCheck className="size-5" strokeWidth={1.5} />}
          hint={`${getElfaFallbackCount(result)} Elfa fallbacks`}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-1">
          <PanelHeader
            title="Pipeline"
            description="Stage status for this cycle."
            icon={<Activity className="size-4" />}
          />
          <div className="p-5">
            <PipelineTimeline stages={stages} />
          </div>
        </Panel>

        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* 3. Portfolio decision */}
          <PortfolioDecisionCard
            plan={result.portfolio_plan}
            paperOrderCount={getPaperOrderCount(result)}
          />

          {/* 2. Horizon table */}
          <Panel>
            <PanelHeader title="Horizon search" description="Funnel of templates, candidates, and survivors per horizon." />
            <HorizonSummaryTable rows={result.horizon_search} />
          </Panel>
        </div>
      </div>

      {/* 5. Direction / sentiment */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Direction priors"
            description="Per-symbol probability of up / flat / down."
            icon={<TrendingUp className="size-4" />}
          />
          <DirectionCards directions={result.directions} />
        </Panel>
        <Panel>
          <PanelHeader
            title="Sentiment"
            description="Social/narrative signal where available."
            icon={<BrainCircuit className="size-4" />}
          />
          <SentimentCards sentiments={result.sentiments} />
        </Panel>
      </div>

      {/* 4. Market features */}
      <Panel className="mt-5">
        <PanelHeader
          title="Market features"
          description="Microstructure snapshot for every scanned symbol."
          icon={<Layers className="size-4" />}
          action={
            <Link
              href="/app/markets"
              className="text-xs text-xaccent-strong hover:underline"
            >
              Open markets
            </Link>
          }
        />
        {result.features?.length ? (
          <MarketFeaturesTable features={result.features} />
        ) : (
          <p className="px-5 py-8 text-center text-sm text-xtext-muted">No market features.</p>
        )}
      </Panel>

      {/* 6-8. Verifier / scenario / risk / walk-forward */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Verifier & candidates"
            description="Formal verification and candidate generation."
            icon={<ShieldCheck className="size-4" />}
          />
          <div className="flex flex-wrap gap-3 p-5">
            <StatusBadge value={`${result.formula_verifications?.length ?? 0} verifications`} tone="neutral" />
            <StatusBadge value={`${result.candidates_generated?.length ?? 0} candidates`} tone="cyan" />
            <StatusBadge value={`${result.candidates_validated?.length ?? 0} validated`} tone="success" />
            <StatusBadge value={`${result.candidates_watchlisted?.length ?? 0} watchlisted`} tone="warning" />
          </div>
        </Panel>
        <Panel>
          <PanelHeader
            title="Scenario, risk & walk-forward"
            description="Out-of-sample and robustness checks."
            icon={<GitBranch className="size-4" />}
          />
          <div className="flex flex-wrap gap-3 p-5">
            <StatusBadge value={`${result.scenario_evaluations?.length ?? 0} scenarios`} tone="neutral" />
            <StatusBadge value={`${result.walk_forward_results?.length ?? 0} walk-forward`} tone="cyan" />
            <StatusBadge value={`${result.overfit_metrics?.length ?? 0} overfit checks`} tone="neutral" />
            <StatusBadge value={`${result.hook_events?.length ?? 0} hook events`} tone="violet" />
          </div>
        </Panel>
      </div>

      {/* 9. Audit + 10. Raw JSON */}
      <Panel className="mt-5">
        <PanelHeader
          title="Audit log"
          description="Why candidates were rejected or degraded."
          icon={<ShieldCheck className="size-4" />}
          action={
            <Link href="/app/audit" className="text-xs text-xaccent-strong hover:underline">
              Full audit trail
            </Link>
          }
        />
        <div className="flex flex-wrap gap-3 p-5">
          <StatusBadge
            value={`${result.rejections?.length ?? 0} events`}
            tone={result.rejections?.length ? 'warning' : 'neutral'}
          />
          <StatusBadge
            value={`${getElfaFallbackCount(result)} Elfa fallbacks`}
            tone={getElfaFallbackCount(result) ? 'cyan' : 'neutral'}
          />
        </div>
      </Panel>

      <div className="mt-5">
        <RawJsonViewer
          data={result}
          title="Raw cycle response"
          downloadName={`xzro-${result.cycle_id}.json`}
        />
      </div>
    </>
  )
}
