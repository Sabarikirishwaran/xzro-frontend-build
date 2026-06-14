import { Activity, BrainCircuit, ShieldCheck, AlertTriangle, CircleDollarSign } from 'lucide-react'

const STAGES = [
  { label: 'Market State', icon: Activity, tone: 'text-xcyan' },
  { label: 'LLM Strategy', icon: BrainCircuit, tone: 'text-xviolet' },
  { label: 'Formal Verifier', icon: ShieldCheck, tone: 'text-xaccent-strong' },
  { label: 'Risk Engine', icon: AlertTriangle, tone: 'text-xwarning' },
  { label: 'Paper Order / No Trade', icon: CircleDollarSign, tone: 'text-xaccent-strong' },
]

export function HeroPipeline() {
  return (
    <div className="x-panel x-glow rounded-3xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-xtext-muted">
          Verification pipeline
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-xaccent-strong">
          <span className="size-1.5 animate-pulse rounded-full bg-xaccent-strong" />
          live
        </span>
      </div>

      <ol className="flex flex-col gap-3">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon
          return (
            <li key={stage.label} className="relative flex items-center gap-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-xborder bg-xpanel-2">
                <Icon className={`size-5 ${stage.tone}`} strokeWidth={1.5} />
              </span>
              <div className="flex-1 rounded-xl border border-xborder bg-xbg/40 px-4 py-3">
                <span className="text-sm font-medium text-xtext-soft">{stage.label}</span>
              </div>
              <span className="font-mono text-xs text-xtext-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
            </li>
          )
        })}
      </ol>

      <p className="mt-5 border-t border-xborder pt-4 text-xs leading-relaxed text-xtext-muted">
        AI proposes. Deterministic checks verify. Execution only happens if edge survives.
      </p>
    </div>
  )
}
