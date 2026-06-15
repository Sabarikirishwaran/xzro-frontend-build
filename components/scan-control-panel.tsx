'use client'

import { LoaderCircle } from 'lucide-react'
import { Panel, PanelHeader, primaryButtonClass } from './ui'

export function ScanControlPanel({
  budget,
  onBudgetChange,
  runState,
  hasResult,
  disabled,
  onRun,
}: {
  budget: number
  onBudgetChange: (value: number) => void
  runState: 'idle' | 'loading' | 'success'
  hasResult: boolean
  disabled: boolean
  onRun: () => void
}) {
  const loading = runState === 'loading'
  const primaryLabel =
    runState === 'loading'
      ? 'Scanning market state...'
      : runState === 'success'
        ? 'Decision ready'
        : hasResult
          ? 'Run again'
          : 'Run strategy scan'

  return (
    <Panel>
      <PanelHeader
        title="Scan setup"
        description="Market scan configured for a 30-minute decision horizon."
      />

      <div className="space-y-6 p-5">
        <div className="grid grid-cols-2 gap-3">
          <ReadOnlyField label="Market" value="Hyperliquid" />
          <ReadOnlyField label="Universe" value="Top 8" />
          <ReadOnlyField label="Horizon" value="30m" />
          <ReadOnlyField label="Analysis" value="Cost + risk" />
        </div>

        <label className="block">
          <span className="text-xs font-medium text-text-secondary">
            Portfolio budget
          </span>
          <div className="mt-2 flex items-center rounded-xl border border-border-subtle bg-surface-1 px-3">
            <span className="text-sm text-text-secondary">$</span>
            <input
              type="number"
              min={10}
              max={1000}
              step={10}
              value={budget}
              onChange={(event) => {
                const next = Number(event.target.value)
                onBudgetChange(Math.min(1000, Math.max(10, next || 10)))
              }}
              className="mono-number w-full bg-transparent px-2 py-2.5 text-sm text-text-primary"
            />
          </div>
        </label>

        <button
          type="button"
          onClick={onRun}
          disabled={loading || disabled}
          className={`${primaryButtonClass} w-full`}
        >
          {loading && <LoaderCircle className="size-4 animate-spin" />}
          {primaryLabel}
        </button>
      </div>
    </Panel>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-1 px-3 py-2.5">
      <p className="text-[11px] text-text-secondary">{label}</p>
      <p className="mono-number mt-1 text-xs text-text-primary">{value}</p>
    </div>
  )
}
