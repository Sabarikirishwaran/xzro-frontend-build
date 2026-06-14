'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, CheckCircle2, Info } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Panel, PanelHeader, CopyButton, StatusBadge } from '@/components/primitives'
import { RunCycleForm } from '@/components/run/run-cycle-form'
import { LongRunningProgress } from '@/components/run/long-running-progress'
import { runAgentCycle } from '@/lib/api'
import { useLatestCycleResult, useSettings } from '@/lib/hooks'
import { PRESETS } from '@/lib/presets'
import type { AgentCycleRequest } from '@/lib/types'
import { getPaperOrderCount, getPortfolioDecision } from '@/lib/selectors'
import { decisionLabel, decisionTone, shortId } from '@/lib/format'

type RunError = {
  title: string
  type?: string
  message: string
  cta?: { label: string; action: () => void }
}

export default function RunPage() {
  const { save } = useLatestCycleResult()
  const { settings } = useSettings()
  const [payload, setPayload] = useState<AgentCycleRequest>(PRESETS.hyperliquidSmoke.payload)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<RunError | null>(null)
  const [success, setSuccess] = useState<{ cycleId: string; decision: string; orders: number } | null>(null)

  const update = (patch: Partial<AgentCycleRequest>) => {
    setPayload((prev) => ({ ...prev, ...patch }))
  }

  const reset = () => {
    setPayload(PRESETS.hyperliquidSmoke.payload)
    setError(null)
    setSuccess(null)
  }

  const submit = async () => {
    setIsRunning(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await runAgentCycle(payload)
      save(res, payload)
      setSuccess({
        cycleId: res.cycle_id,
        decision: getPortfolioDecision(res),
        orders: getPaperOrderCount(res),
      })
    } catch (err) {
      const e = err as Error & { detail?: any; status?: number }
      const message = e.message ?? 'Unknown error'
      const is429 = /429/.test(message) || /rate limit/i.test(message)
      const isTimeout = /timeout|timed out|ETIMEDOUT|aborted/i.test(message)

      if (is429) {
        setError({
          title: 'Backend cycle failed',
          type: e.detail?.error ?? 'ElfaMCPError',
          message: 'Elfa rate limit reached. Retry with Elfa disabled or reduce Elfa symbols per cycle.',
          cta: {
            label: 'Retry with Elfa disabled',
            action: () => {
              update({ enable_elfa: false })
              setError(null)
            },
          },
        })
      } else if (isTimeout) {
        setError({
          title: 'Request timed out',
          message: 'This run is too heavy for an interactive demo. Try the Hyperliquid Smoke preset.',
          cta: {
            label: 'Use Smoke preset',
            action: reset,
          },
        })
      } else {
        setError({
          title: 'Backend cycle failed',
          type: e.detail?.error,
          message: message.slice(0, 300),
        })
      }
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Run Agent Cycle"
        description="Configure a cycle and run it against the FastAPI backend. Paper execution only — no real funds are moved."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Form */}
        <RunCycleForm
          payload={payload}
          onChange={update}
          onSubmit={submit}
          onReset={reset}
          isRunning={isRunning}
          showAdvanced={settings.enableAdvanced}
        />

        {/* Right rail */}
        <div className="flex flex-col gap-6">
          <Panel>
            <PanelHeader
              title="Payload preview"
              action={<CopyButton text={JSON.stringify(payload, null, 2)} label="Copy JSON" />}
            />
            <pre className="x-scroll max-h-[24rem] overflow-auto p-5 font-mono text-xs leading-relaxed text-xtext-soft">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </Panel>

          <div className="x-panel flex gap-3 rounded-2xl p-4">
            <Info className="size-4 shrink-0 text-xcyan" strokeWidth={1.5} />
            <p className="text-xs leading-relaxed text-xtext-muted">
              This run may take several minutes. For live demos, use Hyperliquid Smoke or 10
              Symbols. Backend progress shown below is estimated.
            </p>
          </div>
        </div>
      </div>

      {/* Run state */}
      {(isRunning || error || success) && (
        <div className="mt-8">
          {isRunning && <LongRunningProgress />}

          {error && !isRunning && (
            <div className="x-panel rounded-2xl border-xdanger/30 p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-xdanger/40 bg-xdanger/10 text-xdanger">
                  <AlertTriangle className="size-5" strokeWidth={1.5} />
                </span>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-xtext">{error.title}</h3>
                  {error.type && (
                    <p className="mt-1 font-mono text-xs text-xdanger">{error.type}</p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-xtext-muted">{error.message}</p>
                  {error.cta && (
                    <button
                      type="button"
                      onClick={error.cta.action}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-xborder-strong bg-xpanel-2 px-4 py-2 text-sm font-semibold text-xtext transition-colors hover:border-xaccent-strong/50"
                    >
                      {error.cta.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {success && !isRunning && (
            <div className="x-panel rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-xaccent-strong/40 bg-xaccent-strong/10 text-xaccent-strong">
                  <CheckCircle2 className="size-5" strokeWidth={1.5} />
                </span>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-xtext">Cycle complete.</h3>
                  <p className="mt-1 text-sm text-xtext-muted">
                    The agent finished all available validation stages.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <StatusBadge value={`Cycle ${shortId(success.cycleId, 12)}`} tone="neutral" />
                    <StatusBadge
                      value={decisionLabel(success.decision)}
                      tone={decisionTone(success.decision)}
                    />
                    <StatusBadge
                      value={`${success.orders} paper orders`}
                      tone={success.orders > 0 ? 'cyan' : 'neutral'}
                    />
                  </div>
                  <Link
                    href="/app/results"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                  >
                    View Results <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
