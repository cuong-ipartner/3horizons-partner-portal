/**
 * Production auth helpers — no demo personas.
 */

import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'
import { clearSession, saveSession, type DemoSession } from '@/lib/session'
import { clearPortalAuthenticated, markPortalAuthenticated } from '@/lib/authGate'

export type AppRole =
  | 'super_admin'
  | 'partner_manager'
  | 'project_operator'
  | 'content_editor'
  | 'partner'
  | 'client'

export type UserStatus = 'invited' | 'active' | 'suspended' | 'archived'

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

const STAFF: AppRole[] = [
  'super_admin',
  'partner_manager',
  'project_operator',
  'content_editor',
]

export function isStaffRole(role: string) {
  return STAFF.includes(role as AppRole)
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || 'U'
}

export async function loginProduction(
  email: string,
  password: string,
): Promise<{ ok: true; session: DemoSession } | { ok: false; error: string }> {
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
    return { ok: false, error: error?.message || 'Đăng nhập thất bại' }
  }

  const { data: profile, error: pErr } = await sb
    .from('profiles')
    .select('id,email,full_name,initials,role,status,partner_slug')
    .eq('id', data.user.id)
    .maybeSingle()

  if (pErr) return { ok: false, error: pErr.message }

  const row = profile as {
    full_name?: string
    initials?: string
    role?: string
    status?: string
    partner_slug?: string
    email?: string
  } | null

  if (row?.status === 'suspended') {
    await sb.auth.signOut()
    return { ok: false, error: 'Tài khoản đã bị tạm khóa. Liên hệ admin.' }
  }
  if (row?.status === 'archived') {
    await sb.auth.signOut()
    return { ok: false, error: 'Tài khoản đã lưu trữ. Liên hệ admin.' }
  }

  // Touch last_login
  await sb
    .from('profiles')
    .update({ last_login_at: new Date().toISOString(), status: row?.status || 'active' })
    .eq('id', data.user.id)

  const role = (row?.role || 'partner') as AppRole
  const session: DemoSession = {
    role: isStaffRole(role) ? 'staff' : 'partner',
    partnerId: row?.partner_slug || (isStaffRole(role) ? 'staff' : 'partner'),
    name: row?.full_name || data.user.email?.split('@')[0] || 'User',
    email: row?.email || data.user.email || email,
    initials: row?.initials || initialsFrom(row?.full_name || data.user.email || 'U'),
  }
  saveSession(session)
  markPortalAuthenticated()
  return { ok: true, session }
}

export async function requestPasswordReset(email: string) {
  const sb = getSupabase()
  if (!sb) return 'No client'
  const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/login`,
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
