import type { Metadata } from 'next'
import { AppShell } from '@/components/app-shell'
import { DashboardConsole } from '@/components/dashboard-console'

export const metadata: Metadata = {
  title: 'Strategy console',
  description:
    'Run a fast venue scan, inspect candidates, and review the verified decision.',
}

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardConsole />
    </AppShell>
  )
}
