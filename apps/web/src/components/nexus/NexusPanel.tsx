import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Bot,
  ChevronRight,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { sendNexusMessage } from '@/nexus/client'
import {
  clearSessionMessages,
  loadProjectMemories,
  loadSessionMessages,
  saveSessionMessages,
  type NexusMessage,
  type ProjectMemory,
} from '@/nexus/memory'
import { buildNexusLiveContext, pickNexusOpening } from '@/nexus/context'
import { useSpeechToText, type SpeechLang } from '@/nexus/useSpeechToText'
import { useDemoSession } from '@/hooks/useDemoSession'
import { cn } from '@/lib/cn'

const PANEL_W = 380

function uid() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function now() {
  return new Date().toISOString()
}

type Props = {
  /** Compact for admin shell */
  variant?: 'portal' | 'admin'
}

export function NexusPanel({ variant = 'portal' }: Props) {
  const location = useLocation()
  const { session } = useDemoSession()
  const [open, setOpen] = useState(true)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'live' | 'demo' | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  // Mặc định giọng Việt Nam
  const [speechLang, setSpeechLang] = useState<SpeechLang>('vi-VN')
  const [autoSendVoice, setAutoSendVoice] = useState(false)
  const [projects] = useState<ProjectMemory[]>(() => loadProjectMemories())
  const [projectId, setProjectId] = useState(() => loadProjectMemories()[0]?.projectId ?? '')
  const [messages, setMessages] = useState<NexusMessage[]>(() => loadSessionMessages())
  const bottomRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const baseBeforeVoiceRef = useRef('')
  const sendRef = useRef<(text?: string) => Promise<void>>(async () => {})

  // Inject Supabase partner/project context + conditional opening
  useEffect(() => {
    let cancelled = false
    void buildNexusLiveContext({
      routePath: location.pathname,
      activeProjectId: projectId || undefined,
      sessionPartnerSlug: session.partnerId || undefined,
      sessionName: session.name || undefined,
      sessionEmail: session.email || undefined,
    }).then((ctx) => {
      if (cancelled) return
      setMessages((prev) => {
        if (prev.length > 0) return prev
        return [
          {
            id: uid(),
            role: 'assistant',
            content: pickNexusOpening({
              hasActiveProject: ctx.hasActiveProject,
              userName: ctx.userName || session.name,
              lang: 'vi',
            }),
            at: now(),
          },
        ]
      })
    })
    return () => {
      cancelled = true
    }
  }, [location.pathname, projectId, session.partnerId, session.name, session.email])

  const onFinalSpeech = useCallback((finalText: string) => {
    setInput(() => {
      const base = baseBeforeVoiceRef.current
      const joined = base ? `${base.trimEnd()} ${finalText}`.trim() : finalText
      baseBeforeVoiceRef.current = joined
      return joined
    })
  }, [])

  const onInterimSpeech = useCallback((interimText: string) => {
    const base = baseBeforeVoiceRef.current
    setInput(base ? `${base.trimEnd()} ${interimText}`.trim() : interimText)
  }, [])

  const speech = useSpeechToText({
    lang: speechLang,
    onFinal: onFinalSpeech,
    onInterim: onInterimSpeech,
  })

  useEffect(() => {
    saveSessionMessages(messages)
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, open])

  useEffect(() => {
    if (speech.error) setHint(speech.error)
  }, [speech.error])

  // When user stops listening with auto-send and has text → send
  const wasListening = useRef(false)
  useEffect(() => {
    if (wasListening.current && !speech.listening && autoSendVoice) {
      const t = input.trim()
      if (t && !loading) void sendRef.current(t)
    }
    wasListening.current = speech.listening
  }, [speech.listening, autoSendVoice, input, loading])

  async function send(text?: string) {
    if (speech.listening) speech.stop()
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: NexusMessage = {
      id: uid(),
      role: 'user',
      content,
      at: now(),
    }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    baseBeforeVoiceRef.current = ''
    setLoading(true)
    setHint(null)

    // Refresh live context each turn (partner + projects from Supabase)
    const ctx = await buildNexusLiveContext({
      routePath: location.pathname,
      activeProjectId: projectId || undefined,
      sessionPartnerSlug: session.partnerId || undefined,
      sessionName: session.name || undefined,
      sessionEmail: session.email || undefined,
    })

    const result = await sendNexusMessage({
      messages: next,
      routePath: location.pathname,
      activeProjectId: projectId || undefined,
      activePartnerSlug: session.partnerId || ctx.partnerSlug || undefined,
      sessionName: session.name || ctx.userName,
      sessionEmail: session.email || undefined,
      liveContextBlock: ctx.block,
    })

    setMode(result.mode)
    if (result.error) setHint(result.error)

    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: 'assistant',
        content: result.content,
        at: now(),
      },
    ])
    setLoading(false)
  }

  sendRef.current = send

  function toggleMic() {
    if (!speech.supported) {
      setHint('Trình duyệt không hỗ trợ nhận giọng nói. Dùng Chrome hoặc Edge (HTTPS/localhost).')
      return
    }
    if (speech.listening) {
      speech.stop()
      return
    }
    baseBeforeVoiceRef.current = input.trim()
    speech.setError(null)
    setHint(null)
    speech.start()
  }

  function clearChat() {
    if (speech.listening) speech.stop()
    clearSessionMessages()
    void buildNexusLiveContext({
      routePath: location.pathname,
      activeProjectId: projectId || undefined,
      sessionPartnerSlug: session.partnerId || undefined,
      sessionName: session.name || undefined,
      sessionEmail: session.email || undefined,
    }).then((ctx) => {
      setMessages([
        {
          id: uid(),
          role: 'assistant',
          content: pickNexusOpening({
            hasActiveProject: ctx.hasActiveProject,
            userName: ctx.userName || session.name,
            lang: 'vi',
          }),
          at: now(),
        },
      ])
    })
    setMode(null)
    setHint(null)
    setInput('')
    baseBeforeVoiceRef.current = ''
  }

  const chips =
    variant === 'admin'
      ? [
          'Tóm tắt referral pending',
          'Bước tiếp theo project active',
          'Khi nào handoff desk 3H',
        ]
      : [
          'Giới thiệu dịch vụ 3HVN cho khách',
          'Soạn brief referral',
          'Map vấn đề khách → tầng dịch vụ',
          'Mở form /portal/referrals/new',
        ]

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg transition lg:right-6',
          variant === 'portal'
            ? 'border border-espresso-900/10 bg-espresso-900 text-cream-100 hover:bg-espresso-800'
            : 'bg-gradient-to-r from-portal-800 to-portal-violet text-white hover:brightness-110',
        )}
      >
        <Sparkles className={cn('h-4 w-4', variant === 'portal' && 'text-gold-500')} />
        {variant === 'portal' ? 'Counsel' : 'Nexus'}
      </button>
    )
  }

  return (
    <>
      <div
        className="pointer-events-none hidden shrink-0 lg:block"
        style={{ width: PANEL_W }}
        aria-hidden
      />

      <aside
        className={cn(
          'fixed bottom-0 right-0 z-40 flex w-full flex-col sm:w-[min(100%,380px)]',
          variant === 'portal'
            ? 'top-14 border-l border-espresso-900/8 bg-cream-50 shadow-[-8px_0_32px_rgba(28,22,16,0.08)] lg:top-16'
            : 'top-[5.5rem] border-l border-portal-200/80 bg-white shadow-[-8px_0_32px_rgba(26,35,72,0.08)] lg:top-[6rem]',
        )}
        style={{ maxWidth: PANEL_W }}
        aria-label={variant === 'portal' ? 'Nexus counsel' : 'Nexus advisor'}
      >
        <div
          className={cn(
            'flex items-start gap-3 border-b px-4 py-3.5 text-white',
            variant === 'portal'
              ? 'border-espresso-900/10 bg-espresso-900'
              : 'border-portal-100 bg-gradient-to-br from-portal-900 to-portal-violet py-3',
          )}
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Bot className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-display text-sm font-semibold tracking-tight">
                {variant === 'portal' ? 'Nexus Counsel' : 'Nexus'}
              </p>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  variant === 'portal' ? 'bg-gold-500/15 text-gold-500' : 'bg-white/15',
                )}
              >
                Grok 4.5
              </span>
            </div>
            <p className={cn('text-[11px]', variant === 'portal' ? 'text-cream-300/80' : 'text-white/75')}>
              {variant === 'portal'
                ? 'Dịch vụ 3HVN · Referral · Engagement'
                : 'Senior strategic advisor · 3HORIZONS'}
            </p>
            {mode ? (
              <p className="mt-0.5 text-[10px] text-white/60">
                {mode === 'live' ? 'Live API' : 'Demo memory mode'}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => {
              if (speech.listening) speech.stop()
              setOpen(false)
            }}
            aria-label="Thu gọn Nexus"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-portal-100 bg-portal-50/80 px-3 py-2">
          <label className="flex items-center gap-2 text-[11px] text-espresso-600">
            <span className="shrink-0 font-medium">Project memory</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="h-7 min-w-0 flex-1 rounded-lg border border-portal-200 bg-white px-2 text-[11px] outline-none"
            >
              <option value="">— Không gắn —</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-1 text-[10px] text-espresso-500">
            Memory: session · project · partner · global · voice STT
          </p>
        </div>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[92%] rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed',
                  m.role === 'user'
                    ? 'bg-portal-800 text-white'
                    : 'border border-portal-100 bg-portal-50 text-espresso-800',
                )}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
          {loading ? (
            <div className="flex items-center gap-2 px-1 text-xs text-espresso-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Nexus đang suy nghĩ…
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {hint ? (
          <p className="border-t border-amber-200/60 bg-amber-50 px-3 py-1.5 text-[10px] text-amber-900">
            {hint}
          </p>
        ) : null}

        {speech.listening ? (
          <div className="flex items-center gap-2 border-t border-terracotta-500/20 bg-terracotta-500/5 px-3 py-2 text-[11px] text-terracotta-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-terracotta-500" />
            </span>
            Đang nghe ({speechLang === 'vi-VN' ? 'Tiếng Việt' : 'English'})
            {speech.interim ? (
              <span className="truncate text-espresso-500">· {speech.interim}</span>
            ) : (
              <span className="text-espresso-500">· hãy nói rõ ràng</span>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5 border-t border-portal-100 px-3 py-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              disabled={loading}
              onClick={() => void send(c)}
              className="rounded-full border border-portal-200 bg-white px-2.5 py-1 text-[11px] font-medium text-portal-800 transition hover:bg-portal-50 disabled:opacity-50"
            >
              {c}
            </button>
          ))}
        </div>

        {/* Composer + mic */}
        <div className="border-t border-portal-100 p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value as SpeechLang)}
              className="h-7 rounded-lg border border-portal-200 bg-white px-2 text-[11px] text-espresso-700 outline-none"
              aria-label="Ngôn ngữ giọng nói"
              title="Ngôn ngữ nhận giọng nói"
            >
              <option value="vi-VN">Giọng VI</option>
              <option value="en-US">Giọng EN</option>
            </select>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-espresso-600">
              <input
                type="checkbox"
                checked={autoSendVoice}
                onChange={(e) => setAutoSendVoice(e.target.checked)}
                className="rounded border-portal-300"
              />
              Tự gửi khi dừng mic
            </label>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={toggleMic}
              disabled={loading}
              className={cn(
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition disabled:opacity-40',
                speech.listening
                  ? 'border-terracotta-500 bg-terracotta-500 text-white shadow-md'
                  : 'border-portal-200 bg-white text-portal-800 hover:bg-portal-50',
              )}
              aria-label={speech.listening ? 'Dừng nhận giọng nói' : 'Nói để nhập text'}
              title={
                speech.supported
                  ? speech.listening
                    ? 'Dừng nghe'
                    : 'Bắt đầu nói (Speech-to-Text)'
                  : 'Trình duyệt không hỗ trợ STT'
              }
            >
              {speech.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (!speech.listening) baseBeforeVoiceRef.current = e.target.value
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void send()
                }
              }}
              rows={2}
              placeholder={
                speech.listening
                  ? 'Đang nghe… nói vào microphone'
                  : 'Gõ hoặc bấm mic để nói với Nexus…'
              }
              className={cn(
                'min-h-[44px] flex-1 resize-none rounded-xl border bg-portal-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-portal-600/15',
                speech.listening
                  ? 'border-terracotta-400 focus:border-terracotta-500'
                  : 'border-portal-200 focus:border-portal-600',
              )}
            />
            <button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => void send()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-portal-800 text-white transition hover:bg-portal-700 disabled:opacity-40"
              aria-label="Gửi"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={clearChat}
              className="inline-flex items-center gap-1 text-[11px] text-espresso-500 hover:text-terracotta-600"
            >
              <Trash2 className="h-3 w-3" />
              Xóa session
            </button>
            <span className="inline-flex items-center gap-0.5 text-[10px] text-espresso-500">
              Mic → text → Grok
              <ChevronRight className="h-3 w-3" />
              Nexus
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}

export const NEXUS_PANEL_WIDTH = PANEL_W
