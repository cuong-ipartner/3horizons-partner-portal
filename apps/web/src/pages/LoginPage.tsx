import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DemoModeBanner } from '@/components/DemoModeBanner'
import { Logo } from '@/components/Logo'
import {
  DEMO_PARTNER_PERSONAS,
  DEMO_PASSWORD,
  DEMO_STAFF_PERSONA,
  loginLocalPersona,
  loginWithEmailPassword,
  loginWithPersona,
} from '@/lib/auth'
import { DEFAULT_PARTNER_SESSION, type DemoSession } from '@/lib/session'
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
  const [email, setEmail] = useState(DEFAULT_PARTNER_SESSION.email)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const supabaseOn = isSupabaseAuthEnabled()

  async function finishLogin(res: Awaited<ReturnType<typeof loginWithPersona>>) {
    if (!res.ok) {
      setLoading(false)
      setError(res.error)
      return
    }
    if (res.notice) setInfo(res.notice)
    if (res.session.role === 'staff') {
      setLoading(false)
      if (!res.notice) {
        setInfo(
          res.via === 'session'
            ? 'Session staff hiện có'
            : res.via === 'local_fallback'
              ? 'Staff local (Auth bị limit) — UI admin chạy; Storage/RLS có thể hạn chế'
              : 'Đăng nhập staff OK',
        )
      }
      const dest =
        fromPath?.startsWith('/admin') ? fromPath : '/admin/projects'
      navigate(dest)
      return
    }
    if (!res.notice) {
      setInfo(
        res.via === 'local_fallback'
          ? 'Local demo — vào portal (không Auth)…'
          : res.via === 'session'
            ? 'Đã có session — vào private workspace…'
            : 'Đang vào private workspace…',
      )
    }
    window.setTimeout(() => {
      setLoading(false)
      const dest =
        fromPath?.startsWith('/portal') ? fromPath : '/portal'
      navigate(dest)
    }, 400)
  }

  async function enterAs(persona: DemoSession) {
    if (loading) return
    setLoading(true)
    setError(null)
    setInfo(null)
    const res = await loginWithPersona(persona, password || DEMO_PASSWORD)
    await finishLogin(res)
  }

  function enterLocal(persona: DemoSession) {
    if (loading) return
    setLoading(true)
    setError(null)
    void finishLogin(loginLocalPersona(persona))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    setInfo(null)
    const res = await loginWithEmailPassword(email, password || DEMO_PASSWORD)
    await finishLogin(res)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-20">
        <DemoModeBanner />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#1a2348_0%,#2f3d72_38%,#4a3d8c_72%,#5b4b9a_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(ellipse_at_80%_80%,rgba(196,92,38,0.12),transparent_40%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 px-6 py-6 sm:px-8">
        <Logo to="/" variant="light" subtitle="Cổng đối tác" />
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-5.5rem)] items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-white/20 bg-white/95 p-8 shadow-[0_24px_64px_rgba(15,20,45,0.35)] backdrop-blur-sm sm:p-9">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-portal-700 to-portal-violet text-sm font-bold text-white shadow-md">
                3H
              </div>
              <h1 className="font-display text-xl font-semibold tracking-tight text-espresso-900 sm:text-2xl">
                Đăng nhập workspace
              </h1>
              <p className="mt-2 text-sm text-espresso-500">
                Partner portal · projects theo membership (RLS)
              </p>
              <p className="mt-2 text-[11px] text-portal-700">{supabaseBackendLabel()}</p>
            </div>

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
                  <span className="text-[10px] text-espresso-500">Demo: {DEMO_PASSWORD}</span>
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
                    placeholder="Nhập mật khẩu"
                    className={cn(fieldClass, 'pr-11')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-espresso-500 hover:bg-cream-100 hover:text-espresso-800"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-portal-800 to-portal-violet text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-70"
              >
                {loading ? 'Đang đăng nhập…' : 'Đăng nhập Supabase'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  enterLocal(
                    DEMO_PARTNER_PERSONAS.find((p) => p.email === email) ??
                      DEFAULT_PARTNER_SESSION,
                  )
                }
                className="flex h-10 w-full items-center justify-center rounded-xl border border-cream-300 bg-white text-xs font-semibold text-espresso-800 transition hover:bg-cream-50 disabled:opacity-70"
              >
                Vào local (bỏ qua Auth / khi rate limit)
              </button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-cream-300" />
              <span className="text-xs font-medium uppercase tracking-wide text-espresso-500">
                persona demo
              </span>
              <div className="h-px flex-1 bg-cream-300" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_PARTNER_PERSONAS.map((p) => (
                <button
                  key={p.partnerId}
                  type="button"
                  disabled={loading}
                  onClick={() => void enterAs(p)}
                  className="rounded-xl border border-cream-300 bg-cream-50 px-2 py-2 text-left transition hover:border-portal-400 hover:bg-white disabled:opacity-60"
                >
                  <span className="block text-xs font-semibold text-espresso-900">{p.name}</span>
                  <span className="block truncate text-[10px] text-espresso-500">{p.partnerId}</span>
                </button>
              ))}
              <button
                type="button"
                disabled={loading}
                onClick={() => void enterAs(DEMO_STAFF_PERSONA)}
                className="col-span-2 rounded-xl border border-portal-300 bg-portal-50 px-2 py-2 text-left transition hover:border-portal-500 disabled:opacity-60"
              >
                <span className="block text-xs font-semibold text-portal-900">
                  {DEMO_STAFF_PERSONA.name} (Admin / staff)
                </span>
                <span className="block truncate text-[10px] text-espresso-500">
                  {DEMO_STAFF_PERSONA.email} · /admin/projects
                </span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => enterLocal(DEFAULT_PARTNER_SESSION)}
                className="col-span-2 rounded-xl border border-dashed border-cream-400 bg-white px-2 py-2 text-center text-[11px] font-medium text-espresso-700 transition hover:border-portal-400 disabled:opacity-60"
              >
                Rate limit? → Vào portal local ngay (Cuong Doan)
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] leading-relaxed text-espresso-500">
              {supabaseOn
                ? 'Không auto sign-up (tránh rate limit). Tạo user trên Dashboard rồi “Đăng nhập Supabase”. Khi limit: dùng local.'
                : 'Chế độ seed/local — chưa bật Supabase Auth.'}
            </p>

            <p className="mt-6 text-center text-xs leading-relaxed text-espresso-500">
              <Link to="/" className="font-medium text-portal-700 hover:underline">
                Về Mạng lưới đối tác
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
