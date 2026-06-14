'use client'

import Link from 'next/link'
import {
  Activity,
  Boxes,
  CircleDollarSign,
  ServerCog,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { MetricCard } from '@/components/metric-card'
import { Panel, PanelHeader, StatusBadge } from '@/components/primitives'
import { PipelineTimeline } from '@/components/results/pipeline-timeline'
import { HorizonSummaryTable } from '@/components/results/horizon-summary-table'
import { PortfolioDecisionCard } from '@/components/results/portfolio-decision-card'
import { EmptyState } from '@/components/app/empty-state'
import { useBackendHealth, useLatestCycleResult } from '@/lib/hooks'
import {
  getElfaFallbackCount,
  getPaperOrderCount,
  getPipelineStages,
  getPortfolioDecision,
  getSymbolCount,
  getVenue,
} from '@/lib/selectors'
import { decisionLabel, decisionTone, shortId } from '@/lib/format'

export default function DashboardPage() {
  const { status, health } = useBackendHealth(30000)
  const { result, loaded } = useLatestCycleResult()

  const decision = getPortfolioDecision(result)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Backend health and the latest agent cycle at a glance."
        action={
          <Link
            href="/app/run"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Run Agent Cycle <ArrowRight className="size-4" />
          </Link>
        }
      />

      {/* Top metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Backend Status"
          value={status === 'healthy' ? 'Healthy' : status === 'offline' ? 'Offline' : 'Checking'}
          tone={status === 'healthy' ? 'success' : status === 'offline' ? 'danger' : 'neutral'}
          hint={
            health?.venue
              ? `Default venue: ${health.venue}`
              : status === 'offline'
                ? 'Check BACKEND_URL and FastAPI server'
                : 'Polling /health'
          }
          icon={<ServerCog className="size-5" strokeWidth={1.5} />}
        />
        <MetricCard
          label="Latest Cycle"
          value={result ? shortId(result.cycle_id, 12) : '—'}
          tone="cyan"
          hint={
            result
              ? `Horizon ${result.selected_horizon_minutes ?? '—'}m · ${decisionLabel(decision)}`
              : 'No cycle yet'
          }
          icon={<Activity className="size-5" strokeWidth={1.5} />}
        />
        <MetricCard
          label="Market Universe"
          value={result ? getSymbolCount(result) : '—'}
          hint={
            result
              ? `${getVenue(result)} · ${getElfaFallbackCount(result)} Elfa fallbacks`
              : 'Symbols scanned'
          }
          icon={<Boxes className="size-5" strokeWidth={1.5} />}
        />
        <MetricCard
          label="Paper Orders"
          value={result ? getPaperOrderCount(result) : '—'}
          tone={result && getPaperOrderCount(result) > 0 ? 'success' : 'neutral'}
          hint={
            result
              ? `${result.last_mile_results?.length ?? 0} last-mile · ${result.hook_events?.length ?? 0} hooks`
              : 'Simulated execution'
          }
          icon={<CircleDollarSign className="size-5" strokeWidth={1.5} />}
        />
      </div>

      {!loaded ? null : !result ? (
        <div className="mt-6">
          <EmptyState />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Pipeline */}
          <Panel className="lg:col-span-1">
            <PanelHeader
              title="Pipeline timeline"
              description="Stage-by-stage status for the latest cycle."
              icon={<Activity className="size-5" strokeWidth={1.5} />}
            />
            <div className="p-5">
              <PipelineTimeline stages={getPipelineStages(result)} />
            </div>
          </Panel>

          {/* Right column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <PortfolioDecisionCard
              plan={result.portfolio_plan}
              paperOrderCount={getPaperOrderCount(result)}
            />

            <Panel>
              <PanelHeader
                title="Horizon search"
                description="Funnel of templates, candidates, and survivors per horizon."
                action={
                  <Link
                    href="/app/results"
                    className="inline-flex items-center gap-1 text-xs text-xaccent-strong hover:underline"
                  >
                    Full results <ArrowRight className="size-3.5" />
                  </Link>
                }
              />
              <HorizonSummaryTable rows={result.horizon_search} />
            </Panel>

            <Panel>
              <PanelHeader
                title="Audit summary"
                description="Rejections and best-effort fallbacks recorded this cycle."
                icon={<ShieldAlert className="size-5" strokeWidth={1.5} />}
                action={
                  <Link
                    href="/app/audit"
                    className="inline-flex items-center gap-1 text-xs text-xaccent-strong hover:underline"
                  >
                    View audit <ArrowRight className="size-3.5" />
                  </Link>
                }
              />
              <div className="flex flex-wrap items-center gap-3 p-5">
                <StatusBadge
                  value={`${result.rejections?.length ?? 0} rejections`}
                  tone={result.rejections?.length ? 'warning' : 'neutral'}
                />
                <StatusBadge
                  value={`${getElfaFallbackCount(result)} Elfa fallbacks`}
                  tone={getElfaFallbackCount(result) ? 'cyan' : 'neutral'}
                />
                <StatusBadge
                  value={decisionLabel(decision)}
                  tone={decisionTone(decision)}
                />
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  )
}
