'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Circle } from 'lucide-react'
import { RUNNING_STAGES } from '@/lib/presets'
import { cn } from '@/lib/utils'

export function LongRunningProgress() {
  const [progress, setProgress] = useState(0)
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    // Advance progress toward 98% and pause.
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 98) return 98
        const remaining = 98 - p
        return p + Math.max(0.4, remaining * 0.015)
      })
    }, 350)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let next = 0
    for (let i = 0; i < RUNNING_STAGES.length; i++) {
      if (progress >= RUNNING_STAGES[i][0]) next = i
    }
    setStageIndex(next)
  }, [progress])

  return (
    <div className="x-panel rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-xtext">
          Running xZro cycle
        </h3>
        <span className="font-mono text-sm tabular-nums text-xaccent-strong">
          {Math.round(progress)}%
        </span>
      </div>
      <p className="mt-1 text-sm text-xtext-muted">
        This can take 1–20 minutes depending on symbol count and LLM calls. Progress is estimated.
      </p>

      {/* Progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-xpanel-2">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stages */}
      <ol className="mt-6 flex flex-col gap-3">
        {RUNNING_STAGES.map(([threshold, label], i) => {
          const done = i < stageIndex
          const active = i === stageIndex
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={cn(
                  'grid size-6 place-items-center rounded-full border',
                  done
                    ? 'border-xaccent-strong/50 bg-xaccent-strong/10 text-xaccent-strong'
                    : active
                      ? 'border-xcyan/50 bg-xcyan/10 text-xcyan'
                      : 'border-xborder bg-xpanel-2 text-xtext-muted',
                )}
              >
                {done ? (
                  <Check className="size-3.5" strokeWidth={2.5} />
                ) : active ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Circle className="size-2.5" />
                )}
              </span>
              <span
                className={cn(
                  'text-sm',
                  done ? 'text-xtext-muted line-through' : active ? 'text-xtext' : 'text-xtext-muted',
                )}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
