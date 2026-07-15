import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'warn' | 'ok' | 'info'
}) {
  const tones = {
    default: 'border-portal-200/80',
    warn: 'border-warning/40 bg-warning/5',
    ok: 'border-success/30 bg-success/5',
    info: 'border-portal-300 bg-portal-50/80',
  }
  return (
    <div className={cn('rounded-2xl border bg-white px-5 py-4 shadow-sm', tones[tone])}>
      <p className="text-xs font-medium text-espresso-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-espresso-900">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-portal-600">{hint}</p> : null}
    </div>
  )
}

export function AdminBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'ok' | 'warn' | 'danger' | 'info' | 'accent'
}) {
  const map = {
    neutral: 'bg-cream-200 text-espresso-700',
    ok: 'bg-success/10 text-success',
    warn: 'bg-warning/15 text-warning',
    danger: 'bg-terracotta-500/10 text-terracotta-600',
    info: 'bg-portal-100 text-portal-700',
    accent: 'bg-terracotta-500/10 text-terracotta-600',
  }
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium', map[tone])}>
      {children}
    </span>
  )
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-espresso-900 sm:text-3xl">
          {title}
        </h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-espresso-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-portal-200/80 bg-white shadow-[0_1px_2px_rgba(26,35,72,0.04)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-portal-200/80 bg-white p-3">
      {children}
    </div>
  )
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-portal-200/80 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  )
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'border-b border-portal-100 bg-portal-50/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-espresso-500',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('border-b border-portal-50 px-4 py-3 text-espresso-800', className)}>{children}</td>
}

export function ActionBtn({
  children,
  onClick,
  variant = 'ghost',
  type = 'button',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'ghost' | 'primary' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}) {
  const v = {
    ghost: 'border-portal-200 text-portal-800 hover:bg-portal-50',
    primary: 'border-portal-700 bg-portal-800 text-white hover:bg-portal-700',
    danger: 'border-terracotta-500/30 text-terracotta-600 hover:bg-terracotta-500/5',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 items-center rounded-lg border px-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        v[variant],
      )}
    >
      {children}
    </button>
  )
}

export function fieldClass() {
  return 'h-9 rounded-lg border border-portal-200 bg-white px-3 text-sm outline-none focus:border-portal-600 focus:ring-2 focus:ring-portal-600/15'
}
