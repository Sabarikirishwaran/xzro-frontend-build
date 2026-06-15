import { formatTime } from '@/lib/format'
import type { HealthState } from '@/lib/types'
import { ModeBadge } from './mode-badge'
import { Panel, PanelHeader } from './ui'

const healthLabels: Record<HealthState, string> = {
  checking: 'Checking',
  online: 'Online',
  offline: 'Unavailable',
  auth_error: 'Auth failed',
}

export function BackendStatusPanel({
  healthState,
  lastRun,
}: {
  healthState: HealthState
  lastRun: Date | null
}) {
  return (
    <Panel>
      <PanelHeader title="Backend status" />
      <dl className="divide-y divide-white/[0.055] px-5">
        <StatusRow label="Backend" value={healthLabels[healthState]} state={healthState} />
        <StatusRow
          label="Auth"
          value={
            healthState === 'online'
              ? 'Authenticated proxy'
              : healthState === 'auth_error'
                ? 'Failed'
                : 'Unavailable'
          }
        />
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="text-xs text-text-muted">Mode</dt>
          <dd>
            <ModeBadge />
          </dd>
        </div>
        <StatusRow label="Last run" value={formatTime(lastRun)} />
      </dl>
    </Panel>
  )
}

function StatusRow({
  label,
  value,
  state,
}: {
  label: string
  value: string
  state?: HealthState
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="flex items-center gap-2 text-xs text-text-secondary">
        {state && (
          <span
            className={`size-1.5 rounded-full ${
              state === 'online'
                ? 'bg-emerald-400'
                : state === 'auth_error'
                  ? 'bg-amber-300'
                  : state === 'offline'
                    ? 'bg-rose-400'
                    : 'animate-pulse bg-zinc-500'
            }`}
          />
        )}
        {value}
      </dd>
    </div>
  )
}
