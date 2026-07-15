import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8', className)}>{children}</div>
}

export function Section({
  className,
  children,
  id,
}: {
  className?: string
  children: ReactNode
  id?: string
}) {
  return (
    <section id={id} className={cn('py-14 sm:py-18 lg:py-20', className)}>
      {children}
    </section>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[0.18em] text-espresso-500',
        className,
      )}
    >
      {children}
    </p>
  )
}

export function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={cn(
        'font-display text-4xl font-semibold leading-[1.15] tracking-tight text-espresso-900 sm:text-5xl lg:text-[3.15rem]',
        className,
      )}
    >
      {children}
    </h1>
  )
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        'font-display text-3xl font-semibold tracking-tight text-espresso-900 sm:text-4xl',
        className,
      )}
    >
      {children}
    </h2>
  )
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('max-w-2xl text-base leading-relaxed text-espresso-600 sm:text-lg', className)}>
      {children}
    </p>
  )
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
type BtnSize = 'sm' | 'md' | 'lg'

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100 disabled:pointer-events-none disabled:opacity-50'

const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-terracotta-500 text-cream-50 shadow-soft hover:bg-terracotta-600',
  secondary: 'bg-espresso-800 text-cream-50 hover:bg-espresso-900',
  ghost: 'text-espresso-700 hover:bg-cream-200/80',
  outline: 'border border-cream-300 bg-cream-50/80 text-espresso-800 hover:border-cream-300 hover:bg-white',
}

const btnSizes: Record<BtnSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }) {
  return <button className={cn(btnBase, btnVariants[variant], btnSizes[size], className)} {...props} />
}

export function ButtonLink({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: LinkProps & { variant?: BtnVariant; size?: BtnSize; className?: string }) {
  return <Link className={cn(btnBase, btnVariants[variant], btnSizes[size], className)} {...props} />
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-cream-300/80 bg-cream-50 shadow-soft',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Badge({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode
  className?: string
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'info' | 'verified'
}) {
  const tones = {
    neutral: 'bg-cream-200 text-espresso-700',
    accent: 'bg-terracotta-500/10 text-terracotta-600',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/15 text-warning',
    info: 'bg-info/10 text-info',
    verified: 'bg-navy-800/8 text-navy-800',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('mb-1.5 block text-sm font-medium text-espresso-700', className)}>
      {children}
    </label>
  )
}

const fieldClass =
  'w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-espresso-800 shadow-sm outline-none transition placeholder:text-espresso-500/60 focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-500/15'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, 'min-h-28 resize-y', className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldClass, 'appearance-none pr-10', className)} {...props}>
      {children}
    </select>
  )
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Card className="px-8 py-12 text-center">
      <h3 className="font-display text-2xl text-espresso-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-espresso-600">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  )
}

export function TrustStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-espresso-500">
      <span>Hệ sinh thái chọn lọc</span>
      <span className="hidden h-1 w-1 rounded-full bg-cream-300 sm:inline-block" />
      <span>Đối tác đã xác minh</span>
      <span className="hidden h-1 w-1 rounded-full bg-cream-300 sm:inline-block" />
      <span>Ghép nối do 3HORIZONS kiểm soát</span>
      <span className="hidden h-1 w-1 rounded-full bg-cream-300 sm:inline-block" />
      <span>Bảo mật ngay từ thiết kế</span>
    </div>
  )
}
