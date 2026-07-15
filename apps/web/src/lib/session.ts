/**
 * Demo session for partner portal isolation.
 * Production: replace with Supabase Auth + JWT claims (partner_id, role).
 */

const SESSION_KEY = '3h-demo-session-v1'

export type DemoSession = {
  role: 'partner' | 'staff'
  /** Partner slug used for project membership checks */
  partnerId: string
  name: string
  email: string
  initials: string
}

/** Personas for multi-tenant isolation demos */
/** Emails must pass Supabase Auth validation (no @example.com). */
export const DEMO_PARTNER_PERSONAS: DemoSession[] = [
  {
    role: 'partner',
    partnerId: 'cuong-doan',
    name: 'Cuong Doan',
    email: 'cuong.doan@partners.3horizons.vn',
    initials: 'CD',
  },
  {
    role: 'partner',
    partnerId: 'lan-pham',
    name: 'Lan Phạm',
    email: 'lan.pham@partners.3horizons.vn',
    initials: 'LP',
  },
  {
    role: 'partner',
    partnerId: 'erik-sundberg',
    name: 'Erik Sundberg',
    email: 'erik.sundberg@partners.3horizons.vn',
    initials: 'ES',
  },
  {
    role: 'partner',
    partnerId: 'david-tran',
    name: 'David Trần',
    email: 'david.tran@partners.3horizons.vn',
    initials: 'DT',
  },
]

export const DEFAULT_PARTNER_SESSION = DEMO_PARTNER_PERSONAS[0]

export function loadSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<DemoSession>
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

/** Ensures a partner session exists so demo portal always has an identity. */
export function ensurePartnerSession(): DemoSession {
  const existing = loadSession()
  if (existing) return existing
  saveSession(DEFAULT_PARTNER_SESSION)
  return DEFAULT_PARTNER_SESSION
}

export function saveSession(session: DemoSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    window.dispatchEvent(new Event('3h-session-updated'))
  } catch {
    /* ignore quota */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    window.dispatchEvent(new Event('3h-session-updated'))
  } catch {
    /* ignore */
  }
}

export function loginAsPartner(persona: DemoSession) {
  saveSession({ ...persona, role: 'partner' })
}

export function resolvePartnerFromEmail(email: string): DemoSession {
  const normalized = email.trim().toLowerCase()
  const hit = DEMO_PARTNER_PERSONAS.find(
    (p) => p.email.toLowerCase() === normalized || p.partnerId === normalized,
  )
  if (hit) return hit
  // Unknown email → default demo partner (still isolated by membership)
  return {
    ...DEFAULT_PARTNER_SESSION,
    email: normalized || DEFAULT_PARTNER_SESSION.email,
  }
}
