'use client'

import { useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import type { AgentCycleRequest, Venue } from '@/lib/types'
import { PRESETS, PRESET_ORDER, type PresetKey } from '@/lib/presets'
import { Panel, PanelHeader } from '@/components/primitives'
import {
  Field,
  Segmented,
  Toggle,
  NumberInput,
  TextInput,
  Chips,
} from './form-controls'
import { cn } from '@/lib/utils'

const HORIZON_OPTIONS = [30, 120, 480]

export function RunCycleForm({
  payload,
  onChange,
  onSubmit,
  onReset,
  isRunning,
  showAdvanced,
}: {
  payload: AgentCycleRequest
  onChange: (patch: Partial<AgentCycleRequest>) => void
  onSubmit: () => void
  onReset: () => void
  isRunning: boolean
  showAdvanced: boolean
}) {
  const [activePreset, setActivePreset] = useState<PresetKey | null>('hyperliquidSmoke')

  const applyPreset = (key: PresetKey) => {
    setActivePreset(key)
    onChange(PRESETS[key].payload)
  }

  const presets = PRESET_ORDER.filter((k) => showAdvanced || !PRESETS[k].advanced)

  return (
    <div className="flex flex-col gap-6">
      {/* Presets */}
      <Panel>
        <PanelHeader title="Presets" description="Start from a tuned configuration." />
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {presets.map((key) => {
            const preset = PRESETS[key]
            const active = activePreset === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className={cn(
                  'flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors',
                  active
                    ? 'border-xaccent-strong/50 bg-xaccent-strong/5'
                    : 'border-xborder bg-xpanel-2 hover:border-xborder-strong',
                )}
              >
                <span className="text-sm font-semibold text-xtext">{preset.label}</span>
                <span className="text-xs leading-relaxed text-xtext-muted">
                  {preset.description}
                </span>
              </button>
            )
          })}
        </div>
      </Panel>

      {/* Venue */}
      <Panel>
        <PanelHeader title="Venue" />
        <div className="flex flex-col gap-4 p-5">
          <Segmented<Venue>
            options={[
              { value: 'hyperliquid', label: 'Hyperliquid' },
              { value: 'orderly', label: 'Orderly' },
            ]}
            value={payload.venue ?? 'hyperliquid'}
            onChange={(v) => onChange({ venue: v })}
          />
          <p className="text-xs leading-relaxed text-xtext-muted">
            Hyperliquid gives a broader high-liquidity perp universe. Orderly keeps the
            Mantle/Orderly path for the hackathon story.
          </p>
        </div>
      </Panel>

      {/* Universe */}
      <Panel>
        <PanelHeader title="Universe" />
        <div className="flex flex-col gap-5 p-5">
          <Toggle
            label="Use all venue symbols"
            hint="Scan the venue universe instead of a fixed symbol list."
            checked={!!payload.use_all_venue_symbols}
            onChange={(v) => onChange({ use_all_venue_symbols: v })}
          />
          {!payload.use_all_venue_symbols && (
            <Field
              label="Symbols"
              hint="Comma-separated. Used when not scanning the full universe."
            >
              <TextInput
                value={(payload.symbols ?? []).join(', ')}
                placeholder="BTC-PERP, ETH-PERP, SOL-PERP"
                onChange={(v) =>
                  onChange({
                    symbols: v
                      .split(',')
                      .map((s) => s.trim().toUpperCase())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Max symbols">
              <NumberInput
                value={payload.hyperliquid_universe_max_symbols ?? 10}
                min={1}
                max={50}
                onChange={(v) => onChange({ hyperliquid_universe_max_symbols: v })}
              />
            </Field>
            <Field label="Min active symbols">
              <NumberInput
                value={payload.hyperliquid_universe_min_active_symbols ?? 5}
                min={1}
                onChange={(v) => onChange({ hyperliquid_universe_min_active_symbols: v })}
              />
            </Field>
          </div>
        </div>
      </Panel>

      {/* Intelligence */}
      <Panel>
        <PanelHeader title="Intelligence" />
        <div className="flex flex-col gap-5 p-5">
          <Toggle
            label="Enable Elfa"
            hint="Elfa social intelligence can enrich symbols, but large runs may hit rate limits. Disable it for faster demos."
            checked={!!payload.enable_elfa}
            onChange={(v) => onChange({ enable_elfa: v })}
          />
          {payload.enable_elfa && (
            <>
              <Toggle
                label="Elfa best-effort"
                hint="Prevent a 429 from killing the whole cycle."
                checked={!!payload.elfa_best_effort}
                onChange={(v) => onChange({ elfa_best_effort: v })}
              />
              <Field label="Max Elfa symbols per cycle" hint="Recommended 6.">
                <NumberInput
                  value={payload.elfa_max_symbols_per_cycle ?? 6}
                  min={1}
                  onChange={(v) => onChange({ elfa_max_symbols_per_cycle: v })}
                />
              </Field>
            </>
          )}
        </div>
      </Panel>

      {/* Runtime */}
      <Panel>
        <PanelHeader title="Runtime" />
        <div className="flex flex-col gap-5 p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Samples / symbol" hint="Keep 1 for demos.">
              <NumberInput
                value={payload.samples_per_symbol ?? 1}
                min={1}
                onChange={(v) => onChange({ samples_per_symbol: v })}
              />
            </Field>
            <Field label="Min ticks / symbol">
              <NumberInput
                value={payload.min_ticks_per_symbol ?? 5}
                min={1}
                onChange={(v) => onChange({ min_ticks_per_symbol: v })}
              />
            </Field>
            <Field label="Warmup timeout (s)">
              <NumberInput
                value={payload.warmup_timeout_s ?? 45}
                min={10}
                onChange={(v) => onChange({ warmup_timeout_s: v })}
              />
            </Field>
          </div>

          <Field
            label="Horizons"
            hint="Short horizons run faster and are better for live demos."
          >
            <Chips
              options={HORIZON_OPTIONS}
              selected={payload.horizon_minutes ?? [30]}
              onToggle={(v) => {
                const cur = payload.horizon_minutes ?? []
                const next = cur.includes(v)
                  ? cur.filter((h) => h !== v)
                  : [...cur, v].sort((a, b) => a - b)
                onChange({ horizon_minutes: next.length ? next : [30] })
              }}
            />
          </Field>

          <Toggle
            label="Enable portfolio composition"
            hint="Turn on after a smoke test passes."
            checked={!!payload.enable_portfolio_composition}
            onChange={(v) => onChange({ enable_portfolio_composition: v })}
          />

          <Field label="Portfolio budget (USD)">
            <NumberInput
              value={payload.portfolio_budget_usd ?? 100}
              min={1}
              onChange={(v) => onChange({ portfolio_budget_usd: v })}
            />
          </Field>
        </div>
      </Panel>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isRunning}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          <Play className="size-4" />
          {isRunning ? 'Running…' : 'Run Agent Cycle'}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={isRunning}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-xborder bg-transparent px-6 py-3 text-sm font-semibold text-xtext-soft transition-colors hover:border-xborder-strong hover:text-xtext disabled:opacity-50"
        >
          <RotateCcw className="size-4" />
          Reset to Smoke Test
        </button>
      </div>
    </div>
  )
}
