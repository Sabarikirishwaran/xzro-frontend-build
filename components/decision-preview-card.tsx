import { DataBadge, Panel } from './ui'

const rows = [
  ['Decision', 'No-trade'],
  ['Venue', 'Hyperliquid'],
  ['Horizon', '30m'],
  ['Candidates', '8 scanned'],
  ['Cost gate', 'Passed'],
  ['Risk gate', 'No candidate selected'],
  ['Mode', 'Static Fast'],
]

export function DecisionPreviewCard() {
  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <div>
          <p className="text-sm font-medium text-text-primary">Decision preview</p>
          <p className="mt-1 font-mono text-[11px] text-text-muted">
            cycle_static_8f42a1
          </p>
        </div>
        <DataBadge>Execution disabled</DataBadge>
      </div>

      <dl className="divide-y divide-white/[0.055] px-5">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[112px_1fr] gap-4 py-3 text-xs"
          >
            <dt className="text-text-muted">{label}</dt>
            <dd className="mono-number text-right text-text-secondary">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
