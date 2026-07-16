/**
 * Create real Supabase Auth + profile from /join application.
 * Password is never stored in localStorage.
 */

import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'
import { saveSession } from '@/lib/session'
import { markPortalAuthenticated } from '@/lib/authGate'
import { clearDraft, submitApplication } from '@/onboarding/storage'
import type { PartnerApplication } from '@/onboarding/types'

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || 'P'
}

/** Unique-ish slug for project membership (profiles.partner_slug). */
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
      sessionReady: boolean
      notice?: string
    }
  | { ok: false; error: string }

/**
 * 1) Supabase Auth signUp (role partner)
 * 2) Patch profile standing fields
 * 3) Save application copy for Admin → Partners (local queue)
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
        'Supabase chưa cấu hình trên bản build (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Không thể tạo tài khoản login.',
    }
  }
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Supabase client không sẵn sàng.' }

  const partnerSlug = partnerSlugFromApp(app)
  const fullName = app.fullName.trim() || email.split('@')[0]
  const initials = initialsFrom(fullName)

  const { data: signData, error: signErr } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        initials,
        role: 'partner',
        partner_slug: partnerSlug,
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  })

  if (signErr) {
    const msg = signErr.message || 'Đăng ký thất bại'
    // Already registered → try sign-in so they can complete profile
    if (/already|registered|exists/i.test(msg)) {
      const { data: inData, error: inErr } = await sb.auth.signInWithPassword({ email, password })
      if (inErr || !inData.user) {
        return {
          ok: false,
          error:
            'Email đã có tài khoản. Dùng đúng mật khẩu đã đăng ký trước đó, hoặc Đăng nhập partner / Quên mật khẩu.',
        }
      }
      await patchPartnerProfile(sb, inData.user.id, app, partnerSlug, fullName, initials)
      const submitted = submitApplication({
        ...app,
        email,
        passwordSet: true,
        enrichment: null,
        enrichmentReviewed: true,
        status: 'submitted',
      })
      saveSession({
        role: 'partner',
        partnerId: partnerSlug,
        name: fullName,
        email,
        initials,
      })
      markPortalAuthenticated()
      return {
        ok: true,
        application: submitted,
        userId: inData.user.id,
        sessionReady: true,
        notice: 'Email đã tồn tại — đã đăng nhập và cập nhật hồ sơ.',
      }
    }
    return { ok: false, error: msg }
  }

  const user = signData.user
  if (!user) {
    return { ok: false, error: 'Không tạo được user. Thử lại hoặc liên hệ admin.' }
  }

  // Profile row: trigger handle_new_user usually inserts; patch standing fields
  await patchPartnerProfile(sb, user.id, app, partnerSlug, fullName, initials)

  const sessionReady = Boolean(signData.session)
  if (sessionReady) {
    saveSession({
      role: 'partner',
      partnerId: partnerSlug,
      name: fullName,
      email,
      initials,
    })
    markPortalAuthenticated()
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
    userId: user.id,
    sessionReady,
    notice: sessionReady
      ? undefined
      : 'Tài khoản đã tạo. Nếu Supabase bật Confirm email, hãy xác nhận email trước khi đăng nhập.',
  }
}

async function patchPartnerProfile(
  sb: NonNullable<ReturnType<typeof getSupabase>>,
  userId: string,
  app: PartnerApplication,
  partnerSlug: string,
  fullName: string,
  initials: string,
) {
  const focus = [
    ...app.ecosystemLayers.slice(0, 4),
    ...app.expertiseTags.slice(0, 3),
  ]
    .filter(Boolean)
    .join(' · ')

  const notes = [
    app.title && `Title: ${app.title}`,
    app.company && `Company: ${app.company}`,
    app.industry && `Industry: ${app.industry}`,
    app.bio && `Bio: ${app.bio.slice(0, 500)}`,
    app.linkedinUrl && `LinkedIn: ${app.linkedinUrl}`,
    app.caseStudies && `Cases: ${app.caseStudies.slice(0, 300)}`,
  ]
    .filter(Boolean)
    .join('\n')

  await sb
    .from('profiles')
    .update({
      email: app.email.trim().toLowerCase(),
      full_name: fullName,
      initials,
      role: 'partner',
      partner_slug: partnerSlug,
      status: 'active',
      focus_layers: focus || null,
      region: app.preferredLanguage === 'en' ? 'International' : 'Việt Nam',
      verified: false,
      notes: notes || null,
      standing_status: 'onboarding',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
}
