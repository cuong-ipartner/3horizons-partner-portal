/**
 * Cloudflare Pages Function — Admin user lifecycle (service role).
 * Secrets: SUPABASE_SERVICE_ROLE_KEY (+ optional SUPABASE_URL / VITE_SUPABASE_URL)
 */

import {
  envPresence,
  resolveServiceRole,
  resolveSupabaseUrl,
  type SupabaseEnv,
} from '../_lib/supabaseEnv'

type Env = SupabaseEnv

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders })
}

async function requireStaff(env: Env, authHeader: string | null) {
  const url = resolveSupabaseUrl(env)
  const service = resolveServiceRole(env)
  if (!url || !service) {
    return {
      error: 'Server missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY',
      status: 503,
      env: envPresence(env),
    }
  }

  if (!authHeader?.startsWith('Bearer ')) return { error: 'Unauthorized', status: 401 }
  const jwt = authHeader.slice(7)

  const userRes = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: service, Authorization: `Bearer ${jwt}` },
  })
  if (!userRes.ok) return { error: 'Invalid session', status: 401 }
  const user = (await userRes.json()) as { id?: string; email?: string }
  if (!user.id) return { error: 'Invalid user', status: 401 }

  const profRes = await fetch(
    `${url}/rest/v1/profiles?id=eq.${user.id}&select=id,email,role,status,full_name`,
    { headers: { apikey: service, Authorization: `Bearer ${service}` } },
  )
  const profiles = (await profRes.json()) as {
    id: string
    email: string
    role: string
    status: string
    full_name: string
  }[]
  const profile = profiles[0]
  const staffRoles = ['super_admin', 'partner_manager', 'project_operator', 'content_editor']
  if (!profile || profile.status !== 'active' || !staffRoles.includes(profile.role)) {
    return { error: 'Staff only', status: 403 }
  }
  return { url, service, user, profile }
}

async function audit(
  env: { url: string; service: string },
  actor: { id?: string; email?: string },
  action: string,
  entityType: string,
  entityId?: string,
  meta?: Record<string, unknown>,
) {
  await fetch(`${env.url}/rest/v1/audit_logs`, {
    method: 'POST',
    headers: {
      apikey: env.service,
      Authorization: `Bearer ${env.service}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      actor_id: actor.id ?? null,
      actor_email: actor.email ?? null,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      meta: meta ?? {},
    }),
  })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders })
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const gate = await requireStaff(context.env, context.request.headers.get('Authorization'))
  if ('error' in gate && gate.error) {
    return json(
      { error: gate.error, env: 'env' in gate ? gate.env : undefined },
      gate.status,
    )
  }

  const { url, service } = gate as {
    url: string
    service: string
    user: { id: string; email?: string }
  }

  const res = await fetch(
    `${url}/rest/v1/profiles?select=id,email,full_name,initials,role,status,partner_slug,region,focus_layers,verified,created_at,last_login_at,invited_at&order=created_at.desc`,
    { headers: { apikey: service, Authorization: `Bearer ${service}` } },
  )
  const data = await res.json()
  if (!res.ok) return json({ error: data }, res.status)
  return json({ users: data })
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const gate = await requireStaff(context.env, context.request.headers.get('Authorization'))
  if ('error' in gate && gate.error) {
    return json(
      { error: gate.error, env: 'env' in gate ? gate.env : undefined },
      gate.status,
    )
  }

  const { url, service, user, profile } = gate as {
    url: string
    service: string
    user: { id: string; email?: string }
    profile: { role: string }
  }

  const body = (await context.request.json().catch(() => ({}))) as {
    action?: string
    email?: string
    full_name?: string
    role?: string
    partner_slug?: string
    password?: string
    user_id?: string
    status?: string
  }

  const action = body.action || 'invite'

  if (action === 'invite') {
    const email = String(body.email || '')
      .trim()
      .toLowerCase()
    if (!email || !email.includes('@')) return json({ error: 'Invalid email' }, 400)
    const role = body.role || 'partner'
    const password =
      body.password ||
      `Tmp-${Math.random().toString(36).slice(2, 10)}A1!`

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
          full_name: body.full_name || email.split('@')[0],
          role,
          partner_slug: body.partner_slug || null,
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
      return json(
        { error: created.msg || created.message || created.error || 'Invite failed' },
        createRes.status,
      )
    }

    const uid = created.id
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
        full_name: body.full_name || email.split('@')[0],
        role,
        partner_slug: body.partner_slug || null,
        status: 'active',
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        verified: role === 'partner',
      }),
    })

    await audit(
      { url, service },
      user,
      'user.invite',
      'user',
      uid,
      { email, role, by: profile.role },
    )

    return json({
      ok: true,
      user_id: uid,
      email,
      temporary_password: body.password ? undefined : password,
      message: body.password
        ? 'User created'
        : 'User created with temporary password — share securely and require reset.',
    })
  }

  if (action === 'set_status') {
    if (!body.user_id || !body.status) return json({ error: 'user_id and status required' }, 400)
    const res = await fetch(`${url}/rest/v1/profiles?id=eq.${body.user_id}`, {
      method: 'PATCH',
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: body.status }),
    })
    if (!res.ok) return json({ error: await res.text() }, res.status)

    const ban = body.status === 'suspended' || body.status === 'archived'
    await fetch(`${url}/auth/v1/admin/users/${body.user_id}`, {
      method: 'PUT',
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ban_duration: ban ? '876600h' : 'none' }),
    })

    await audit(
      { url, service },
      user,
      'user.set_status',
      'user',
      body.user_id,
      { status: body.status },
    )
    return json({ ok: true })
  }

  if (action === 'set_role') {
    if (!body.user_id || !body.role) return json({ error: 'user_id and role required' }, 400)
    const res = await fetch(`${url}/rest/v1/profiles?id=eq.${body.user_id}`, {
      method: 'PATCH',
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ role: body.role }),
    })
    if (!res.ok) return json({ error: await res.text() }, res.status)
    await audit(
      { url, service },
      user,
      'user.set_role',
      'user',
      body.user_id,
      { role: body.role },
    )
    return json({ ok: true })
  }

  if (action === 'reset_password') {
    if (!body.user_id) return json({ error: 'user_id required' }, 400)
    const password =
      body.password ||
      `Reset-${Math.random().toString(36).slice(2, 10)}A1!`
    const res = await fetch(`${url}/auth/v1/admin/users/${body.user_id}`, {
      method: 'PUT',
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) return json({ error: await res.text() }, res.status)
    await audit({ url, service }, user, 'user.reset_password', 'user', body.user_id, {})
    return json({
      ok: true,
      temporary_password: body.password ? undefined : password,
    })
  }

  if (action === 'cleanup_demo') {
    // Soft-archive known demo personas by email pattern
    const demoEmails = [
      'cuong.doan@partners.3horizons.vn',
      'lan.pham@partners.3horizons.vn',
      'erik.sundberg@partners.3horizons.vn',
      'david.tran@partners.3horizons.vn',
      'staff@partners.3horizons.vn',
    ]
    for (const email of demoEmails) {
      await fetch(
        `${url}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: service,
            Authorization: `Bearer ${service}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ status: 'archived', notes: 'Archived by production cleanup' }),
        },
      )
    }
    await audit({ url, service }, user, 'cleanup.demo_users', 'system', 'demo', {
      emails: demoEmails,
    })
    return json({ ok: true, archived_emails: demoEmails })
  }

  return json({ error: 'Unknown action' }, 400)
}
