/**
 * Cloudflare Pages Function — /api/nexus
 * Secrets: XAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY (optional — for admin toggle check)
 */

import {
  resolveServiceRole,
  resolveSupabaseUrl,
  type SupabaseEnv,
} from './_lib/supabaseEnv'

type ChatMessage = { role: string; content: string }

type Env = SupabaseEnv & { XAI_API_KEY?: string }

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders })
}

/** Read Admin Settings toggle; default true if unset. */
async function isGrokEnabledInDb(env: Env): Promise<boolean> {
  const url = resolveSupabaseUrl(env)
  const service = resolveServiceRole(env)
  if (!url || !service) return true
  try {
    const res = await fetch(
      `${url}/rest/v1/app_settings?key=eq.nexus_grok_enabled&select=value`,
      {
        headers: {
          apikey: service,
          Authorization: `Bearer ${service}`,
        },
      },
    )
    if (!res.ok) return true
    const rows = (await res.json()) as { value: unknown }[]
    if (!rows[0]) return true
    const v = rows[0].value
    if (v === false || v === 'false') return false
    return true
  } catch {
    return true
  }
}

/** Health check — proves Functions are wired (not static 405). */
export async function onRequestGet(context: { env: Env }) {
  const grokOn = await isGrokEnabledInDb(context.env)
  return json({
    ok: true,
    service: 'nexus',
    methods: ['POST'],
    has_XAI_API_KEY: Boolean(context.env.XAI_API_KEY),
    nexus_grok_enabled: grokOn,
    hint: 'POST { messages: [...] } with XAI_API_KEY set for live Grok. Admin can disable via Settings.',
  })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders })
}

export async function onRequestPost(context: {
  request: Request
  env: Env
}): Promise<Response> {
  const grokOn = await isGrokEnabledInDb(context.env)
  if (!grokOn) {
    return json(
      {
        demo: true,
        error: 'Grok AI API disabled by admin (Settings → Grok AI API OFF)',
        code: 'grok_disabled',
      },
      503,
    )
  }

  const key = context.env.XAI_API_KEY
  if (!key) {
    return json({ demo: true, error: 'XAI_API_KEY not set' }, 503)
  }

  let body: { messages?: ChatMessage[]; model?: string }
  try {
    body = (await context.request.json()) as typeof body
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const model = body.model || 'grok-4.5'
  const messages = body.messages || []

  const xaiRes = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
    }),
  })

  if (!xaiRes.ok) {
    const errText = await xaiRes.text()
    // xAI team/billing/permission issues (common on new teams)
    if (
      xaiRes.status === 403 ||
      /permission-denied|newly created team|spending limit|credits|blocked/i.test(errText)
    ) {
      return json(
        {
          error: errText,
          code: 'xai_permission',
          hint:
            'xAI 403: team/API key chưa có quyền hoặc hết credit. Console x.ai → Team billing/credits → tạo lại API key với Chat endpoint + model Grok → cập nhật secret XAI_API_KEY trên Cloudflare.',
        },
        403,
      )
    }
    return json({ error: errText }, xaiRes.status)
  }

  const data = (await xaiRes.json()) as {
    choices?: { message?: { content?: string } }[]
    model?: string
  }

  return json({
    content: data.choices?.[0]?.message?.content ?? '',
    model: data.model || model,
  })
}
