import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity,
  Briefcase,
  FileStack,
  FileText,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Search,
  Shield,
  Users,
  UserPlus,
  X,
  Home,
} from 'lucide-react'
import { useDemoSession } from '@/hooks/useDemoSession'
import { logoutProduction } from '@/lib/production-auth'
import { NexusPanel } from '@/components/nexus/NexusPanel'
import { cn } from '@/lib/cn'

const nav = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/partners', label: 'Đối tác', icon: Handshake },
  { to: '/admin/referrals', label: 'Referrals', icon: UserPlus },
  { to: '/admin/projects', label: 'Dự án', icon: Briefcase },
  { to: '/admin/content', label: 'Nội dung', icon: FileStack },
  { to: '/admin/library', label: 'Documents', icon: FileText },
  { to: '/admin/roles', label: 'Roles', icon: Shield },
  { to: '/admin/audit', label: 'Audit logs', icon: Activity },
  { to: '/admin/settings', label: 'Settings', icon: Shield },
]

export function AdminShell() {
  const [open, setOpen] = useState(false)
  const { session } = useDemoSession()
  const navigate = useNavigate()

  async function onLogout() {
    await logoutProduction()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-portal-50 text-espresso-800">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-portal-200/80 bg-white/95 px-3 shadow-sm backdrop-blur-md sm:px-4 lg:h-16 lg:px-5">
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
            <span className="block text-[11px] text-espresso-500">Partner OS · Production</span>
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
              {session.initials || '3H'}
            </span>
            <span className="hidden text-left lg:block">
              <span className="block text-xs font-semibold text-espresso-900">
                {session.name || 'Staff'}
              </span>
              <span className="block text-[10px] text-espresso-500">{session.email || 'Admin'}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-portal-200 text-espresso-600 hover:bg-portal-50"
            aria-label="Đăng xuất"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <aside
        className={cn(
          'fixed bottom-0 left-0 top-14 z-30 w-60 border-r border-portal-200/80 bg-white transition-transform lg:top-16 lg:translate-x-0',
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
            <p className="text-xs font-semibold text-portal-800">Production OS</p>
            <p className="mt-1 text-[11px] leading-relaxed text-espresso-500">
              Users · documents · projects · audit — dữ liệu live, không demo seed.
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

      <main className="min-h-screen pt-14 lg:pl-60 lg:pt-16">
        <div className="flex min-h-[calc(100vh-4rem)]">
          <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
          <NexusPanel variant="admin" />
        </div>
      </main>
    </div>
  )
}
