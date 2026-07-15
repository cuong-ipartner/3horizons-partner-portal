import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { loginProduction, requestPasswordReset } from '@/lib/production-auth'
import { isSupabaseAuthEnabled, supabaseBackendLabel } from '@/lib/supabase'
import { cn } from '@/lib/cn'

export function LoginPage() {
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
    const res = await loginProduction(email, password)
    setLoading(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setInfo('Đăng nhập thành công…')
    const dest =
      res.session.role === 'staff'
        ? fromPath?.startsWith('/admin')
          ? fromPath
          : '/admin'
        : fromPath?.startsWith('/portal')
          ? fromPath
          : '/portal'
    navigate(dest)
  }

  async function onReset() {
    if (!email.trim()) {
      setError('Nhập email để nhận link đặt lại mật khẩu.')
      return
    }
    setLoading(true)
    setError(null)
    const err = await requestPasswordReset(email)
    setLoading(false)
    if (err) setError(err)
    else setInfo('Nếu email tồn tại, bạn sẽ nhận hướng dẫn đặt lại mật khẩu.')
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#1a2348_0%,#2f3d72_38%,#4a3d8c_72%,#5b4b9a_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.14),transparent_45%)]" />

      <div className="relative z-10 px-6 py-6 sm:px-8">
        <Logo to="/" variant="light" subtitle="Cổng đối tác" />
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-white/20 bg-white/95 p-8 shadow-[0_24px_64px_rgba(15,20,45,0.35)] backdrop-blur-sm sm:p-9">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-espresso-900 text-sm font-bold text-cream-100 shadow-md">
                3H
              </div>
              <h1 className="font-display text-xl font-semibold tracking-tight text-espresso-900 sm:text-2xl">
                Đăng nhập
              </h1>
              <p className="mt-2 text-sm text-espresso-500">
                Tài khoản được cấp bởi 3HORIZONS — không dùng tài khoản demo.
              </p>
              <p className="mt-2 text-[11px] text-portal-700">{supabaseBackendLabel()}</p>
            </div>

            {!supabaseOn ? (
              <div className="mt-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-3 py-2 text-xs text-terracotta-600">
                Supabase chưa cấu hình trên bản build. Kiểm tra biến VITE_SUPABASE_* trên Cloudflare.
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
                    placeholder="ban@congty.com"
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
                className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-espresso-900 text-sm font-semibold text-cream-100 shadow-md transition hover:bg-espresso-800 disabled:opacity-70"
              >
                {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-espresso-500">
              Chưa có tài khoản? Liên hệ administrator 3HORIZONS để được mời.
              <br />
              <Link to="/" className="font-medium text-portal-700 hover:underline">
                Về trang chủ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const fieldClass =
  'h-11 w-full rounded-xl border border-cream-300 bg-cream-50 pl-10 pr-4 text-sm text-espresso-900 outline-none transition placeholder:text-espresso-500/50 focus:border-portal-600 focus:bg-white focus:ring-2 focus:ring-portal-600/20'
