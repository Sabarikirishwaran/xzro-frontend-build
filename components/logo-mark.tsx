import { cn } from '@/lib/utils'

type LogoMarkProps = {
  className?: string
  showWordmark?: boolean
}

export function LogoMark({ className, showWordmark = true }: LogoMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className="grid size-8 place-items-center rounded-xl border border-xborder-strong bg-xpanel-2 text-xaccent-strong x-glow"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16L8 18h12" />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-heading text-lg font-bold tracking-tight text-xtext">
          xZro
        </span>
      )}
    </span>
  )
}
