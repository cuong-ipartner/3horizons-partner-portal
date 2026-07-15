/**
 * Browser Speech-to-Text (Web Speech API) for Nexus composer.
 * Chrome / Edge: best support. Safari partial. Firefox limited.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export type SpeechLang = 'vi-VN' | 'en-US'

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onstart: ((ev: Event) => void) | null
  onend: ((ev: Event) => void) | null
  onerror: ((ev: Event & { error?: string }) => void) | null
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: {
    length: number
    [i: number]: {
      isFinal: boolean
      [j: number]: { transcript: string }
    }
  }
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isSpeechRecognitionSupported() {
  return getSpeechRecognitionCtor() != null
}

export function useSpeechToText(opts: {
  lang?: SpeechLang
  /** Called with full committed text when a final segment arrives */
  onFinal?: (text: string) => void
  /** Called with interim (live) transcript */
  onInterim?: (text: string) => void
}) {
  const [listening, setListening] = useState(false)
  const [supported] = useState(() => isSpeechRecognitionSupported())
  const [error, setError] = useState<string | null>(null)
  const [interim, setInterim] = useState('')
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const lang = opts.lang ?? 'vi-VN'

  const onFinalRef = useRef(opts.onFinal)
  const onInterimRef = useRef(opts.onInterim)
  onFinalRef.current = opts.onFinal
  onInterimRef.current = opts.onInterim

  const stop = useCallback(() => {
    try {
      recRef.current?.stop()
    } catch {
      /* ignore */
    }
    setListening(false)
  }, [])

  const start = useCallback(() => {
    setError(null)
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setError('Trình duyệt không hỗ trợ nhận giọng nói. Dùng Chrome hoặc Edge.')
      return
    }

    // Stop previous instance
    try {
      recRef.current?.abort()
    } catch {
      /* ignore */
    }

    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => {
      setListening(true)
      setInterim('')
    }

    rec.onend = () => {
      setListening(false)
      setInterim('')
    }

    rec.onerror = (ev) => {
      const code = ev.error ?? 'unknown'
      const map: Record<string, string> = {
        'not-allowed': 'Chưa cho phép microphone. Hãy bật quyền mic trên trình duyệt.',
        'no-speech': 'Không nghe thấy giọng nói. Thử nói lại.',
        'audio-capture': 'Không tìm thấy microphone.',
        network: 'Lỗi mạng khi nhận giọng nói.',
        aborted: '',
      }
      const msg = map[code] ?? `Lỗi nhận giọng nói: ${code}`
      if (msg) setError(msg)
      setListening(false)
    }

    rec.onresult = (ev) => {
      let interimBuf = ''
      let finalBuf = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const piece = ev.results[i][0]?.transcript ?? ''
        if (ev.results[i].isFinal) finalBuf += piece
        else interimBuf += piece
      }
      if (interimBuf) {
        setInterim(interimBuf)
        onInterimRef.current?.(interimBuf)
      }
      if (finalBuf.trim()) {
        setInterim('')
        onFinalRef.current?.(finalBuf.trim())
      }
    }

    recRef.current = rec
    try {
      rec.start()
    } catch {
      setError('Không thể bắt đầu microphone. Thử lại.')
      setListening(false)
    }
  }, [lang])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort()
      } catch {
        /* ignore */
      }
    }
  }, [])

  // If language changes while listening, restart
  useEffect(() => {
    if (!listening) return
    stop()
    // restart with new lang on next tick
    const t = window.setTimeout(() => start(), 120)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on lang
  }, [lang])

  return {
    supported,
    listening,
    interim,
    error,
    start,
    stop,
    toggle,
    setError,
  }
}
