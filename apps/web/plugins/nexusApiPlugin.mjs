/**
 * Vite dev middleware: POST /api/nexus → xAI Grok (server-side key).
 * Production: Cloudflare Pages Function functions/api/nexus.ts
 */

/** @returns {import('vite').Plugin} */
export function nexusApiPlugin() {
  return {
    name: 'nexus-api-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/nexus') || req.method !== 'POST') {
          next()
          return
        }

        try {
          const chunks = []
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
          }
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')

          const apiKey = process.env.XAI_API_KEY
          if (!apiKey) {
            res.statusCode = 503
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ demo: true, error: 'XAI_API_KEY not set' }))
            return
          }

          const model = body.model || 'grok-4.5'
          const messages = body.messages || []

          const xaiRes = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
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
            res.statusCode = xaiRes.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: errText }))
            return
          }

          const data = await xaiRes.json()
          const content = data.choices?.[0]?.message?.content ?? ''

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ content, model: data.model || model }))
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: e instanceof Error ? e.message : 'Nexus proxy error',
            }),
          )
        }
      })
    },
  }
}
