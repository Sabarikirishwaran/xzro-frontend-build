'use client'

import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { useLatestCycleResult, useSettings } from '@/lib/hooks'
import { PRESETS, PRESET_ORDER } from '@/lib/presets'
import type { Venue } from '@/lib/types'
import { PageHeader } from '@/components/app/page-header'
import { Panel, PanelHeader } from '@/components/primitives'
import { Field, Segmented, Toggle } from '@/components/run/form-controls'

export default function SettingsPage() {
  const { settings, update } = useSettings()
  const { result, clear } = useLatestCycleResult()
  const [cleared, setCleared] = useState(false)

  return (
    <>
      <PageHeader
        title="Settings"
        description="Frontend-only preferences. API keys are never stored in the browser."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Connection" description="The frontend talks to the backend through a server-side proxy." />
          <div className="flex flex-col gap-5 p-5">
            <Field label="Backend URL" hint="Configured server-side via BACKEND_URL. Requests are proxied through /api/backend.">
              <div className="rounded-xl border border-xborder bg-xbg/60 px-3 py-2 font-mono text-sm text-xtext-muted">
                /api/backend → $BACKEND_URL
              </div>
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Defaults" description="Pre-fill the run form when you open it." />
          <div className="flex flex-col gap-5 p-5">
            <Field label="Default venue">
              <Segmented<Venue>
                value={settings.defaultVenue}
                onChange={(v) => update({ defaultVenue: v })}
                options={[
                  { value: 'hyperliquid', label: 'Hyperliquid' },
                  { value: 'orderly', label: 'Orderly' },
                ]}
              />
            </Field>
            <Field label="Default preset">
              <select
                value={settings.defaultPreset}
                onChange={(e) => update({ defaultPreset: e.target.value })}
                className="rounded-xl border border-xborder bg-xpanel-2 px-3 py-2 text-sm text-xtext-soft focus:border-xaccent-strong focus:outline-none"
              >
                {PRESET_ORDER.map((key) => (
                  <option key={key} value={key}>
                    {PRESETS[key].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Behavior" description="Control advanced controls and result caching." />
          <div className="flex flex-col gap-5 p-5">
            <Toggle
              label="Enable advanced controls"
              hint="Show runtime tuning and the advanced benchmark preset on the run page."
              checked={settings.enableAdvanced}
              onChange={(v) => update({ enableAdvanced: v })}
            />
            <Toggle
              label="Auto-save latest result"
              hint="Persist the most recent cycle response to localStorage so it survives reloads."
              checked={settings.autoSaveResult}
              onChange={(v) => update({ autoSaveResult: v })}
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Cached result" description="The latest cycle stored locally in this browser." />
          <div className="flex flex-col gap-4 p-5">
            <div className="rounded-xl border border-xborder bg-xbg/60 px-4 py-3 text-sm">
              {result ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xtext-muted">Cycle</span>
                  <span className="font-mono text-xtext-soft">{result.cycle_id}</span>
                </div>
              ) : (
                <p className="text-xtext-muted">No cached result.</p>
              )}
            </div>
            <button
              type="button"
              disabled={!result}
              onClick={() => {
                clear()
                setCleared(true)
                setTimeout(() => setCleared(false), 1500)
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-xdanger/40 bg-xdanger/10 px-4 py-2 text-sm font-medium text-xdanger transition-colors hover:bg-xdanger/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cleared ? <Check className="size-4" /> : <Trash2 className="size-4" />}
              {cleared ? 'Cleared' : 'Clear cached result'}
            </button>
          </div>
        </Panel>
      </div>
    </>
  )
}
