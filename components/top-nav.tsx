import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LogoMark } from './logo-mark'

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="xZro home">
          <LogoMark />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          <Link
            href="/about"
            className="text-sm text-text-secondary transition hover:text-text-primary"
          >
            System
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-text-secondary transition hover:text-text-primary"
          >
            Dashboard
          </Link>
        </nav>

        <Link
          href="/dashboard"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-950 transition hover:bg-white"
        >
          Open dashboard
          <ArrowRight className="hidden size-3.5 sm:block" />
        </Link>
      </div>
    </header>
  )
}
