'use client'

import { useCallback, useEffect, useState } from 'react'
import { BackendStatusPanel } from './backend-status-panel'
import { CandidateTable } from './candidate-table'
import { DecisionSummary } from './decision-summary'
import { DeveloperJsonPanel } from './developer-json-panel'
import { EmptyState, ErrorState, LoadingState } from './dashboard-states'
import { FeatureTable } from './feature-table'
import { GateSummary } from './gate-summary'
import { ScanControlPanel } from './scan-control-panel'
import { sanitizeDeveloperResponse, normalizeXzroResult } from '@/lib/normalize-xzro'
import {
  buildHyperliquidPayload,
  buildLocalSafeResult,
  buildSafeSamplePayload,
  getXzroHealth,
  runXzroCycle,
  XzroRequestError,
} from '@/lib/xzro-client'
import type {
  HealthState,
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

type ScanError = {
  message: string
  status?: number
  details?: unknown
}

export function DashboardConsole() {
  const [healthState, setHealthState] = useState<HealthState>('checking')
  const [venueMode, setVenueMode] = useState<VenueMode>('hyperliquid')
  const [budget, setBudget] = useState(100)
  const [includeRawBooks, setIncludeRawBooks] = useState(false)
  const [useFallback, setUseFallback] = useState(true)
  const [runState, setRunState] = useState<'idle' | 'loading' | 'success'>('idle')
  const [slow, setSlow] = useState(false)
  const [result, setResult] = useState<NormalizedResult | null>(null)
  const [lastRun, setLastRun] = useState<Date | null>(null)
  const [error, setError] = useState<ScanError | null>(null)

  const checkHealth = useCallback(async () => {
    setHealthState('checking')
    try {
      await getXzroHealth()
      setHealthState('online')
    } catch (healthError) {
      setHealthState(
        healthError instanceof XzroRequestError &&
          (healthError.status === 401 || healthError.status === 403)
          ? 'auth_error'
          : 'offline',
      )
    }
  }, [])

  useEffect(() => {
    checkHealth()
    const interval = window.setInterval(checkHealth, 30000)
    return () => window.clearInterval(interval)
  }, [checkHealth])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const stored = JSON.parse(raw) as StoredResult
      setResult(normalizeXzroResult(stored.response, stored.venue))
      setLastRun(new Date(stored.timestamp))
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
      setLastRun(timestamp)
      setRunState('success')

      try {
        const stored: StoredResult = {
          response,
          venue: requestedVenue,
          timestamp: timestamp.toISOString(),
        }
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
      } catch {
        // The live result remains available if storage is full or blocked.
      }

      window.setTimeout(() => setRunState('idle'), 1200)
    },
    [],
  )

  const executeScan = useCallback(
    async (requestedVenue: VenueMode) => {
      setRunState('loading')
      setError(null)

      const payload =
        requestedVenue === 'mock'
          ? buildSafeSamplePayload(budget)
          : buildHyperliquidPayload(budget, includeRawBooks, useFallback)

      try {
        const response = await runXzroCycle(payload)
        commitResult(response, requestedVenue)
      } catch (scanError) {
        if (requestedVenue === 'mock') {
          commitResult(buildLocalSafeResult(), 'mock')
          return
        }

        const requestError =
          scanError instanceof XzroRequestError ? scanError : null
        setRunState('idle')
        setError({
          message: requestError?.message ?? 'Unexpected response from backend.',
          status: requestError?.status,
          details: sanitizeDeveloperResponse(requestError?.details),
        })
      }
    },
    [budget, commitResult, includeRawBooks, useFallback],
  )

  const primaryUnavailable =
    healthState === 'checking' ||
    healthState === 'offline' ||
    healthState === 'auth_error'

  return (
    <div className="fade-in mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col justify-between gap-4 border-b border-border-subtle pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-accent">
            Strategy console
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary sm:text-4xl">
            Verified market decisions.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">
            Run a fast venue scan, inspect candidates, and review the verified
            decision.
          </p>
        </div>
        <p className="mono-number text-xs text-text-muted">
          Browser → /api/xzro → protected backend
        </p>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-24">
          <ScanControlPanel
            venueMode={venueMode}
            onVenueModeChange={setVenueMode}
            budget={budget}
            onBudgetChange={setBudget}
            includeRawBooks={includeRawBooks}
            onIncludeRawBooksChange={setIncludeRawBooks}
            useFallback={useFallback}
            onUseFallbackChange={setUseFallback}
            healthState={healthState}
            runState={runState}
            hasResult={!!result}
            onRun={() => executeScan(venueMode)}
            onRunSafe={() => executeScan('mock')}
          />
          <BackendStatusPanel healthState={healthState} lastRun={lastRun} />
        </aside>

        <section aria-live="polite" className="min-w-0">
          {runState === 'loading' ? (
            <LoadingState slow={slow} />
          ) : error ? (
            <ErrorState
              message={error.message}
              status={error.status}
              details={error.details}
              onRetry={() => executeScan(venueMode)}
              onRunSafe={() => executeScan('mock')}
            />
          ) : result ? (
            <div className="result-in space-y-5">
              <DecisionSummary result={result} />
              <CandidateTable candidates={result.candidates} />
              <GateSummary gates={result.gates} />
              <FeatureTable features={result.features} />
              <DeveloperJsonPanel data={result.raw} timestamp={lastRun} />
            </div>
          ) : (
            <EmptyState
              onRun={() => executeScan('hyperliquid')}
              disabled={primaryUnavailable}
            />
          )}
        </section>
      </div>
    </div>
  )
}
