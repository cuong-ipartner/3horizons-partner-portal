import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  Activity,
  Bell,
  Briefcase,
  FileStack,
  FileText,
  Handshake,
  LayoutDashboard,
  Menu,
  Network,
  Search,
  Shield,
  Users,
  X,
  ClipboardList,
  Home,
} from 'lucide-react'
import { DemoModeBanner } from '@/components/DemoModeBanner'
import { NexusPanel } from '@/components/nexus/NexusPanel'
import { cn } from '@/lib/cn'

const nav = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/partners', label: 'Đối tác', icon: Handshake },
  { to: '/admin/matches', label: 'Yêu cầu match', icon: ClipboardList },
  { to: '/admin/projects', label: 'Dự án', icon: Briefcase },
  { to: '/admin/content', label: 'Nội dung', icon: FileStack },
  { to: '/admin/library', label: 'Thư viện PDF', icon: FileText },
  { to: '/admin/roles', label: 'Vai trò & quyền', icon: Shield },
  { to: '/admin/audit', label: 'Audit & logs', icon: Activity },
]

export function AdminShell() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-portal-50 text-espresso-800">
      <div className="fixed inset-x-0 top-0 z-50">
        <DemoModeBanner />
      </div>

      <header className="fixed inset-x-0 top-8 z-40 flex h-14 items-center gap-3 border-b border-portal-200/80 bg-white/95 px-3 shadow-sm backdrop-blur-md sm:px-4 lg:top-8 lg:h-16 lg:px-5">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-portal-200 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <Link to="/admin" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-portal-800 to-portal-violet text-[10px] font-bold text-white">
            3H
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold text-espresso-900">3HORIZONS Admin</span>
            <span className="block text-[11px] text-espresso-500">Partner OS · Operating center</span>
          </span>
        </Link>

        <div className="mx-auto hidden max-w-md flex-1 md:block lg:max-w-lg">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-500/70" />
            <input
              type="search"
              placeholder="Tìm user, đối tác, request, project…"
              className="h-10 w-full rounded-xl border border-portal-200 bg-portal-50 pl-10 pr-4 text-sm outline-none focus:border-portal-600 focus:bg-white focus:ring-2 focus:ring-portal-600/15"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-portal-200 bg-white text-espresso-700"
            aria-label="Thông báo"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-terracotta-500" />
          </button>
          <Link
            to="/"
            className="hidden h-9 items-center gap-1.5 rounded-lg border border-portal-200 px-3 text-xs font-medium text-portal-800 hover:bg-portal-50 sm:inline-flex"
          >
            <Home className="h-3.5 w-3.5" />
            Site
          </Link>
          <Link
            to="/portal"
            className="hidden h-9 items-center gap-1.5 rounded-lg border border-portal-200 px-3 text-xs font-medium text-portal-800 hover:bg-portal-50 sm:inline-flex"
          >
            <Network className="h-3.5 w-3.5" />
            Portal
          </Link>
          <div className="flex items-center gap-2 rounded-xl border border-portal-200 bg-white py-1 pl-1 pr-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-portal-800 text-xs font-semibold text-white">
              MA
            </span>
            <span className="hidden text-left lg:block">
              <span className="block text-xs font-semibold text-espresso-900">Minh Anh</span>
              <span className="block text-[10px] text-espresso-500">Super Admin</span>
            </span>
          </div>
        </div>
      </header>

      <aside
        className={cn(
          'fixed bottom-0 left-0 top-[5.5rem] z-30 w-60 border-r border-portal-200/80 bg-white transition-transform lg:top-[6rem] lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <nav className="flex h-full flex-col px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-espresso-500">
            Điều hành hệ sinh thái
          </p>
          <ul className="space-y-0.5">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-portal-100 text-portal-800 shadow-sm'
                        : 'text-espresso-600 hover:bg-portal-50 hover:text-espresso-900',
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-auto rounded-2xl border border-portal-200 bg-portal-50 p-3">
            <p className="text-xs font-semibold text-portal-800">Operating center</p>
            <p className="mt-1 text-[11px] leading-relaxed text-espresso-500">
              Duyệt đối tác, match, project và nội dung — một nơi điều hành mạng lưới.
            </p>
          </div>
        </nav>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-portal-900/30 lg:hidden"
          aria-label="Đóng menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <main className="min-h-screen pt-[5.5rem] lg:pl-60 lg:pt-[6rem]">
        <div className="flex min-h-[calc(100vh-6rem)]">
          <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
          <NexusPanel variant="admin" />
        </div>
      </main>
    </div>
  )
}
