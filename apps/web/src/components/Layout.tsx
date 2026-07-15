import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { ButtonLink, Container } from '@/components/ui'
import { brand, footerVi, headerNav } from '@/content/site-vi'
import { cn } from '@/lib/cn'

function ExternalOrInternal({
  href,
  external,
  className,
  children,
  onClick,
}: {
  href: string
  external?: boolean
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer" onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

function DesktopDropdown({
  label,
  items,
}: {
  label: string
  items: { label: string; href: string; external?: boolean }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition',
          open
            ? 'bg-cream-200 font-medium text-espresso-900'
            : 'text-espresso-600 hover:bg-cream-200/70 hover:text-espresso-900',
        )}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[240px] rounded-2xl border border-cream-300 bg-cream-50 p-2 shadow-card">
          {items.map((item) => (
            <ExternalOrInternal
              key={item.href + item.label}
              href={item.href}
              external={item.external}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-espresso-700 transition hover:bg-cream-200/80 hover:text-espresso-900"
            >
              {item.label}
            </ExternalOrInternal>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-cream-300/70 bg-cream-50/95 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-4 lg:h-[4.25rem]">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={brand.logoDark}
              alt={brand.name}
              className="h-8 w-auto max-w-[140px] object-contain sm:h-9"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-espresso-800 text-[10px] font-bold tracking-wide text-cream-50 sm:hidden">
              3H
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex">
            {headerNav.items.map((item) => (
              <DesktopDropdown key={item.label} label={item.label} items={item.children} />
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ButtonLink to={headerNav.ctaLogin.href} variant="ghost" size="sm">
              {headerNav.ctaLogin.label}
            </ButtonLink>
            <a
              href={headerNav.ctaContact.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-full border border-cream-300 bg-cream-50/80 px-4 text-sm font-medium text-espresso-800 transition hover:bg-white"
            >
              {headerNav.ctaContact.label}
            </a>
            <ButtonLink to={headerNav.ctaJoin.href} size="sm">
              {headerNav.ctaJoin.label}
            </ButtonLink>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-espresso-800 xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </Container>

        {open ? (
          <div className="max-h-[80vh] overflow-y-auto border-t border-cream-300/70 bg-cream-50 xl:hidden">
            <Container className="flex flex-col gap-1 py-4">
              {headerNav.items.map((item) => (
                <div key={item.label} className="border-b border-cream-200 pb-2">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold text-espresso-900"
                    onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn('h-4 w-4 transition', openGroup === item.label && 'rotate-180')}
                    />
                  </button>
                  {openGroup === item.label
                    ? item.children.map((child) => (
                        <ExternalOrInternal
                          key={child.href + child.label}
                          href={child.href}
                          external={child.external}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-5 py-2 text-sm text-espresso-600 hover:bg-cream-200/70"
                        >
                          {child.label}
                        </ExternalOrInternal>
                      ))
                    : null}
                </div>
              ))}
              <div className="mt-3 flex flex-col gap-2">
                <ButtonLink to={headerNav.ctaLogin.href} variant="outline" onClick={() => setOpen(false)}>
                  {headerNav.ctaLogin.label}
                </ButtonLink>
                <ButtonLink to={headerNav.ctaJoin.href} onClick={() => setOpen(false)}>
                  {headerNav.ctaJoin.label}
                </ButtonLink>
                <a
                  href={headerNav.ctaContact.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-cream-300 text-sm font-medium"
                >
                  {headerNav.ctaContact.label}
                </a>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 px-1">
                <NavLink
                  to="/problems"
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-terracotta-600"
                >
                  Tìm theo vấn đề
                </NavLink>
                <span className="text-cream-300">·</span>
                <NavLink
                  to="/portal"
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-terracotta-600"
                >
                  Workspace
                </NavLink>
              </div>
            </Container>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-cream-300/80 bg-espresso-900 text-cream-200">
        <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <img
              src={brand.logoFooter}
              alt={brand.name}
              className="h-8 w-auto object-contain opacity-95"
              onError={(e) => {
                const el = e.target as HTMLImageElement
                el.style.display = 'none'
              }}
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-300/90">{footerVi.blurb}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {/* trust badges rendered on home; compact note here */}
              <p className="text-[11px] text-cream-300/70">ISO 27001 · SOC 2 · GDPR-ready</p>
            </div>
          </div>
          {footerVi.columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream-300">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <ExternalOrInternal
                      href={link.href}
                      external={link.external}
                      className="hover:text-cream-50"
                    >
                      {link.label}
                    </ExternalOrInternal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
        <div className="border-t border-white/10">
          <Container className="flex flex-col gap-2 py-5 text-xs text-cream-300/70 sm:flex-row sm:items-center sm:justify-between">
            <p>{footerVi.copyright}</p>
            <p>
              <a href={brand.privacyUrl} className="hover:text-cream-50" target="_blank" rel="noreferrer">
                Chính sách bảo mật
              </a>
              {' · '}
              <a href={brand.cookiesUrl} className="hover:text-cream-50" target="_blank" rel="noreferrer">
                Cookies
              </a>
            </p>
          </Container>
        </div>
      </footer>
    </div>
  )
}
