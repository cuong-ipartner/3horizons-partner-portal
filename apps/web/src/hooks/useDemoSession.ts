/**
 * Portal session hook — restores Supabase Auth session only.
 * Does not invent demo users.
 */

import { useCallback, useEffect, useState } from 'react'
import { restoreSupabaseSession } from '@/lib/auth'
import { loadSession, saveSession, type PortalSession } from '@/lib/session'
import { clearPortalAuthenticated, isPortalAuthenticated } from '@/lib/authGate'
import { logoutProduction } from '@/lib/production-auth'
import { isSupabaseAuthEnabled } from '@/lib/supabase'

export type AppSession = PortalSession

export function useDemoSession() {
  const [session, setSession] = useState<PortalSession | null>(() =>
    typeof window === 'undefined' ? null : loadSession(),
  )
  const [ready, setReady] = useState(false)

  const refresh = useCallback(() => {
    setSession(loadSession())
  }, [])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (isSupabaseAuthEnabled()) {
        const remote = await restoreSupabaseSession()
        if (!cancelled) {
          if (remote) setSession(remote)
          else {
            // Stale local session without live Auth
            const local = loadSession()
            if (local && !isPortalAuthenticated()) {
              setSession(null)
            } else if (local && isPortalAuthenticated()) {
              setSession(local)
            } else {
              setSession(null)
            }
          }
        }
      } else {
        if (!cancelled) setSession(loadSession())
      }
      if (!cancelled) setReady(true)
    }
    void boot()
    const onUpdate = () => {
      setSession(loadSession())
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
    session: session ?? {
      role: 'partner' as const,
      partnerId: '',
      name: '',
      email: '',
      initials: '',
    },
    sessionOrNull: session,
    ready,
    setSession: (s: PortalSession) => {
      saveSession(s)
      setSession(s)
    },
    logout: () => {
      void logoutProduction()
      clearPortalAuthenticated()
      setSession(null)
    },
  }
}
