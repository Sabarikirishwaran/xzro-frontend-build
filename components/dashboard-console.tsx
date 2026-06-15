'use client'

import { useCallback, useEffect, useState } from 'react'
import { CandidateTable } from './candidate-table'
import { DecisionSummary } from './decision-summary'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from './dashboard-states'
import { FeatureTable } from './feature-table'
import { GateSummary } from './gate-summary'
import { ScanControlPanel } from './scan-control-panel'
import { normalizeXzroResult } from '@/lib/normalize-xzro'
import {
  buildLocalSafeResult,
  getXzroAccessStatus,
  runXzroCycle,
  XzroRequestError,
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

type AccessStateValue = 'checking' | 'granted' | 'unavailable'

export function DashboardConsole() {
  const [budget, setBudget] = useState(100)
  const [runState, setRunState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [slow, setSlow] = useState(false)
  const [result, setResult] = useState<NormalizedResult | null>(null)
  const [accessState, setAccessState] =
    useState<AccessStateValue>('checking')
  const [scanError, setScanError] = useState<string | null>(null)

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

  const refreshAccessStatus = useCallback(async () => {
    setAccessState('checking')

    try {
      const status = await getXzroAccessStatus()
      setAccessState(status.authenticated ? 'granted' : 'unavailable')
    } catch {
      setAccessState('unavailable')
    }
  }, [])

  useEffect(() => {
    void refreshAccessStatus()
  }, [refreshAccessStatus])

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
      setScanError(null)

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
    if (accessState !== 'granted') return

    setRunState('loading')
    setScanError(null)

    try {
      let response: XzroCycleResponse

      try {
        response = await runXzroCycle(budget)
      } catch (error) {
        if (
          !(error instanceof XzroRequestError) ||
          error.code !== 'access_required'
        ) {
          throw error
        }

        const status = await getXzroAccessStatus()
        if (!status.authenticated) throw error
        response = await runXzroCycle(budget)
      }

      commitResult(response, 'hyperliquid')
    } catch (error) {
      setRunState('idle')

      if (error instanceof XzroRequestError) {
        if (error.code === 'rate_limited') {
          setScanError('Request limit reached. Please wait before trying again.')
          return
        }

        if (error.code !== 'upstream_unavailable') {
          setScanError('The scan is temporarily unavailable. Please try again.')
          return
        }
      }

      commitResult(buildLocalSafeResult(), 'mock')
    }
  }, [accessState, budget, commitResult])

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
            disabled={accessState !== 'granted'}
            onRun={executeScan}
          />
        </aside>

        <section aria-live="polite" className="min-w-0">
          {accessState === 'unavailable' ? (
            <ErrorState
              message="The strategy console is temporarily unavailable."
              onRetry={refreshAccessStatus}
            />
          ) : accessState === 'checking' ? (
            <LoadingState slow={false} />
          ) : runState === 'loading' ? (
            <LoadingState slow={slow} />
          ) : scanError ? (
            <ErrorState message={scanError} onRetry={executeScan} />
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
