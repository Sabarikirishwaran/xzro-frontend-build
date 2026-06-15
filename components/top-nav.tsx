'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { LogoMark } from './logo-mark'
import { ModeBadge } from './mode-badge'
import { StatusBadge } from './status-badge'
import { getXzroHealth, XzroRequestError } from '@/lib/xzro-client'
import type { HealthState } from '@/lib/types'

export function TopNav() {
  const pathname = usePathname()
  const [healthState, setHealthState] = useState<HealthState>('checking')

  useEffect(() => {
    let active = true

    getXzroHealth()
      .then(() => {
        if (active) setHealthState('online')
      })
      .catch((error) => {
        if (!active) return
        setHealthState(
          error instanceof XzroRequestError &&
            (error.status === 401 || error.status === 403)
            ? 'auth_error'
            : 'offline',
        )
      })

    return () => {
      active = false
    }
  }, [])

  const onDashboard = pathname === '/dashboard'

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="xZro home">
          <LogoMark />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          <Link
            href="/about"
            className="text-sm text-text-muted transition hover:text-text-primary"
          >
            System
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-text-muted transition hover:text-text-primary"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <StatusBadge
            state={healthState}
            compact
            className="sm:hidden"
          />
          <StatusBadge
            state={healthState}
            className="hidden sm:inline-flex"
          />
          <ModeBadge />
          <Link
            href={onDashboard ? '/' : '/dashboard'}
            className="hidden min-h-9 items-center gap-1.5 rounded-full bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-950 transition hover:bg-white sm:inline-flex"
          >
            {onDashboard ? 'Home' : 'Open dashboard'}
            {!onDashboard && <ArrowRight className="size-3.5" />}
          </Link>
          <Link
            href={onDashboard ? '/' : '/dashboard'}
            className="inline-flex min-h-9 items-center rounded-full bg-zinc-100 px-3.5 py-2 text-xs font-medium text-zinc-950 sm:hidden"
          >
            {onDashboard ? 'Home' : 'Dashboard'}
          </Link>
        </div>
      </div>
    </header>
  )
}
