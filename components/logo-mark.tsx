import { cn } from '@/lib/utils'

type LogoMarkProps = {
  className?: string
  showWordmark?: boolean
}

export function LogoMark({ className, showWordmark = true }: LogoMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className="grid size-7 place-items-center rounded-lg border border-accent-border bg-accent-soft text-accent"
        aria-hidden="true"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16L8 18h12" />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-text-primary">
          xZro
        </span>
      )}
    </span>
  )
}
