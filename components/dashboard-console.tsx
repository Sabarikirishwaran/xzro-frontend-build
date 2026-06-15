'use client'

import { useCallback, useEffect, useState } from 'react'
import { CandidateTable } from './candidate-table'
import { DecisionSummary } from './decision-summary'
import { EmptyState, LoadingState } from './dashboard-states'
import { FeatureTable } from './feature-table'
import { GateSummary } from './gate-summary'
import { ScanControlPanel } from './scan-control-panel'
import { normalizeXzroResult } from '@/lib/normalize-xzro'
import {
  buildHyperliquidPayload,
  buildLocalSafeResult,
  runXzroCycle,
} from '@/lib/xzro-client'
import type {
  NormalizedResult,
  VenueMode,
  XzroCycleResponse,
} from '@/lib/types'

const STORAGE_KEY = 'xzro.latestDecision'

type StoredResult = {
  response: XzroCycleResponse
  venue: VenueMode
  timestamp: string
}

export function DashboardConsole() {
  const [budget, setBudget] = useState(100)
  const [runState, setRunState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [slow, setSlow] = useState(false)
  const [result, setResult] = useState<NormalizedResult | null>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const stored = JSON.parse(raw) as StoredResult
      setResult(normalizeXzroResult(stored.response, stored.venue))
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (runState !== 'loading') {
      setSlow(false)
      return
    }

    const timer = window.setTimeout(() => setSlow(true), 45000)
    return () => window.clearTimeout(timer)
  }, [runState])

  const commitResult = useCallback(
    (response: XzroCycleResponse, requestedVenue: VenueMode) => {
      const timestamp = new Date()
      setResult(normalizeXzroResult(response, requestedVenue))
      setRunState('success')

      try {
        const stored: StoredResult = {
          response,
          venue: requestedVenue,
          timestamp: timestamp.toISOString(),
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
      } catch {
        // The current result remains available if local storage is unavailable.
      }

      window.setTimeout(() => setRunState('idle'), 1200)
    },
    [],
  )

  const executeScan = useCallback(async () => {
    setRunState('loading')

    try {
      const response = await runXzroCycle(buildHyperliquidPayload(budget))
      commitResult(response, 'hyperliquid')
    } catch {
      commitResult(buildLocalSafeResult(), 'mock')
    }
  }, [budget, commitResult])

  return (
    <div className="fade-in mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="border-b border-border-subtle pb-7">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Strategy console
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary sm:text-4xl">
          Verified market decisions.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
          Run a market scan, inspect candidates, and review the verified
          decision.
        </p>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24">
          <ScanControlPanel
            budget={budget}
            onBudgetChange={setBudget}
            runState={runState}
            hasResult={!!result}
            onRun={executeScan}
          />
        </aside>

        <section aria-live="polite" className="min-w-0">
          {runState === 'loading' ? (
            <LoadingState slow={slow} />
          ) : result ? (
            <div className="result-in space-y-5">
              <DecisionSummary result={result} />
              <CandidateTable candidates={result.candidates} />
              <GateSummary gates={result.gates} />
              <FeatureTable features={result.features} />
            </div>
          ) : (
            <EmptyState onRun={executeScan} disabled={false} />
          )}
        </section>
      </div>
    </div>
  )
}
