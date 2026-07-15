/**
 * Admin document operations that need service role (storage cleanup).
 * Secrets: SUPABASE_SERVICE_ROLE_KEY (+ optional SUPABASE_URL)
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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders })
}

async function requireStaff(env: Env, authHeader: string | null) {
  const url = resolveSupabaseUrl(env)
  const service = resolveServiceRole(env)
  if (!url || !service) {
    return {
      error: 'Missing server secrets',
      status: 503 as const,
      env: envPresence(env),
    }
  }
  if (!authHeader?.startsWith('Bearer ')) return { error: 'Unauthorized', status: 401 as const }
  const jwt = authHeader.slice(7)
  const userRes = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: service, Authorization: `Bearer ${jwt}` },
  })
  if (!userRes.ok) return { error: 'Invalid session', status: 401 as const }
  const user = (await userRes.json()) as { id: string; email?: string }
  const profRes = await fetch(
    `${url}/rest/v1/profiles?id=eq.${user.id}&select=role,status`,
    { headers: { apikey: service, Authorization: `Bearer ${service}` } },
  )
  const profiles = (await profRes.json()) as { role: string; status: string }[]
  const p = profiles[0]
  const staff = ['super_admin', 'partner_manager', 'content_editor', 'project_operator']
  if (!p || p.status !== 'active' || !staff.includes(p.role)) {
    return { error: 'Staff only', status: 403 as const }
  }
  return { url, service, user }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const gate = await requireStaff(context.env, context.request.headers.get('Authorization'))
  if ('error' in gate) {
    return json(
      { error: gate.error, env: 'env' in gate ? gate.env : undefined },
      gate.status,
    )
  }
  const { url, service, user } = gate

  const body = (await context.request.json().catch(() => ({}))) as {
    action?: string
    document_id?: string
    storage_paths?: string[]
  }

  if (body.action === 'purge_demo_files') {
    // Remove seed objects under docs/seed-*
    const listRes = await fetch(
      `${url}/storage/v1/object/list/partner-library`,
      {
        method: 'POST',
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix: 'docs/', limit: 100 }),
      },
    )
    const listed = (await listRes.json()) as { name?: string }[]
    const paths = (Array.isArray(listed) ? listed : [])
      .map((f) => f.name)
      .filter((n): n is string => !!n && n.includes('seed'))
      .map((n) => `docs/${n.replace(/^docs\//, '')}`)

    if (paths.length) {
      await fetch(`${url}/storage/v1/object/partner-library`, {
        method: 'DELETE',
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefixes: paths }),
      })
    }

    await fetch(`${url}/rest/v1/audit_logs`, {
      method: 'POST',
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        actor_id: user.id,
        actor_email: user.email,
        action: 'documents.purge_demo',
        entity_type: 'library',
        entity_id: 'demo',
        meta: { paths },
      }),
    })

    return json({ ok: true, removed_paths: paths })
  }

  if (body.action === 'delete_storage' && body.storage_paths?.length) {
    await fetch(`${url}/storage/v1/object/partner-library`, {
      method: 'DELETE',
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefixes: body.storage_paths }),
    })
    return json({ ok: true })
  }

  return json({ error: 'Unknown action' }, 400)
}
