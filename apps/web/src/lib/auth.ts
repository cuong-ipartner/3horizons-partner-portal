/**
 * Supabase Auth helpers for partner + staff demo personas.
 * Rate-limit safe: reuse session, sign-in only (no auto sign-up by default),
 * local persona fallback when Auth is throttled so demo is never blocked.
 */

import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'
import {
  DEMO_PARTNER_PERSONAS,
  type DemoSession,
  saveSession,
  clearSession,
} from '@/lib/session'
import { clearPortalAuthenticated, markPortalAuthenticated } from '@/lib/authGate'

export const DEMO_PASSWORD = 'Demo3H!2026'

export const DEMO_STAFF_PERSONA: DemoSession = {
  role: 'staff',
  partnerId: 'staff-3h',
  name: 'Facilitator 3H',
  email: 'staff@partners.3horizons.vn',
  initials: '3H',
}

export type AuthResult =
  | {
      ok: true
      session: DemoSession
      userId: string
      via: 'supabase' | 'local' | 'session' | 'local_fallback'
      notice?: string
    }
  | { ok: false; error: string }

const RATE_COOLDOWN_KEY = '3h-auth-rate-cooldown-until'
const LOCAL_FALLBACK_KEY = '3h-auth-local-fallback'

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function isRateLimitMessage(msg: string) {
  return /rate limit|too many|over_request|429/i.test(msg)
}

function markRateCooldown(seconds = 120) {
  try {
    sessionStorage.setItem(RATE_COOLDOWN_KEY, String(Date.now() + seconds * 1000))
  } catch {
    /* ignore */
  }
}

function inRateCooldown(): boolean {
  try {
    const raw = sessionStorage.getItem(RATE_COOLDOWN_KEY)
    if (!raw) return false
    const until = Number(raw)
    if (Date.now() < until) return true
    sessionStorage.removeItem(RATE_COOLDOWN_KEY)
  } catch {
    /* ignore */
  }
  return false
}

export function isAuthLocalFallback(): boolean {
  try {
    return sessionStorage.getItem(LOCAL_FALLBACK_KEY) === '1'
  } catch {
    return false
  }
}

function setLocalFallback(on: boolean) {
  try {
    if (on) sessionStorage.setItem(LOCAL_FALLBACK_KEY, '1')
    else sessionStorage.removeItem(LOCAL_FALLBACK_KEY)
  } catch {
    /* ignore */
  }
}

function clearRateCooldown() {
  try {
    sessionStorage.removeItem(RATE_COOLDOWN_KEY)
  } catch {
    /* ignore */
  }
}

/** Always succeeds — local demo identity (no Supabase Auth call). */
export function loginLocalPersona(persona: DemoSession): AuthResult {
  saveSession(persona)
  setLocalFallback(true)
  markPortalAuthenticated()
  return {
    ok: true,
    session: persona,
    userId: `local:${persona.partnerId}`,
    via: 'local_fallback',
    notice:
      'Đang dùng phiên local (không gọi Supabase Auth). Portal/UI chạy demo; PDF/RLS cloud cần login Auth khi hết rate limit.',
  }
}

type ProfileRow = {
  email: string | null
  full_name: string | null
  initials: string | null
  role: string
  partner_slug: string | null
}

export async function fetchProfileSession(userId: string): Promise<DemoSession | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from('profiles')
    .select('email, full_name, initials, role, partner_slug')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null

  const row = data as ProfileRow
  const isStaff =
    row.role === 'super_admin' ||
    row.role === 'partner_manager' ||
    row.role === 'project_operator' ||
    row.role === 'content_editor'

  return {
    role: isStaff ? 'staff' : 'partner',
    partnerId: row.partner_slug || (isStaff ? 'staff-3h' : 'unknown'),
    name: row.full_name || row.email || 'User',
    email: row.email || '',
    initials: row.initials || initialsFrom(row.full_name || row.email || 'U'),
  }
}

