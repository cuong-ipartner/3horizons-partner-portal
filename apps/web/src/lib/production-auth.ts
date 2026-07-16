/**
 * Production auth helpers — no demo personas.
 * Partner login and staff/admin login are separate entry points.
 */

import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'
import { clearSession, saveSession, type PortalSession } from '@/lib/session'
import { clearPortalAuthenticated, markPortalAuthenticated } from '@/lib/authGate'

export type AppRole =
  | 'super_admin'
  | 'partner_manager'
  | 'project_operator'
  | 'content_editor'
  | 'partner'
  | 'client'

export type UserStatus = 'invited' | 'active' | 'suspended' | 'archived'

export type LoginAudience = 'partner' | 'staff'

export type ProductionProfile = {
  id: string
  email: string
  fullName: string
  initials: string
  role: AppRole
  status: UserStatus
  partnerSlug: string | null
  region: string | null
  focusLayers: string | null
  verified: boolean
}

/** Roles allowed into /admin */
const STAFF: AppRole[] = [
  'super_admin',
  'partner_manager',
  'project_operator',
  'content_editor',
]

export function isStaffRole(role: string) {
  return STAFF.includes(role as AppRole)
}

export function isSuperAdminRole(role: string) {
  return role === 'super_admin'
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || 'U'
}

export type LoginSuccess = {
  ok: true
  session: PortalSession
  appRole: AppRole
  isSuperAdmin: boolean
}

export type LoginFailure = { ok: false; error: string }

/**
 * Sign in with Supabase Auth and enforce audience:
 * - partner: only non-staff roles → /portal
 * - staff: only staff roles (incl. super_admin) → /admin
 */
export async function loginProduction(
  email: string,
  password: string,
  opts?: { audience?: LoginAudience },
): Promise<LoginSuccess | LoginFailure> {
  const audience = opts?.audience ?? 'partner'

  if (!isSupabaseAuthEnabled()) {
    return {
      ok: false,
      error: 'Supabase chưa cấu hình. Kiểm tra biến môi trường Cloudflare (VITE_SUPABASE_*).',
    }
  }
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Supabase client unavailable' }

  const { data, error } = await sb.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error || !data.user) {
    const raw = error?.message || 'Đăng nhập thất bại'
    if (/email not confirmed|not confirmed/i.test(raw)) {
      return {
        ok: false,
        error:
          'Email chưa confirmed. Admin: Users → Activate (xác nhận email + mở active).',
      }
    }
    return { ok: false, error: raw }
  }

  const { data: profile, error: pErr } = await sb
    .from('profiles')
    .select('id,email,full_name,initials,role,status,partner_slug')
    .eq('id', data.user.id)
    .maybeSingle()

  if (pErr) {
    await sb.auth.signOut()
    return { ok: false, error: pErr.message }
  }

  const row = profile as {
    full_name?: string
    initials?: string
    role?: string
    status?: string
    partner_slug?: string
    email?: string
  } | null

  if (!row) {
    await sb.auth.signOut()
    return {
      ok: false,
      error: 'Chưa có hồ sơ (profiles). Liên hệ administrator để gán role.',
    }
  }

  if (row.status === 'invited') {
    await sb.auth.signOut()
    return {
      ok: false,
      error:
        'Tài khoản đang chờ admin duyệt. Sau khi Active mới đăng nhập portal được.',
    }
  }
  if (row.status === 'suspended') {
    await sb.auth.signOut()
    return { ok: false, error: 'Tài khoản đã bị tạm khóa. Liên hệ admin.' }
  }
  if (row.status === 'archived') {
    await sb.auth.signOut()
    return { ok: false, error: 'Tài khoản đã lưu trữ. Liên hệ admin.' }
  }
  if (row.status && row.status !== 'active' && !isStaffRole(row.role || 'partner')) {
    await sb.auth.signOut()
    return {
      ok: false,
      error: `Tài khoản status=${row.status}. Cần active để đăng nhập.`,
    }
  }

  const appRole = (row.role || 'partner') as AppRole
  const staff = isStaffRole(appRole)

  if (audience === 'staff' && !staff) {
    await sb.auth.signOut()
    clearSession()
    clearPortalAuthenticated()
    return {
      ok: false,
      error:
        'Tài khoản này không có quyền Admin (cần super_admin hoặc staff role). Đăng nhập partner tại /login.',
    }
  }

  if (audience === 'partner' && staff) {
    await sb.auth.signOut()
    clearSession()
    clearPortalAuthenticated()
    return {
      ok: false,
      error:
        'Tài khoản staff/admin. Vui lòng đăng nhập tại /admin/login (không dùng cổng partner).',
    }
  }

  await sb
    .from('profiles')
    .update({ last_login_at: new Date().toISOString(), status: row.status || 'active' })
    .eq('id', data.user.id)

  const session: PortalSession = {
    role: staff ? 'staff' : 'partner',
    partnerId: row.partner_slug || (staff ? 'staff' : 'partner'),
    name: row.full_name || data.user.email?.split('@')[0] || 'User',
    email: row.email || data.user.email || email,
    initials: row.initials || initialsFrom(row.full_name || data.user.email || 'U'),
  }
  saveSession(session)
  markPortalAuthenticated()
  return {
    ok: true,
    session,
    appRole,
    isSuperAdmin: isSuperAdminRole(appRole),
  }
}

export async function requestPasswordReset(email: string, redirectPath = '/login') {
  const sb = getSupabase()
  if (!sb) return 'No client'
  const path = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`
  const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}${path}`,
  })
  return error?.message ?? null
}

export async function logoutProduction() {
  const sb = getSupabase()
  if (sb) await sb.auth.signOut()
  clearSession()
  clearPortalAuthenticated()
}

export async function adminApi<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<{ data?: T; error?: string; status: number }> {
  const sb = getSupabase()
  if (!sb) return { error: 'No client', status: 0 }
  const {
    data: { session },
  } = await sb.auth.getSession()
  if (!session) return { error: 'Not authenticated', status: 401 }

  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.headers || {}),
    },
  })
  const json = (await res.json().catch(() => ({}))) as T & { error?: string }
  if (!res.ok) {
    return {
      error: (json as { error?: string }).error || res.statusText,
      status: res.status,
    }
  }
  return { data: json, status: res.status }
}
