/**
 * Cloudflare Pages Function — /api/nexus
 * Secret: XAI_API_KEY (Pages → Settings → Environment variables)
 */

type ChatMessage = { role: string; content: string }

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders })
}

/** Health check — proves Functions are wired (not static 405). */
export async function onRequestGet() {
  return json({
    ok: true,
    service: 'nexus',
    methods: ['POST'],
    hint: 'POST { messages: [...] } with XAI_API_KEY set for live Grok.',
  })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders })
}

export async function onRequestPost(context: {
  request: Request
  env: { XAI_API_KEY?: string }
}): Promise<Response> {
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
