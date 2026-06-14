'use client'

import { cn } from '@/lib/utils'

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-xtext-soft">{label}</label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-xtext-muted">{hint}</p>}
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-xl border border-xborder bg-xpanel-2 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
            value === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'text-xtext-muted hover:text-xtext',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-xtext-soft">{label}</p>
        {hint && <p className="mt-0.5 text-xs leading-relaxed text-xtext-muted">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked
            ? 'border-xaccent-strong/50 bg-xaccent-strong/30'
            : 'border-xborder bg-xpanel-2',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4 rounded-full transition-all',
            checked ? 'left-[22px] bg-xaccent-strong' : 'left-0.5 bg-xneutral',
          )}
        />
      </button>
    </div>
  )
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : ''}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-xl border border-xborder bg-xpanel-2 px-3 py-2 font-mono text-sm text-xtext outline-none transition-colors focus:border-xborder-strong"
    />
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-xborder bg-xpanel-2 px-3 py-2 font-mono text-sm text-xtext outline-none transition-colors placeholder:text-xtext-muted focus:border-xborder-strong"
    />
  )
}

export function Chips({
  options,
  selected,
  onToggle,
}: {
  options: number[]
  selected: number[]
  onToggle: (v: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(
              'rounded-full border px-3 py-1.5 font-mono text-xs transition-colors',
              active
                ? 'border-xaccent-strong/50 bg-xaccent-strong/10 text-xaccent-strong'
                : 'border-xborder bg-xpanel-2 text-xtext-muted hover:text-xtext',
            )}
          >
            {opt}m
          </button>
        )
      })}
    </div>
  )
}
