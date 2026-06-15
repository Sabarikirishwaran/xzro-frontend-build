import { AlertTriangle, LoaderCircle } from 'lucide-react'
import {
  Panel,
  primaryButtonClass,
  secondaryButtonClass,
} from './ui'

const steps = [
  'Venue state',
  'Feature extraction',
  'Candidate generation',
  'Gate checks',
  'Decision',
]

export function EmptyState({
  onRun,
  disabled,
}: {
  onRun: () => void
  disabled: boolean
}) {
  return (
    <Panel className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
      <span className="size-2 rounded-full bg-accent" />
      <h2 className="mt-5 text-lg font-medium text-text-primary">No scan yet</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-text-muted">
        Run a strategy scan to generate a verified decision.
      </p>
      <button
        type="button"
        onClick={onRun}
        disabled={disabled}
        className={`${primaryButtonClass} mt-6`}
      >
        Run strategy scan
      </button>
    </Panel>
  )
}

export function LoadingState({ slow }: { slow: boolean }) {
  return (
    <Panel
      className="min-h-[420px] px-6 py-12"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3">
          <LoaderCircle className="size-4 animate-spin text-accent" />
          <h2 className="text-base font-medium text-text-primary">
            Scanning market state…
          </h2>
        </div>
        <div className="mt-8 divide-y divide-border-subtle border-y border-border-subtle">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex items-center justify-between py-3.5 text-xs"
            >
              <span className="text-text-secondary">{step}</span>
              <span
                className="size-1.5 animate-pulse rounded-full bg-accent"
                style={{ animationDelay: `${index * 140}ms` }}
              />
            </div>
          ))}
        </div>
        {slow && (
          <p className="mt-5 text-xs leading-5 text-text-muted">
            Still scanning. This can take longer during venue fallback.
          </p>
        )}
      </div>
    </Panel>
  )
}

export function ErrorState({
  message,
  status,
  details,
  onRetry,
  onRunSafe,
}: {
  message: string
  status?: number
  details?: unknown
  onRetry: () => void
  onRunSafe: () => void
}) {
  return (
    <Panel className="overflow-hidden" role="alert">
      <div className="flex gap-4 p-5">
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-rose-300"
          strokeWidth={1.5}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-medium text-text-primary">
              Scan failed
            </h2>
            {status && (
              <span className="mono-number text-xs text-text-muted">
                HTTP {status}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{message}</p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={onRetry}
              className={primaryButtonClass}
            >
              Retry
            </button>
            <button
              type="button"
              onClick={onRunSafe}
              className={secondaryButtonClass}
            >
              Run safe sample
            </button>
          </div>
        </div>
      </div>
      {details !== undefined && (
        <details className="border-t border-border-subtle">
          <summary className="cursor-pointer px-5 py-3 text-xs text-text-muted">
            Technical details
          </summary>
          <pre className="max-h-56 overflow-auto bg-surface-1 p-5 font-mono text-xs leading-5 text-text-muted">
            {JSON.stringify(details, null, 2)}
          </pre>
        </details>
      )}
    </Panel>
  )
}
