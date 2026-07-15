/**
 * Cloudflare Pages Function — POST /api/nexus
 * Set secret: XAI_API_KEY in Cloudflare Pages environment.
 */

type ChatMessage = { role: string; content: string }

export async function onRequestPost(context: {
  request: Request
  env: { XAI_API_KEY?: string }
}): Promise<Response> {
  const key = context.env.XAI_API_KEY
  if (!key) {
    return Response.json({ demo: true, error: 'XAI_API_KEY not set' }, { status: 503 })
  }

  let body: { messages?: ChatMessage[]; model?: string }
  try {
    body = (await context.request.json()) as typeof body
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
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
    return new Response(JSON.stringify({ error: errText }), {
      status: xaiRes.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const data = (await xaiRes.json()) as {
    choices?: { message?: { content?: string } }[]
    model?: string
  }

  return Response.json({
    content: data.choices?.[0]?.message?.content ?? '',
    model: data.model || model,
  })
}
