'use client'

import { ChevronDown, LoaderCircle } from 'lucide-react'
import type { HealthState, VenueMode } from '@/lib/types'
import {
  Panel,
  PanelHeader,
  primaryButtonClass,
  secondaryButtonClass,
} from './ui'
import { cn } from '@/lib/utils'

export function ScanControlPanel({
  venueMode,
  onVenueModeChange,
  budget,
  onBudgetChange,
  includeRawBooks,
  onIncludeRawBooksChange,
  useFallback,
  onUseFallbackChange,
  healthState,
  runState,
  hasResult,
  onRun,
  onRunSafe,
}: {
  venueMode: VenueMode
  onVenueModeChange: (value: VenueMode) => void
  budget: number
  onBudgetChange: (value: number) => void
  includeRawBooks: boolean
  onIncludeRawBooksChange: (value: boolean) => void
  useFallback: boolean
  onUseFallbackChange: (value: boolean) => void
  healthState: HealthState
  runState: 'idle' | 'loading' | 'success'
  hasResult: boolean
  onRun: () => void
  onRunSafe: () => void
}) {
  const loading = runState === 'loading'
  const primaryDisabled =
    loading || healthState === 'checking' || healthState === 'offline' || healthState === 'auth_error'

  const primaryLabel =
    runState === 'loading'
      ? 'Scanning market state…'
      : runState === 'success'
        ? 'Decision ready'
        : hasResult
          ? 'Run again'
          : 'Run strategy scan'

  return (
    <Panel>
      <PanelHeader
        title="Scan setup"
        description="Fast venue scan with a fixed 30-minute horizon."
      />

      <div className="space-y-6 p-5">
        <fieldset>
          <legend className="text-xs font-medium text-text-secondary">
            Venue mode
          </legend>
          <div
            className="mt-2 grid grid-cols-2 rounded-xl border border-border-subtle bg-surface-1 p-1"
            role="group"
            aria-label="Venue mode"
          >
            {[
              ['hyperliquid', 'Hyperliquid'],
              ['mock', 'Safe sample'],
            ].map(([value, label]) => {
              const active = venueMode === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onVenueModeChange(value as VenueMode)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-xs font-medium transition',
                    active
                      ? 'bg-white/[0.075] text-text-primary'
                      : 'text-text-muted hover:text-text-secondary',
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <ReadOnlyField label="Horizon" value="30m" />
          <ReadOnlyField
            label="Symbols"
            value={venueMode === 'mock' ? 'Fixed 3' : 'Auto top 8'}
          />
        </div>

        <label className="block">
          <span className="text-xs font-medium text-text-secondary">
            Budget
          </span>
          <div className="mt-2 flex items-center rounded-xl border border-border-subtle bg-surface-1 px-3">
            <span className="text-sm text-text-muted">$</span>
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

        <details className="group border-y border-border-subtle py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-xs font-medium text-text-secondary">
            Advanced
            <ChevronDown className="size-3.5 text-text-muted transition group-open:rotate-180" />
          </summary>
          <div className="space-y-4 pb-4">
            <Toggle
              label="Include raw books"
              checked={includeRawBooks}
              onChange={onIncludeRawBooksChange}
            />
            <Toggle
              label="Use fallback on error"
              checked={useFallback}
              onChange={onUseFallbackChange}
            />
          </div>
        </details>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onRun}
            disabled={primaryDisabled}
            className={`${primaryButtonClass} w-full`}
          >
            {loading && <LoaderCircle className="size-4 animate-spin" />}
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={onRunSafe}
            disabled={loading}
            className={`${secondaryButtonClass} w-full`}
          >
            Run safe sample
          </button>
        </div>

        <p className="text-center text-[11px] text-text-muted">
          No live execution.
        </p>
      </div>
    </Panel>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-1 px-3 py-2.5">
      <p className="text-[11px] text-text-muted">{label}</p>
      <p className="mono-number mt-1 text-xs text-text-secondary">{value}</p>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-xs text-text-secondary">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="relative h-5 w-9 rounded-full border border-border-strong bg-surface-3 transition after:absolute after:left-0.5 after:top-0.5 after:size-3.5 after:rounded-full after:bg-text-muted after:content-[''] after:transition peer-checked:border-accent-border peer-checked:bg-accent-soft peer-checked:after:translate-x-4 peer-checked:after:bg-accent" />
    </label>
  )
}
