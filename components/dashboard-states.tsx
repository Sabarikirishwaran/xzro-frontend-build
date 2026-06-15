import { LoaderCircle } from 'lucide-react'
import { Panel, primaryButtonClass } from './ui'

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
      <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
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
            Scanning market state...
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
          <p className="mt-5 text-xs leading-5 text-text-secondary">
            Still scanning. Market conditions can extend analysis time.
          </p>
        )}
      </div>
    </Panel>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Panel className="flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
      <span className="size-2 rounded-full bg-status-warning" />
      <h2 className="mt-5 text-lg font-medium text-text-primary">
        Scan unavailable
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={`${primaryButtonClass} mt-6`}
      >
        Try again
      </button>
    </Panel>
  )
}
