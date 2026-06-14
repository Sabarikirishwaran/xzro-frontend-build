'use client'

import { Fragment, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/primitives'
import {
  severityLabel,
  severityTone,
  type AuditRow,
} from '@/components/audit/audit-utils'

export function AuditTable({ rows }: { rows: AuditRow[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-xborder text-left text-xtext-muted">
            <th className="w-8 px-3 py-2.5" />
            <th className="px-3 py-2.5 font-medium">Stage</th>
            <th className="px-3 py-2.5 font-medium">Symbol</th>
            <th className="px-3 py-2.5 font-medium">Candidate</th>
            <th className="px-3 py-2.5 font-medium">Severity</th>
            <th className="px-3 py-2.5 font-medium">Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const hasDetails = Object.keys(row.details).length > 0
            const open = expanded === i
            return (
              <Fragment key={i}>
                <tr
                  className={cn(
                    'border-b border-xborder/50 transition-colors',
                    hasDetails && 'cursor-pointer hover:bg-xpanel-2/60',
                  )}
                  onClick={() => hasDetails && setExpanded(open ? null : i)}
                >
                  <td className="px-3 py-2.5 text-xtext-muted">
                    {hasDetails && (
                      <ChevronRight
                        className={cn('size-4 transition-transform', open && 'rotate-90')}
                      />
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-xtext-soft">{row.stage}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-xtext">
                    {row.symbol ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-xtext-muted">
                    {row.candidateId ? row.candidateId.slice(0, 10) : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge
                      value={severityLabel[row.severity]}
                      tone={severityTone[row.severity]}
                      dot
                    />
                  </td>
                  <td className="px-3 py-2.5 text-xtext-soft">{row.reason}</td>
                </tr>
                {open && hasDetails && (
                  <tr className="border-b border-xborder/50 bg-xbg/40">
                    <td />
                    <td colSpan={5} className="px-3 py-3">
                      <pre className="x-scroll max-h-64 overflow-auto rounded-lg bg-xbg/60 px-3 py-2 font-mono text-xs leading-relaxed text-xtext-soft">
                        {JSON.stringify(row.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
