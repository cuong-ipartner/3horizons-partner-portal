import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import {
  loginProduction,
  requestPasswordReset,
  type LoginAudience,
} from '@/lib/production-auth'
import { isSupabaseAuthEnabled } from '@/lib/supabase'
import { cn } from '@/lib/cn'

type Props = {
  /** partner = /login · staff = /admin/login */
  audience?: LoginAudience
}

export function LoginPage({ audience = 'partner' }: Props) {
  const isAdmin = audience === 'staff'
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath =
    (location.state as { from?: string } | null)?.from &&
    String((location.state as { from?: string }).from).startsWith('/')
      ? String((location.state as { from?: string }).from)
      : null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const supabaseOn = isSupabaseAuthEnabled()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    setInfo(null)
    const res = await loginProduction(email, password, { audience })
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }

    if (isAdmin) {
      setInfo(
        res.isSuperAdmin
          ? 'Đăng nhập Super Admin thành công…'
          : `Đăng nhập staff (${res.appRole}) thành công…`,
      )
      const dest =
        fromPath?.startsWith('/admin') && !fromPath.startsWith('/admin/login')
          ? fromPath
          : '/admin'
      navigate(dest)
      return
    }

    setInfo('Đăng nhập partner thành công…')
    const dest =
      fromPath?.startsWith('/portal') ? fromPath : '/portal'
    navigate(dest)
  }

  async function onReset() {
    if (!email.trim()) {
      setError('Nhập email để nhận link đặt lại mật khẩu.')
      return
    }
    setLoading(true)
    setError(null)
    const err = await requestPasswordReset(email, isAdmin ? '/admin/login' : '/login')
    setLoading(false)
    if (err) setError(err)
    else setInfo('Nếu email tồn tại, bạn sẽ nhận hướng dẫn đặt lại mật khẩu.')
  }

  const bg = isAdmin
    ? 'bg-[linear-gradient(145deg,#0f172a_0%,#1e293b_40%,#0f172a_100%)]'
    : 'bg-[linear-gradient(145deg,#1a2348_0%,#2f3d72_38%,#4a3d8c_72%,#5b4b9a_100%)]'

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className={cn('absolute inset-0', bg)} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.12),transparent_45%)]" />

      <div className="relative z-10 px-6 py-6 sm:px-8">
        <Logo
          to="/"
          variant="light"
          subtitle={isAdmin ? 'Admin Operating System' : 'Cổng đối tác'}
        />
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-white/20 bg-white/95 p-8 shadow-[0_24px_64px_rgba(15,20,45,0.35)] backdrop-blur-sm sm:p-9">
            <div className="text-center">
              <div
                className={cn(
                  'mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-cream-100 shadow-md',
                  isAdmin ? 'bg-slate-900' : 'bg-espresso-900',
                )}
              >
                {isAdmin ? <Shield className="h-5 w-5" strokeWidth={1.75} /> : '3H'}
              </div>
              <h1 className="font-display text-xl font-semibold tracking-tight text-espresso-900 sm:text-2xl">
                {isAdmin ? 'Đăng nhập Admin' : 'Đăng nhập Partner'}
              </h1>
              <p className="mt-2 text-sm text-espresso-500">
                {isAdmin
                  ? 'Dành cho super_admin và staff 3HORIZONS — quản trị users, documents, projects.'
                  : 'Cổng workspace đối tác — tài khoản được 3HORIZONS mời.'}
              </p>
            </div>

            {!supabaseOn ? (
              <div className="mt-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-3 py-2 text-xs text-terracotta-600">
                Hệ thống auth chưa sẵn sàng trên bản build này. Administrator: kiểm tra Cloudflare
                Production env VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY rồi redeploy (Deploy command
                để trống). Domain partners.3horizons.vn phải trỏ deployment mới.
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-3 py-2 text-xs text-terracotta-600">
                {error}
              </div>
            ) : null}
            {info ? (
              <div className="mt-4 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
                {info}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-espresso-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-500/70" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAdmin ? 'admin@3horizons.vn' : 'ban@congty.com'}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-espresso-700">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => void onReset()}
                    className="text-xs font-medium text-portal-700 hover:text-portal-violet"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-500/70" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    className={cn(fieldClass, 'pr-11')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-espresso-500 hover:bg-cream-100"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !supabaseOn}
                className={cn(
                  'mt-2 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-cream-100 shadow-md transition disabled:opacity-70',
                  isAdmin
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-espresso-900 hover:bg-espresso-800',
                )}
              >
                {loading
                  ? 'Đang đăng nhập…'
                  : isAdmin
                    ? 'Vào Admin OS'
                    : 'Vào Partner Portal'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-espresso-500">
              {isAdmin ? (
                <>
                  Cổng đối tác?{' '}
                  <Link to="/login" className="font-medium text-portal-700 hover:underline">
                    Đăng nhập Partner
                  </Link>
                </>
              ) : (
                <>
                  Nhân sự 3HORIZONS?{' '}
                  <Link to="/admin/login" className="font-medium text-portal-700 hover:underline">
                    Đăng nhập Admin
                  </Link>
                </>
              )}
              <br />
              <Link to="/" className="mt-1 inline-block font-medium text-portal-700 hover:underline">
                Về trang chủ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminLoginPage() {
  return <LoginPage audience="staff" />
}

const fieldClass =
  'h-11 w-full rounded-xl border border-cream-300 bg-cream-50 pl-10 pr-4 text-sm text-espresso-900 outline-none transition placeholder:text-espresso-500/50 focus:border-portal-600 focus:bg-white focus:ring-2 focus:ring-portal-600/20'