async function ensureProfileMeta(
  userId: string,
  persona: DemoSession,
  staffRole?: string,
) {
  const sb = getSupabase()
  if (!sb) return
  const standingDefaults: Record<string, { region: string; focus_layers: string }> = {
    'cuong-doan': { region: 'Việt Nam', focus_layers: 'T1 Chiến lược · T6 Kế thừa' },
    'lan-pham': { region: 'Việt Nam', focus_layers: 'T1 Chiến lược · T3 Năng lực' },
    'erik-sundberg': { region: 'APAC', focus_layers: 'T4 Thực thi · T1 Chiến lược' },
    'david-tran': { region: 'Việt Nam', focus_layers: 'T7 Family governance' },
  }
  const st = standingDefaults[persona.partnerId] ?? {
    region: 'Việt Nam',
    focus_layers: 'T1 · T6',
  }

  await sb.from('profiles').upsert(
    {
      id: userId,
      email: persona.email,
      full_name: persona.name,
      initials: persona.initials,
      role: persona.role === 'staff' ? (staffRole ?? 'partner_manager') : 'partner',
      partner_slug: persona.partnerId,
      region: st.region,
      focus_layers: st.focus_layers,
      verified: true,
      standing_status: 'active',
    },
    { onConflict: 'id' },
  )
}

async function finalizeLogin(
  userId: string,
  persona: DemoSession,
  via: 'supabase' | 'session',
): Promise<AuthResult> {
  await ensureProfileMeta(
    userId,
    persona,
    persona.role === 'staff' ? 'partner_manager' : undefined,
  )
  const fromDb = await fetchProfileSession(userId)
  const session: DemoSession = fromDb ?? {
    ...persona,
    role: persona.role === 'staff' ? 'staff' : 'partner',
  }
  saveSession(session)
  setLocalFallback(false)
  clearRateCooldown()
  markPortalAuthenticated()
  return { ok: true, session, userId, via }
}

export async function reuseSessionIfMatch(email: string): Promise<AuthResult | null> {
  if (!isSupabaseAuthEnabled()) return null
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  const user = data.session?.user
  if (!user?.email) return null
  if (user.email.toLowerCase() !== email.toLowerCase()) return null

  const persona =
    DEMO_PARTNER_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase()) ??
    (email.toLowerCase() === DEMO_STAFF_PERSONA.email.toLowerCase()
      ? DEMO_STAFF_PERSONA
      : null)

  const fromDb = await fetchProfileSession(user.id)
  if (fromDb) {
    saveSession(fromDb)
    setLocalFallback(false)
    markPortalAuthenticated()
    return { ok: true, session: fromDb, userId: user.id, via: 'session' }
  }
  if (persona) {
    return finalizeLogin(user.id, persona, 'session')
  }
  const session: DemoSession = {
    role: 'partner',
    partnerId: 'unknown',
    name: user.email.split('@')[0] || 'User',
    email: user.email,
    initials: 'U',
  }
  saveSession(session)
  setLocalFallback(false)
  markPortalAuthenticated()
  return { ok: true, session, userId: user.id, via: 'session' }
}

/**
 * Prefer existing session → sign-in only (no auto sign-up).
 * On rate limit → local persona so demo continues.
 */
