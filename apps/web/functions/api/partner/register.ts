/**
 * Public partner self-registration from /join.
 * Creates Auth user with email_confirm=true, profile status=invited.
 * Login allowed only after admin sets status=active.
 *
 * Secrets: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL | VITE_SUPABASE_URL
 */

import {
  resolveServiceRole,
  resolveSupabaseUrl,
  type SupabaseEnv,
} from '../_lib/supabaseEnv'

type Env = SupabaseEnv

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders })
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || 'P'
}

function slugify(base: string) {
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders })
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const url = resolveSupabaseUrl(context.env)
  const service = resolveServiceRole(context.env)
  if (!url || !service) {
    return json(
      { error: 'Server missing SUPABASE_SERVICE_ROLE_KEY (partner register unavailable)' },
      503,
    )
  }

  const body = (await context.request.json().catch(() => ({}))) as {
    email?: string
    password?: string
    full_name?: string
    title?: string
    company?: string
    industry?: string
    bio?: string
    partner_slug?: string
    focus_layers?: string
    region?: string
    notes?: string
    linkedin_url?: string
  }

  const email = String(body.email || '')
    .trim()
    .toLowerCase()
  const password = String(body.password || '')
  const fullName = String(body.full_name || email.split('@')[0] || 'Partner').trim()

  if (!email.includes('@')) return json({ error: 'Invalid email' }, 400)
  if (password.length < 6) return json({ error: 'Password min 6 characters' }, 400)

  const partnerSlug =
    String(body.partner_slug || '').trim() ||
    `${slugify(body.company || fullName || email) || 'partner'}-${Date.now().toString(36).slice(-4)}`

  const initials = initialsFrom(fullName)

  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: service,
      Authorization: `Bearer ${service}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        initials,
        role: 'partner',
        partner_slug: partnerSlug,
      },
    }),
  })

  const created = (await createRes.json()) as {
    id?: string
    email?: string
    msg?: string
    message?: string
    error?: string
  }

  if (!createRes.ok) {
    const err = created.msg || created.message || created.error || 'Register failed'
    // If exists, try update password + confirm + keep invited until admin activates
    if (/already|registered|exists/i.test(err)) {
      return json(
        {
          error:
            'Email đã đăng ký. Đăng nhập khi admin đã duyệt, hoặc dùng Quên mật khẩu / liên hệ admin.',
          code: 'already_registered',
        },
        409,
      )
    }
    return json({ error: err }, createRes.status)
  }

  const uid = created.id
  if (!uid) return json({ error: 'No user id returned' }, 500)

  const notes = [
    body.title && `Title: ${body.title}`,
    body.company && `Company: ${body.company}`,
    body.industry && `Industry: ${body.industry}`,
    body.bio && `Bio: ${String(body.bio).slice(0, 500)}`,
    body.linkedin_url && `LinkedIn: ${body.linkedin_url}`,
    body.notes,
  ]
    .filter(Boolean)
    .join('\n')

  await fetch(`${url}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      apikey: service,
      Authorization: `Bearer ${service}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: uid,
      email,
      full_name: fullName,
      initials,
      role: 'partner',
      partner_slug: partnerSlug,
      status: 'invited',
      verified: false,
      focus_layers: body.focus_layers || null,
      region: body.region || 'Việt Nam',
      notes: notes || null,
      standing_status: 'onboarding',
      invited_at: new Date().toISOString(),
    }),
  })

  return json({
    ok: true,
    user_id: uid,
    email,
    partner_slug: partnerSlug,
    status: 'invited',
    message:
      'Tài khoản đã tạo (email confirmed). Chờ admin duyệt active trước khi đăng nhập portal.',
  })
}
