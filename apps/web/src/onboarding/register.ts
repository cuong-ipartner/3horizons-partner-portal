/**
 * Partner /join → server register (email confirmed, status invited).
 * Login only after admin Activate (status active).
 * Password never stored in localStorage.
 */

import { isSupabaseAuthEnabled } from '@/lib/supabase'
import { clearDraft, submitApplication } from '@/onboarding/storage'
import type { PartnerApplication } from '@/onboarding/types'

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || 'P'
}

export function partnerSlugFromApp(app: PartnerApplication): string {
  const base = (app.company || app.fullName || app.email.split('@')[0] || 'partner')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  const suffix = Date.now().toString(36).slice(-4)
  return `${base || 'partner'}-${suffix}`
}

export type RegisterResult =
  | {
      ok: true
      application: PartnerApplication
      userId: string
      sessionReady: false
      notice?: string
    }
  | { ok: false; error: string }

/**
 * POST /api/partner/register (service role):
 * - Auth user with email_confirm: true
 * - profiles.status = invited (cannot login until admin activates)
 */
export async function registerPartnerAndSubmit(
  app: PartnerApplication,
  password: string,
): Promise<RegisterResult> {
  const email = app.email.trim().toLowerCase()
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Email không hợp lệ.' }
  }
  if (!password || password.length < 6) {
    return { ok: false, error: 'Mật khẩu tối thiểu 6 ký tự.' }
  }
  if (!isSupabaseAuthEnabled()) {
    return {
      ok: false,
      error:
        'Supabase chưa cấu hình trên bản build (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
    }
  }

  const fullName = app.fullName.trim() || email.split('@')[0]
  const partnerSlug = partnerSlugFromApp(app)
  const focus = [...app.ecosystemLayers.slice(0, 4), ...app.expertiseTags.slice(0, 3)]
    .filter(Boolean)
    .join(' · ')

  const res = await fetch('/api/partner/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
      title: app.title,
      company: app.company,
      industry: app.industry,
      bio: app.bio,
      partner_slug: partnerSlug,
      focus_layers: focus || undefined,
      region: app.preferredLanguage === 'en' ? 'International' : 'Việt Nam',
      linkedin_url: app.linkedinUrl || undefined,
      notes: app.caseStudies ? `Cases: ${app.caseStudies.slice(0, 300)}` : undefined,
    }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean
    error?: string
    user_id?: string
    message?: string
    code?: string
  }

  if (!res.ok || !data.ok) {
    return {
      ok: false,
      error: data.error || `Đăng ký thất bại (${res.status})`,
    }
  }

  const submitted = submitApplication({
    ...app,
    email,
    passwordSet: true,
    enrichment: null,
    enrichmentReviewed: true,
    status: 'submitted',
  })
  clearDraft()

  return {
    ok: true,
    application: submitted,
    userId: data.user_id || '',
    sessionReady: false,
    notice:
      data.message ||
      'Tài khoản đã tạo. Email đã xác nhận kỹ thuật — đăng nhập sau khi admin duyệt Active.',
  }
}

export { initialsFrom }
