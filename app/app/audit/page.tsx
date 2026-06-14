'use client'

import { useMemo, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useLatestCycleResult } from '@/lib/hooks'
import { PageHeader } from '@/components/app/page-header'
import { EmptyState } from '@/components/app/empty-state'
import { Panel } from '@/components/primitives'
import { AuditTable } from '@/components/audit/audit-table'
import {
  buildAuditRows,
  severityLabel,
  severityTone,
  SEVERITY_ORDER,
  type Severity,
} from '@/components/audit/audit-utils'
import { cn } from '@/lib/utils'

const toneRing: Record<string, string> = {
  danger: 'border-xdanger/40 bg-xdanger/10 text-xdanger',
  warning: 'border-xwarning/40 bg-xwarning/10 text-xwarning',
  cyan: 'border-xcyan/40 bg-xcyan/10 text-xcyan',
  neutral: 'border-xborder bg-xpanel-2 text-xtext-soft',
}

export default function AuditPage() {
  const { result, loaded } = useLatestCycleResult()
  const [filter, setFilter] = useState<Severity | 'all'>('all')

  const rows = useMemo(() => buildAuditRows(result), [result])

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { hard: 0, soft: 0, fallback: 0, info: 0 }
    rows.forEach((r) => (c[r.severity] += 1))
    return c
  }, [rows])

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.severity === filter)

  if (loaded && rows.length === 0) {
    return (
      <>
        <PageHeader title="Audit Trail" description="Why the system refused, degraded, or fell back." />
        <EmptyState
          icon={<ShieldAlert className="size-6" />}
          title="No audit events"
          description="When candidates are filtered, verifications fail, or best-effort fallbacks fire, the reasons are logged here."
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Audit Trail"
        description={`${rows.length} governance events from the latest cycle.`}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SEVERITY_ORDER.map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setFilter(filter === sev ? 'all' : sev)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-left transition-colors',
              toneRing[severityTone[sev]],
              filter === sev && 'ring-1 ring-current',
            )}
          >
            <p className="font-mono text-2xl font-semibold">{counts[sev]}</p>
            <p className="text-xs">{severityLabel[sev]}</p>
          </button>
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-xborder px-5 py-3">
          <p className="text-sm text-xtext-muted">
            {filter === 'all' ? 'All events' : severityLabel[filter]} · {filtered.length}
          </p>
          {filter !== 'all' && (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="text-xs text-xaccent-strong hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <AuditTable rows={filtered} />
      </Panel>
    </>
  )
}
