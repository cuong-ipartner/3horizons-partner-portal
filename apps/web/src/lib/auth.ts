/**
 * Supabase Auth helpers — production only (no demo personas / local fallback).
 */

import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'
import { type DemoSession, saveSession, clearSession } from '@/lib/session'
import { clearPortalAuthenticated, markPortalAuthenticated } from '@/lib/authGate'

export type AuthResult =
  | {
      ok: true
      session: DemoSession
      userId: string
      via: 'supabase' | 'session'
      notice?: string
    }
  | { ok: false; error: string }

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

/** Always false — local demo auth removed. */
export function isAuthLocalFallback(): boolean {
  return false
}

type ProfileRow = {
  email: string | null
  full_name: string | null
  initials: string | null
  role: string
  partner_slug: string | null
  status?: string | null
}

export async function fetchProfileSession(userId: string): Promise<DemoSession | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from('profiles')
    .select('email, full_name, initials, role, partner_slug, status')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null

  const row = data as ProfileRow
  if (row.status === 'suspended' || row.status === 'archived') {
    return null
  }

  const isStaff =
    row.role === 'super_admin' ||
    row.role === 'partner_manager' ||
    row.role === 'project_operator' ||
    row.role === 'content_editor'

  return {
    role: isStaff ? 'staff' : 'partner',
    partnerId: row.partner_slug || (isStaff ? 'staff' : 'partner'),
    name: row.full_name || row.email || 'User',
    email: row.email || '',
    initials: row.initials || initialsFrom(row.full_name || row.email || 'U'),
  }
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: 'Supabase Auth chưa cấu hình (VITE_SUPABASE_*).' }
  }
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Supabase client chưa sẵn sàng' }

  const normalized = email.trim().toLowerCase()
  const { data, error } = await sb.auth.signInWithPassword({
    email: normalized,
    password,
  })
  if (error || !data.user) {
    return { ok: false, error: error?.message || 'Đăng nhập thất bại' }
  }

  const session = (await fetchProfileSession(data.user.id)) ?? {
    role: 'partner' as const,
    partnerId: 'partner',
    name: data.user.email?.split('@')[0] || 'User',
    email: data.user.email || normalized,
    initials: 'U',
  }
  saveSession(session)
  markPortalAuthenticated()
  return { ok: true, session, userId: data.user.id, via: 'supabase' }
}

/** Verify current user is staff — no auto login as demo staff. */
export async function ensureStaffAuth(): Promise<AuthResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: 'Supabase chưa cấu hình' }
  }
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Supabase client unavailable' }

  const { data } = await sb.auth.getSession()
  const uid = data.session?.user?.id
  if (!uid) {
    return { ok: false, error: 'Chưa đăng nhập staff. Vào /admin/login bằng tài khoản admin.' }
  }
  const profile = await fetchProfileSession(uid)
  if (!profile || profile.role !== 'staff') {
    return { ok: false, error: 'Phiên hiện tại không phải staff.' }
  }
  saveSession(profile)
  markPortalAuthenticated()
  return { ok: true, session: profile, userId: uid, via: 'session' }
}

export async function logoutAuth() {
  const sb = getSupabase()
  if (sb) {
    try {
      await sb.auth.signOut()
    } catch {
      /* ignore */
    }
  }
  clearSession()
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
    markPortalAuthenticated()
  } else {
    clearSession()
    clearPortalAuthenticated()
  }
  return session
}

/** Empty — demo personas removed */
export const DEMO_PARTNER_PERSONAS: DemoSession[] = []
