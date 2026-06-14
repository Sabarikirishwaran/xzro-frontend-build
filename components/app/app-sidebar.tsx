'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Play,
  FileBarChart,
  LineChart,
  BrainCircuit,
  ShieldAlert,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const NAV_ITEMS = [
  { label: 'Overview', href: '/app', icon: LayoutDashboard },
  { label: 'Run Cycle', href: '/app/run', icon: Play },
  { label: 'Results', href: '/app/results', icon: FileBarChart },
  { label: 'Markets', href: '/app/markets', icon: LineChart },
  { label: 'Strategies', href: '/app/strategies', icon: BrainCircuit },
  { label: 'Audit', href: '/app/audit', icon: ShieldAlert },
  { label: 'Settings', href: '/app/settings', icon: Settings },
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border border-xborder-strong bg-xpanel-2 text-xaccent-strong'
                : 'text-xtext-muted hover:bg-xpanel-2/60 hover:text-xtext',
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.5} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
