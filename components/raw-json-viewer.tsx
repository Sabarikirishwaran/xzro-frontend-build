'use client'

import { useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CopyButton } from './primitives'

export function RawJsonViewer({
  data,
  title = 'Raw JSON',
  defaultOpen = false,
  downloadName = 'xzro-result.json',
}: {
  data: unknown
  title?: string
  defaultOpen?: boolean
  downloadName?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const json = JSON.stringify(data, null, 2)

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = downloadName
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="x-panel overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 font-heading text-base font-semibold text-xtext"
        >
          <ChevronDown
            className={cn('size-4 text-xtext-muted transition-transform', open && 'rotate-180')}
          />
          {title}
        </button>
        <div className="flex items-center gap-2">
          <CopyButton text={json} />
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1.5 rounded-lg border border-xborder bg-xpanel-2 px-2.5 py-1.5 text-xs font-medium text-xtext-soft transition-colors hover:border-xborder-strong hover:text-xtext"
          >
            <Download className="size-3.5" />
            Download
          </button>
        </div>
      </div>
      {open && (
        <pre className="x-scroll max-h-[28rem] overflow-auto border-t border-xborder bg-xbg/60 px-5 py-4 font-mono text-xs leading-relaxed text-xtext-soft">
          {json}
        </pre>
      )}
    </div>
  )
}
