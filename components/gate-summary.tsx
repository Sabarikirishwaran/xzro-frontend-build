import type { GateRow } from '@/lib/types'
import { Panel, PanelHeader } from './ui'

const dots: Record<GateRow['tone'], string> = {
  neutral: 'bg-zinc-500',
  success: 'bg-emerald-400',
  warning: 'bg-amber-300',
  danger: 'bg-rose-400',
}

export function GateSummary({ gates }: { gates: GateRow[] }) {
  return (
    <Panel>
      <PanelHeader title="Gate summary" />
      <dl className="divide-y divide-white/[0.055] px-5">
        {gates.map((gate) => (
          <div
            key={gate.label}
            className="flex items-center justify-between gap-4 py-3.5"
          >
            <dt className="text-xs text-text-muted">{gate.label}</dt>
            <dd className="flex items-center gap-2 text-xs text-text-secondary">
              <span className={`size-1.5 rounded-full ${dots[gate.tone]}`} />
              {gate.value}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
