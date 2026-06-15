import { formatDuration, shortId } from '@/lib/format'
import type { NormalizedResult } from '@/lib/types'
import { DataBadge, Panel } from './ui'

export function DecisionSummary({ result }: { result: NormalizedResult }) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-5 border-b border-border-subtle p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-text-secondary">
            Verified decision
          </p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-text-primary">
            {result.decision.label}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            {result.decision.caption}
          </p>
        </div>
        <DataBadge tone={result.decision.tone}>Decision ready</DataBadge>
      </div>

      <dl className="grid grid-cols-2 divide-x divide-y divide-border-subtle sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        <Metric label="Cycle" value={shortId(result.cycleId)} />
        <Metric label="Venue" value={result.venue} />
        <Metric label="Horizon" value={`${result.horizonMinutes}m`} />
        <Metric label="Runtime" value={formatDuration(result.runtimeMs)} />
        <Metric label="Candidates" value={String(result.candidates.length)} />
        <Metric
          label="Selected"
          value={result.selectedCandidate?.symbol ?? 'None'}
        />
      </dl>
    </Panel>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-4 py-4">
      <dt className="text-[11px] text-text-secondary">{label}</dt>
      <dd className="mono-number mt-1 truncate text-xs text-text-secondary">
        {value}
      </dd>
    </div>
  )
}
