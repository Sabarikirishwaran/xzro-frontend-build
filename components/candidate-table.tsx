import { formatPct } from '@/lib/format'
import type { CandidateRow } from '@/lib/types'
import { DataBadge, Panel, PanelHeader } from './ui'

export function CandidateTable({ candidates }: { candidates: CandidateRow[] }) {
  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="Candidate set"
        description={`${candidates.length} candidate${candidates.length === 1 ? '' : 's'} evaluated.`}
      />
      {candidates.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-text-muted">
          No candidate records returned.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle text-[10px] uppercase tracking-[0.12em] text-text-muted">
                <Header>Symbol</Header>
                <Header>Side</Header>
                <Header align="right">Score</Header>
                <Header align="right">Expected net</Header>
                <Header align="right">Cost</Header>
                <Header align="right">Risk</Header>
                <Header>Gate</Header>
                <Header>Reason</Header>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="border-b border-white/[0.055] text-xs text-text-secondary transition last:border-b-0 hover:bg-white/[0.025]"
                >
                  <Cell mono>{candidate.symbol}</Cell>
                  <Cell mono>{candidate.side}</Cell>
                  <Cell mono align="right">
                    {formatNumber(candidate.score)}
                  </Cell>
                  <Cell mono align="right">
                    {formatPct(candidate.expectedNetReturnPct)}
                  </Cell>
                  <Cell mono align="right">
                    {formatPct(candidate.estimatedCostPct)}
                  </Cell>
                  <Cell mono align="right">
                    {formatNumber(candidate.riskScore)}
                  </Cell>
                  <Cell>
                    <DataBadge tone={candidate.gateTone}>
                      {candidate.gate}
                    </DataBadge>
                  </Cell>
                  <Cell className="max-w-[220px] truncate text-text-muted">
                    {candidate.reason ?? '—'}
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  )
}

function Header({
  children,
  align = 'left',
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <th className={`px-4 py-3 font-medium ${align === 'right' ? 'text-right' : ''}`}>
      {children}
    </th>
  )
}

function Cell({
  children,
  mono = false,
  align = 'left',
  className = '',
}: {
  children: React.ReactNode
  mono?: boolean
  align?: 'left' | 'right'
  className?: string
}) {
  return (
    <td
      className={`px-4 py-3.5 ${mono ? 'mono-number' : ''} ${
        align === 'right' ? 'text-right' : ''
      } ${className}`}
    >
      {children}
    </td>
  )
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return '—'
  return value.toFixed(3)
}
