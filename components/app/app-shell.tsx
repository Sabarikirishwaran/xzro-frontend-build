'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Menu, X } from 'lucide-react'
import { LogoMark } from '@/components/logo-mark'
import { BackendStatusPill } from '@/components/backend-status-pill'
import { useBackendHealth } from '@/lib/hooks'
import { AppSidebar } from './app-sidebar'
import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: React.ReactNode }) {
  const { status, health } = useBackendHealth(30000)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="grid-bg relative min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-xborder bg-xbg/70 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="grid size-9 place-items-center rounded-lg border border-xborder text-xtext-muted lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <Link href="/">
              <LogoMark />
            </Link>
          </div>

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

      <div className="relative z-10 mx-auto flex max-w-[1440px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[260px] shrink-0 border-r border-xborder lg:block">
          <AppSidebar />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[260px] border-r border-xborder bg-xbg-elevated">
              <div className="flex h-16 items-center justify-between border-b border-xborder px-4">
                <LogoMark />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="grid size-9 place-items-center rounded-lg border border-xborder text-xtext-muted"
                  aria-label="Close navigation"
                >
                  <X className="size-5" />
                </button>
              </div>
              <AppSidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className={cn('min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8')}>{children}</main>
      </div>
    </div>
  )
}
