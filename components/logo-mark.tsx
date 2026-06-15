import Image from 'next/image'
import { cn } from '@/lib/utils'

type LogoMarkProps = {
  className?: string
  showWordmark?: boolean
}

export function LogoMark({ className, showWordmark = true }: LogoMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Image
        src="/logo-wiremesh.png"
        alt=""
        width={391}
        height={302}
        priority
        className="h-9 w-auto"
      />
      {showWordmark && (
        <span className="text-base font-semibold tracking-[-0.02em] text-text-primary">
          xZro
        </span>
      )}
    </span>
  )
}
