import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

export function PortalPage({
  children,
  className,
  narrow,
}: {
  children: ReactNode
  className?: string
  narrow?: boolean
}) {
  return (
    <div
      className={cn(
        'mx-auto space-y-8 pb-4 animate-portal-in',
        narrow ? 'max-w-3xl' : 'max-w-[1120px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-espresso-900 sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-espresso-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function PortalCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-[1.25rem] border border-espresso-900/8 bg-white shadow-soft',
        padded && 'p-5 sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function PortalSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">{children}</p>
  )
}

export function PortalEmpty({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <PortalCard>
      <div className="px-2 py-8 text-center sm:px-6 sm:py-10">
        <p className="font-display text-base font-semibold text-espresso-900">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-espresso-500">{body}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </PortalCard>
  )
}

export function PortalBackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-block text-sm font-medium text-espresso-600 transition hover:text-espresso-900 hover:underline"
    >
      {children}
    </Link>
  )
}

export function PortalStatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'success' | 'warning' | 'neutral' | 'info'
}) {
  const styles = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/15 text-warning',
    info: 'bg-cream-200 text-espresso-700',
    neutral: 'bg-cream-100 text-espresso-600',
  }
  return (
    <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium', styles[tone])}>
      {children}
    </span>
  )
}

export function PortalProgress({ value, gold }: { value: number; gold?: boolean }) {
  return (
    <div className="h-0.5 overflow-hidden rounded-full bg-cream-200">
      <div
        className={cn('h-full rounded-full transition-all duration-300', gold ? 'bg-gold-600' : 'bg-espresso-800')}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function PortalPrimaryBtn({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-full bg-espresso-900 px-4 text-xs font-semibold text-cream-100 transition hover:bg-espresso-800 disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function PortalGhostBtn({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-full border border-espresso-900/12 bg-white px-4 text-xs font-medium text-espresso-800 transition hover:border-espresso-900/25 hover:bg-cream-50 disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
