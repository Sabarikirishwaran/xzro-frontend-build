import { SiteFooter } from './site-footer'
import { TopNav } from './top-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-grid min-h-screen bg-background">
      <TopNav />
      <main className="relative z-10">{children}</main>
      <SiteFooter />
    </div>
  )
}
