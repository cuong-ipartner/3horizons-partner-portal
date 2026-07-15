/**
 * Client session snapshot after real Supabase Auth login.
 * Never auto-creates demo identities.
 */

const SESSION_KEY = '3h-portal-session-v1'
const LEGACY_SESSION_KEY = '3h-demo-session-v1'

export type PortalSession = {
  role: 'partner' | 'staff'
  /** Partner slug used for project membership checks */
  partnerId: string
  name: string
  email: string
  initials: string
}

/** @deprecated Use PortalSession — kept for import compatibility */
export type DemoSession = PortalSession

export function loadSession(): PortalSession | null {
  try {
    const raw =
      localStorage.getItem(SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PortalSession>
    if (!parsed.partnerId || !parsed.name) return null
    return {
      role: parsed.role === 'staff' ? 'staff' : 'partner',
      partnerId: String(parsed.partnerId),
      name: String(parsed.name),
      email: String(parsed.email ?? ''),
      initials: String(parsed.initials ?? parsed.name.slice(0, 2).toUpperCase()),
    }
  } catch {
    return null
  }
}

export function saveSession(session: PortalSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    localStorage.removeItem(LEGACY_SESSION_KEY)
    window.dispatchEvent(new Event('3h-session-updated'))
  } catch {
    /* ignore quota */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(LEGACY_SESSION_KEY)
    window.dispatchEvent(new Event('3h-session-updated'))
  } catch {
    /* ignore */
  }
}

/** No demo personas in production */
export const DEMO_PARTNER_PERSONAS: PortalSession[] = []