export async function loginWithPersona(
  persona: DemoSession,
  password = DEMO_PASSWORD,
): Promise<AuthResult> {
  if (!isSupabaseAuthEnabled()) {
    saveSession(persona)
    setLocalFallback(false)
    markPortalAuthenticated()
    return { ok: true, session: persona, userId: 'local', via: 'local' }
  }

  const email = persona.email.toLowerCase()

  // Always try reuse first (no Auth rate cost)
  const reused = await reuseSessionIfMatch(email)
  if (reused?.ok) return reused

  if (inRateCooldown()) {
    return loginLocalPersona(persona)
  }

  const sb = getSupabase()
  if (!sb) {
    return loginLocalPersona(persona)
  }

  const signIn = await sb.auth.signInWithPassword({ email, password })

  if (signIn.error) {
    const msg = signIn.error.message || ''
    if (isRateLimitMessage(msg)) {
      markRateCooldown(120)
      return loginLocalPersona(persona)
    }

    // User missing / wrong password — do NOT auto sign-up (causes rate limits)
    return {
      ok: false,
      error:
        `Auth: ${msg}. ` +
        `Tạo user trong Dashboard → Authentication → Users: ${email} / ${DEMO_PASSWORD} ` +
        `(Auto Confirm = ON). Tắt Confirm email. ` +
        `Hoặc bấm "Vào local (bỏ qua Auth)" để demo UI.`,
    }
  }

  if (!signIn.data.user) {
    return { ok: false, error: 'Không lấy được user sau đăng nhập' }
  }

  return finalizeLogin(signIn.data.user.id, persona, 'supabase')
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const normalized = email.trim().toLowerCase()
  const persona =
    DEMO_PARTNER_PERSONAS.find((p) => p.email.toLowerCase() === normalized) ??
    (normalized === DEMO_STAFF_PERSONA.email.toLowerCase()
      ? DEMO_STAFF_PERSONA
      : null)

  if (persona) {
    return loginWithPersona(persona, password || DEMO_PASSWORD)
  }

  if (!isSupabaseAuthEnabled()) {
    return {
      ok: false,
      error: 'Email không thuộc demo persona và Supabase Auth chưa bật.',
    }
  }

  const reused = await reuseSessionIfMatch(normalized)
  if (reused?.ok) return reused

  if (inRateCooldown()) {
    return {
      ok: false,
      error:
        'Auth đang rate limit. Dùng persona demo + "Vào local", hoặc đợi 2 phút rồi login user đã tạo trên Dashboard.',
    }
  }

  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Supabase client chưa sẵn sàng' }

  const { data, error } = await sb.auth.signInWithPassword({
    email: normalized,
    password,
  })
  if (error || !data.user) {
    if (error && isRateLimitMessage(error.message)) {
      markRateCooldown(120)
      return {
        ok: false,
        error: 'Auth rate limit. Đợi 2 phút hoặc dùng persona local trên màn login.',
      }
    }
    return { ok: false, error: error?.message || 'Đăng nhập thất bại' }
  }
  const session = (await fetchProfileSession(data.user.id)) ?? {
    role: 'partner' as const,
    partnerId: 'unknown',
    name: data.user.email?.split('@')[0] || 'User',
    email: data.user.email || normalized,
    initials: 'U',
  }
  saveSession(session)
  setLocalFallback(false)
  clearRateCooldown()
  markPortalAuthenticated()
  return { ok: true, session, userId: data.user.id, via: 'supabase' }
}

export async function ensureStaffAuth(): Promise<AuthResult> {
  if (!isSupabaseAuthEnabled()) {
    return loginLocalPersona(DEMO_STAFF_PERSONA)
  }

  const sb = getSupabase()
  if (!sb) return loginLocalPersona(DEMO_STAFF_PERSONA)

  const { data } = await sb.auth.getSession()
  const uid = data.session?.user?.id
  if (uid) {
    const profile = await fetchProfileSession(uid)
    if (profile?.role === 'staff') {
      saveSession(profile)
      setLocalFallback(false)
      markPortalAuthenticated()
      return { ok: true, session: profile, userId: uid, via: 'session' }
    }
  }

  if (inRateCooldown()) {
    return loginLocalPersona(DEMO_STAFF_PERSONA)
  }

  return loginWithPersona(DEMO_STAFF_PERSONA, DEMO_PASSWORD)
}

export async function logoutAuth() {
  const sb = getSupabase()
  if (sb) {
    try {
      await sb.auth.signOut()
    } catch {
      /* ignore rate errors on signOut */
    }
  }
  clearSession()
  setLocalFallback(false)
  clearPortalAuthenticated()
}

export async function restoreSupabaseSession(): Promise<DemoSession | null> {
  if (!isSupabaseAuthEnabled()) return null
  const sb = getSupabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  const uid = data.session?.user?.id
  if (!uid) return null
  const session = await fetchProfileSession(uid)
  if (session) {
    saveSession(session)
    setLocalFallback(false)
    markPortalAuthenticated()
  }
  return session
}

export { DEMO_PARTNER_PERSONAS }
