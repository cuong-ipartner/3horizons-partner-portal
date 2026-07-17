import { NEXUS_SYSTEM_PROMPT } from '@/nexus/systemPrompt'
import { buildMemoryContextBlock, type NexusMessage } from '@/nexus/memory'
import { nexusDemoReply } from '@/nexus/demoReply'
import {
  buildNexusLiveContext,
  detectMessageLang,
} from '@/nexus/context'
import { getNexusGrokEnabled } from '@/lib/app-settings'

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
  sessionName?: string
  sessionEmail?: string
  /** Prebuilt live context (optional — built here if omitted) */
  liveContextBlock?: string
}): Promise<NexusChatResult> {
  const lastUser = [...opts.messages].reverse().find((m) => m.role === 'user')
  const lang = detectMessageLang(lastUser?.content || '')

  const live =
    opts.liveContextBlock ||
    (
      await buildNexusLiveContext({
        routePath: opts.routePath,
        activeProjectId: opts.activeProjectId,
        sessionPartnerSlug: opts.activePartnerSlug,
        sessionName: opts.sessionName,
        sessionEmail: opts.sessionEmail,
      })
    ).block

  const memoryBlock = buildMemoryContextBlock({
    routePath: opts.routePath,
    activeProjectId: opts.activeProjectId,
    activePartnerSlug: opts.activePartnerSlug,
  })

  const langHint =
    lang === 'en'
      ? 'REPLY LANGUAGE: English (user wrote in English).'
      : 'REPLY LANGUAGE: Vietnamese (default).'

  const apiMessages = [
    {
      role: 'system' as const,
      content: `${NEXUS_SYSTEM_PROMPT}\n\n${langHint}\n\n${live}\n\n${memoryBlock}`,
    },
    ...opts.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ]

  // Admin Settings → Grok AI API off
  const grokEnabled = await getNexusGrokEnabled()
  if (!grokEnabled) {
    return {
      content: simplifyNexusText(nexusDemoReply(opts.messages, opts.routePath)),
      mode: 'demo',
      error:
        'Grok AI API đang TẮT (Admin → Settings). Nexus dùng chế độ offline — bật lại để Live Grok.',
    }
  }

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
      const errBody = await res.json().catch(async () => ({
        error: await res.text().catch(() => res.statusText),
      }))
      const errObj = errBody as { error?: string; hint?: string; code?: string }
      const raw = typeof errObj.error === 'string' ? errObj.error : JSON.stringify(errObj)
      const hint405 =
        res.status === 405
          ? ' (Cloudflare: POST /api/nexus chưa vào Pages Function — check Root=apps/web, redeploy)'
          : ''
      const hintXai =
        res.status === 403 || errObj.code === 'xai_permission'
          ? ' → xAI team/key: nạp credit + API key có quyền Chat/Grok (console.x.ai). Không phải lỗi portal.'
          : ''
      return {
        content: simplifyNexusText(nexusDemoReply(opts.messages, opts.routePath)),
        mode: 'demo',
        error: `API error ${res.status}: ${raw.slice(0, 120)}${hintXai}${hint405}${errObj.hint ? ` | ${errObj.hint}` : ''}`,
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
