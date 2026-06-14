import { ShieldCheck } from 'lucide-react'

export function NoTradeExplainer({ rationale }: { rationale?: string }) {
  return (
    <div className="flex gap-4 rounded-xl border border-xborder bg-xpanel-2 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-xaccent-strong/30 bg-xaccent-strong/10 text-xaccent-strong">
        <ShieldCheck className="size-5" strokeWidth={1.5} />
      </span>
      <div>
        <p className="text-sm leading-relaxed text-xtext-soft">
          No trade was created. The verifier rejected execution because no candidate survived the
          required edge, risk, or walk-forward checks.
        </p>
        <p className="mt-2 text-xs text-xtext-muted">
          This is expected behavior: xZro should refuse weak trades.
        </p>
        {rationale && (
          <p className="mt-3 border-t border-xborder pt-3 font-mono text-xs text-xtext-muted">
            {rationale}
          </p>
        )}
      </div>
    </div>
  )
}
