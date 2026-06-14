import { LogoMark } from '@/components/logo-mark'

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-xborder">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <LogoMark />
          <p className="text-sm text-xtext-muted">
            Verifier-first AI strategy governor. Built for Turing Hack 2026.
          </p>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-xtext-muted">
          xZro is a paper-execution research demo. Not financial advice. No real funds are
          moved by this frontend.
        </p>
      </div>
    </footer>
  )
}
