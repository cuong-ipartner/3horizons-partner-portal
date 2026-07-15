import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity,
  BadgeCheck,
  BookOpen,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Search,
  Shield,
  User,
  X,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { NexusPanel } from '@/components/nexus/NexusPanel'
import { useDemoSession } from '@/hooks/useDemoSession'
import { logoutProduction } from '@/lib/production-auth'
import { cn } from '@/lib/cn'

/** Partner portal only — executive labels, no admin */
const sidebarItems = [
  { to: '/portal', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/portal/projects', label: 'Engagement', icon: FolderKanban },
  { to: '/portal/documents', label: 'Tài liệu', icon: FileText },
  { to: '/portal/training', label: 'Năng lực', icon: BookOpen },
  { to: '/portal/network', label: 'Hệ sinh thái', icon: Network },
  { to: '/portal/account', label: 'Hồ sơ', icon: User },
]

const profileMenu = [
  { to: '/portal/account', label: 'Hồ sơ standing', icon: User },
  { to: '/portal/account/security', label: 'Bảo mật', icon: Shield },
  { to: '/portal/account/billing', label: 'Thanh toán', icon: CreditCard },
  { to: '/portal/account/activity', label: 'Nhật ký', icon: Activity },
  { to: '/portal/account/help', label: 'Hướng dẫn', icon: CircleHelp },
]

export function PortalShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { session } = useDemoSession()
  const headerTop = 'top-0'
  const asideTop = 'top-14 lg:top-16'
  const mainPad = 'pt-14 lg:pt-16'

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className="paper-texture min-h-screen bg-cream-100 text-espresso-800">
      <header
        className={cn(
          'fixed inset-x-0 z-40 flex h-14 items-center gap-3 border-b border-espresso-900/8 bg-cream-50/90 px-3 shadow-[0_1px_0_rgba(28,22,16,0.04)] backdrop-blur-md sm:px-4 lg:h-16 lg:px-5',
          headerTop,
        )}
      >
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-espresso-900/10 text-espresso-700 lg:hidden"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Mở menu"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="shrink-0">
          <Logo
            to="/portal"
            variant="portal"
            subtitle="Private"
            className="scale-95 sm:scale-100"
          />
        </div>

        <div className="mx-auto hidden max-w-sm flex-1 md:block lg:max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-espresso-500/60" />
            <input
              type="search"
              placeholder="Tìm engagement, tài liệu…"
              className="h-9 w-full rounded-full border border-espresso-900/10 bg-white/80 pl-9 pr-4 text-sm outline-none transition placeholder:text-espresso-500/45 focus:border-gold-600/40 focus:bg-white focus:ring-2 focus:ring-gold-600/10"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full border border-gold-600/25 bg-gold-500/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-600 sm:inline-flex">
            <BadgeCheck className="h-3 w-3" strokeWidth={2} />
            Verified
          </span>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className={cn(
                'flex items-center gap-2 rounded-full border border-espresso-900/10 bg-white py-1 pl-1 pr-2.5 transition hover:border-espresso-900/20',
                profileOpen && 'border-gold-600/30 bg-cream-50',
              )}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso-900 text-[11px] font-semibold tracking-wide text-cream-100">
                {session.initials}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block max-w-[9rem] truncate text-xs font-semibold text-espresso-900">
                  {session.name}
                </span>
                <span className="block text-[10px] text-espresso-500">Partner</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-espresso-500" />
            </button>

            {profileOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-espresso-900/10 bg-white shadow-[0_16px_48px_rgba(28,22,16,0.12)]"
              >
                <div className="border-b border-espresso-900/6 bg-cream-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-espresso-900 text-sm font-semibold text-cream-100">
                      {session.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-espresso-900">{session.name}</p>
                      <p className="truncate text-xs text-espresso-500">{session.email}</p>
                    </div>
                  </div>
                  <p className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-600">
                    <BadgeCheck className="h-3 w-3" />
                    Verified Partner
                  </p>
                </div>
                <div className="p-1.5">
                  {profileMenu.map((item) => (
                    <button
                      key={item.to}
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-espresso-700 transition hover:bg-cream-50"
                      onClick={() => {
                        setProfileOpen(false)
                        navigate(item.to)
                      }}
                    >
                      <item.icon className="h-4 w-4 text-espresso-600" strokeWidth={1.75} />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-espresso-900/6 p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-terracotta-600 transition hover:bg-terracotta-500/5"
                    onClick={() => {
                      setProfileOpen(false)
                      void logoutProduction().then(() => navigate('/login'))
                    }}
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <aside
        className={cn(
          'fixed bottom-0 left-0 z-30 w-[15.5rem] border-r border-espresso-900/8 bg-cream-50 transition-transform lg:translate-x-0',
          asideTop,
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <nav className="flex h-full flex-col px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-espresso-500">
            Không gian riêng
          </p>
          <ul className="space-y-0.5">
            {sidebarItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-espresso-900 text-cream-100 shadow-sm'
                        : 'text-espresso-600 hover:bg-white hover:text-espresso-900',
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-auto rounded-2xl border border-espresso-900/8 bg-white p-3.5 shadow-soft">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">
              Counsel
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-espresso-500">
              Engagement do 3HORIZONS điều phối. Matching không gửi từ không gian partner.
            </p>
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false)
                navigate('/portal/projects')
              }}
              className="mt-3 w-full rounded-lg bg-espresso-900 px-3 py-2 text-xs font-semibold text-cream-100 transition hover:bg-espresso-800"
            >
              Xem engagement
            </button>
          </div>
        </nav>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-espresso-900/25 backdrop-blur-[1px] lg:hidden"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <main className={cn('min-h-screen lg:pl-[15.5rem]', mainPad)}>
        <div className="flex min-h-[calc(100vh-4rem)]">
          <div className="min-w-0 flex-1 px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
            <Outlet />
          </div>
          <NexusPanel variant="portal" />
        </div>
      </main>
    </div>
  )
}
