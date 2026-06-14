import type { HorizonSearchRow } from '@/lib/types'
import { StatusBadge, PercentValue } from '@/components/primitives'
import { decisionLabel, decisionTone, formatPct } from '@/lib/format'

const COLUMNS = [
  'Horizon',
  'Decision',
  'Templates',
  'Candidates',
  'Scenario',
  'Risk',
  'Walk-fwd',
  'Best symbol',
  'Best edge',
  'Required',
]

export function HorizonSummaryTable({ rows }: { rows?: HorizonSearchRow[] }) {
  if (!rows || rows.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-xtext-muted">
        No horizon search results in this cycle.
      </p>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="x-scroll hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-xborder text-left">
              {COLUMNS.map((c) => (
                <th
                  key={c}
                  className="whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wide text-xtext-muted"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-xborder/60 last:border-0">
                <td className="px-4 py-3 font-mono text-xtext-soft">{row.horizon_minutes}m</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    value={decisionLabel(row.decision)}
                    tone={decisionTone(row.decision)}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xtext-soft">
                  {row.llm_templates_valid ?? '—'}/{row.templates_generated ?? '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xtext-soft">
                  {row.candidates_generated ?? '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xtext-soft">{row.scenario_passed ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xtext-soft">{row.risk_validated ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xtext-soft">
                  {row.walk_forward_passed ?? '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xtext-soft">{row.best_symbol ?? '—'}</td>
                <td className="px-4 py-3">
                  <PercentValue value={row.best_expected_net_return_pct} />
                </td>
                <td className="px-4 py-3 font-mono text-xtext-muted">
                  {formatPct(row.min_required_edge_pct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 p-4 md:hidden">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl border border-xborder bg-xpanel-2 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-xtext-soft">{row.horizon_minutes}m</span>
              <StatusBadge value={decisionLabel(row.decision)} tone={decisionTone(row.decision)} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <Row label="Templates" value={`${row.llm_templates_valid ?? '—'}/${row.templates_generated ?? '—'}`} />
              <Row label="Candidates" value={`${row.candidates_generated ?? '—'}`} />
              <Row label="Risk validated" value={`${row.risk_validated ?? '—'}`} />
              <Row label="Walk-forward" value={`${row.walk_forward_passed ?? '—'}`} />
              <Row label="Best symbol" value={row.best_symbol ?? '—'} />
              <Row label="Required edge" value={formatPct(row.min_required_edge_pct)} />
            </dl>
            {row.reason && (
              <p className="mt-3 border-t border-xborder pt-2 text-xs text-xtext-muted">
                {row.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xtext-muted">{label}</dt>
      <dd className="font-mono text-xtext-soft">{value}</dd>
    </div>
  )
}
