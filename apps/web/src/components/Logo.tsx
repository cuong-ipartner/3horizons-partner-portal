import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type LogoProps = {
  to?: string
  variant?: 'light' | 'dark' | 'portal'
  className?: string
  showWordmark?: boolean
  subtitle?: string
}

export function LogoMark({ className, variant = 'dark' }: { className?: string; variant?: LogoProps['variant'] }) {
  const bg =
    variant === 'light'
      ? 'bg-cream-50 text-espresso-900'
      : variant === 'portal'
        ? 'bg-espresso-900 text-cream-100'
        : 'bg-espresso-800 text-cream-50'

  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold tracking-wide',
        bg,
        className,
      )}
    >
      3H
    </span>
  )
}

export function Logo({
  to = '/',
  variant = 'dark',
  className,
  showWordmark = true,
  subtitle,
}: LogoProps) {
  const text =
    variant === 'light'
      ? 'text-cream-50'
      : variant === 'portal'
        ? 'text-espresso-900'
        : 'text-espresso-900'
  const sub =
    variant === 'light' ? 'text-cream-300' : variant === 'portal' ? 'text-espresso-500' : 'text-espresso-500'

  const inner = (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark variant={variant === 'light' ? 'light' : variant === 'portal' ? 'portal' : 'dark'} />
      {showWordmark ? (
        <span className="min-w-0">
          <span className={cn('block text-sm font-semibold tracking-wide', text)}>3HORIZONS</span>
          {subtitle ? <span className={cn('block text-[11px]', sub)}>{subtitle}</span> : null}
        </span>
      ) : null}
    </span>
  )

  if (to) {
    return (
      <Link to={to} className="inline-flex">
        {inner}
      </Link>
    )
  }
  return inner
}
