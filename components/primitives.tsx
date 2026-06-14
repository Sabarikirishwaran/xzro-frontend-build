'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/format'

/* ---------- Panel ---------- */

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('x-panel rounded-2xl', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function PanelHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-xborder px-5 py-4">
      <div className="flex items-start gap-3">
        {icon && <span className="mt-0.5 text-xaccent-strong">{icon}</span>}
        <div>
          <h3 className="font-heading text-base font-semibold text-xtext">{title}</h3>
          {description && (
            <p className="mt-1 text-sm leading-relaxed text-xtext-muted">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}

/* ---------- Tone helpers ---------- */

const toneClasses: Record<Tone, string> = {
  neutral: 'border-xborder bg-xpanel-2 text-xtext-soft',
  success: 'border-xaccent-strong/40 bg-xaccent-strong/10 text-xaccent-strong',
  warning: 'border-xwarning/40 bg-xwarning/10 text-xwarning',
  danger: 'border-xdanger/40 bg-xdanger/10 text-xdanger',
  cyan: 'border-xcyan/40 bg-xcyan/10 text-xcyan',
  violet: 'border-xviolet/40 bg-xviolet/10 text-xviolet',
}

const dotClasses: Record<Tone, string> = {
  neutral: 'bg-xneutral',
  success: 'bg-xaccent-strong',
  warning: 'bg-xwarning',
  danger: 'bg-xdanger',
  cyan: 'bg-xcyan',
  violet: 'bg-xviolet',
}

/* ---------- StatusBadge ---------- */

export function StatusBadge({
  value,
  tone = 'neutral',
  dot = false,
  className,
}: {
  value: string
  tone?: Tone
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dotClasses[tone])} />}
      {value}
    </span>
  )
}

/* ---------- PercentValue ---------- */

export function PercentValue({
  value,
  digits = 3,
  className,
}: {
  value?: number
  digits?: number
  className?: string
}) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return <span className={cn('font-mono text-xtext-muted', className)}>—</span>
  }
  const tone =
    value > 0 ? 'text-xaccent-strong' : value < 0 ? 'text-xdanger' : 'text-xtext-muted'
  const sign = value > 0 ? '+' : ''
  return (
    <span className={cn('font-mono tabular-nums', tone, className)}>
      {sign}
      {value.toFixed(digits)}%
    </span>
  )
}

/* ---------- MonoValue ---------- */

export function MonoValue({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn('font-mono text-sm tabular-nums text-xtext-soft', className)}>
      {children}
    </span>
  )
}

/* ---------- CopyButton ---------- */

export function CopyButton({
  text,
  label = 'Copy',
  className,
}: {
  text: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-xborder bg-xpanel-2 px-2.5 py-1.5 text-xs font-medium text-xtext-soft transition-colors hover:border-xborder-strong hover:text-xtext',
        className,
      )}
    >
      {copied ? <Check className="size-3.5 text-xaccent-strong" /> : <Copy className="size-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  )
}
