'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronDown, Copy } from 'lucide-react'
import { sanitizeDeveloperResponse } from '@/lib/normalize-xzro'
import { Panel } from './ui'

export function DeveloperJsonPanel({
  data,
  timestamp,
}: {
  data: unknown
  timestamp: Date | null
}) {
  const [copied, setCopied] = useState(false)
  const json = useMemo(
    () => JSON.stringify(sanitizeDeveloperResponse(data), null, 2),
    [data],
  )

  const copy = async () => {
    await navigator.clipboard?.writeText(json)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <Panel className="overflow-hidden">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2">
            <ChevronDown className="size-4 text-text-muted transition group-open:rotate-180" />
            <span className="text-sm font-medium text-text-primary">
              Developer response
            </span>
          </div>
          <span className="mono-number text-[11px] text-text-muted">
            {timestamp?.toLocaleTimeString() ?? '—'}
          </span>
        </summary>
        <div className="border-t border-border-subtle">
          <div className="flex justify-end border-b border-border-subtle px-4 py-2.5">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-white/[0.025] px-2.5 py-1.5 text-xs text-text-secondary transition hover:bg-white/[0.05]"
            >
              {copied ? (
                <Check className="size-3.5 text-accent" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {copied ? 'Copied' : 'Copy response'}
            </button>
          </div>
          <pre className="max-h-[28rem] overflow-auto bg-surface-1/70 p-5 font-mono text-xs leading-6 text-text-secondary">
            {json}
          </pre>
        </div>
      </details>
    </Panel>
  )
}
