import { useCallback, useEffect, useState } from 'react'
import { logoutAuth, restoreSupabaseSession } from '@/lib/auth'
import {
  ensurePartnerSession,
  loadSession,
  saveSession,
  type DemoSession,
} from '@/lib/session'
import { isSupabaseAuthEnabled } from '@/lib/supabase'

export function useDemoSession() {
  const [session, setSession] = useState<DemoSession>(() =>
    typeof window === 'undefined'
      ? {
          role: 'partner',
          partnerId: 'cuong-doan',
          name: 'Cuong Doan',
          email: 'cuong.doan@partners.3horizons.vn',
          initials: 'CD',
        }
      : ensurePartnerSession(),
  )
  const [ready, setReady] = useState(!isSupabaseAuthEnabled())

  const refresh = useCallback(() => {
    const s = loadSession()
    if (s) setSession(s)
    else setSession(ensurePartnerSession())
  }, [])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (isSupabaseAuthEnabled()) {
        const remote = await restoreSupabaseSession()
        if (!cancelled && remote) setSession(remote)
        else if (!cancelled) refresh()
      } else {
        refresh()
      }
      if (!cancelled) setReady(true)
    }
    void boot()
    const onUpdate = () => {
      const s = loadSession()
      if (s) setSession(s)
      else setSession(ensurePartnerSession())
    }
    window.addEventListener('3h-session-updated', onUpdate)
    window.addEventListener('storage', onUpdate)
    return () => {
      cancelled = true
      window.removeEventListener('3h-session-updated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [refresh])

  return {
    session,
    ready,
    setSession: (s: DemoSession) => {
      saveSession(s)
      setSession(s)
    },
    logout: () => {
      void logoutAuth()
    },
  }
}
