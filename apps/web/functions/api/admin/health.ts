/**
 * GET /api/admin/health — which server secrets are present (booleans only).
 * No auth required so you can verify CF env after deploy.
 */

import { envPresence, type SupabaseEnv } from '../_lib/supabaseEnv'

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders })
}

export async function onRequestGet(context: { env: SupabaseEnv }) {
  const presence = envPresence(context.env || {})
  const ok = presence.resolved_service_role && presence.resolved_url
  return json(
    {
      ok,
      service: 'admin-health',
      env: presence,
      hint: ok
        ? 'Secrets visible to Pages Functions.'
        : 'Set SUPABASE_SERVICE_ROLE_KEY on Production (Encrypt). Optionally SUPABASE_URL. Then Redeploy.',
      required: ['SUPABASE_SERVICE_ROLE_KEY'],
      optional: ['SUPABASE_URL', 'VITE_SUPABASE_URL'],
    },
    ok ? 200 : 503,
  )
}
