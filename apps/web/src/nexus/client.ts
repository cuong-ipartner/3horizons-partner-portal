import { NEXUS_SYSTEM_PROMPT } from '@/nexus/systemPrompt'
import { buildMemoryContextBlock, type NexusMessage } from '@/nexus/memory'
import { nexusDemoReply } from '@/nexus/demoReply'

export type NexusChatResult = {
  content: string
  mode: 'live' | 'demo'
  model?: string
  error?: string
}

/** Strip markdown bold/italic for simple plain-text replies. */
export function simplifyNexusText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function sendNexusMessage(opts: {
  messages: NexusMessage[]
  routePath?: string
  activeProjectId?: string
  activePartnerSlug?: string
}): Promise<NexusChatResult> {
  const memoryBlock = buildMemoryContextBlock({
    routePath: opts.routePath,
    activeProjectId: opts.activeProjectId,
    activePartnerSlug: opts.activePartnerSlug,
  })

  const apiMessages = [
    { role: 'system' as const, content: `${NEXUS_SYSTEM_PROMPT}\n\n${memoryBlock}` },
    ...opts.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ]

  try {
    const res = await fetch('/api/nexus', {
      // CF Pages: must hit Functions; 405 = static asset (misconfigured deploy)
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: apiMessages,
        model: 'grok-4.5',
      }),
    })

    if (res.status === 503 || res.status === 401) {
      return {
        content: simplifyNexusText(nexusDemoReply(opts.messages, opts.routePath)),
        mode: 'demo',
        error: 'XAI_API_KEY chưa cấu hình — đang dùng Nexus demo (memory-aware).',
      }
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText)
      const hint405 =
        res.status === 405
          ? ' (Cloudflare: POST /api/nexus chưa vào Pages Function — check Root=apps/web, redeploy, GET /api/nexus phải trả JSON)'
          : ''
      return {
        content: simplifyNexusText(nexusDemoReply(opts.messages, opts.routePath)),
        mode: 'demo',
        error: `API error ${res.status}: ${errText.slice(0, 80)}${hint405}`,
      }
    }

    const data = (await res.json()) as {
      content?: string
      model?: string
      demo?: boolean
    }

    if (data.demo || !data.content) {
      return {
        content: simplifyNexusText(
          data.content || nexusDemoReply(opts.messages, opts.routePath),
        ),
        mode: 'demo',
        model: data.model,
      }
    }

    return {
      content: simplifyNexusText(data.content),
      mode: 'live',
      model: data.model ?? 'grok-4.5',
    }
  } catch {
    return {
      content: simplifyNexusText(nexusDemoReply(opts.messages, opts.routePath)),
      mode: 'demo',
      error: 'Không kết nối được API — Nexus demo mode.',
    }
  }
}
