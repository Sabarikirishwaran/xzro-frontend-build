'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LogoMark } from '@/components/logo-mark'
import { BackendStatusPill } from '@/components/backend-status-pill'
import { useBackendHealth } from '@/lib/hooks'

const NAV_LINKS = [
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Why xZro', href: '#why' },
  { label: 'Architecture', href: '#architecture' },
]

export function LandingNav() {
  const { status, health } = useBackendHealth()

  return (
    <header className="sticky top-0 z-30 border-b border-xborder bg-xbg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="hidden rounded-full border border-xborder bg-xpanel-2 px-2.5 py-0.5 text-[11px] text-xtext-muted md:inline">
            Verifier-first AI strategy governor
          </span>
        </div>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-xtext-muted transition-colors hover:text-xtext"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <BackendStatusPill
            status={status}
            venue={health?.venue}
            missingCount={health?.missing?.length}
            className="hidden sm:inline-flex"
          />
          <Link
            href="/app/run"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Run Agent
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
