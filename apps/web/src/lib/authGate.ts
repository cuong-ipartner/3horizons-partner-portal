/**
 * Explicit login gate for /portal and /admin.
 * Separate from demo session payload (which may exist as defaults).
 */

const GATE_KEY = '3h-portal-authenticated-v1'

export function markPortalAuthenticated() {
  try {
    localStorage.setItem(GATE_KEY, '1')
    window.dispatchEvent(new Event('3h-auth-gate-updated'))
  } catch {
    /* ignore */
  }
}

export function clearPortalAuthenticated() {
  try {
    localStorage.removeItem(GATE_KEY)
    window.dispatchEvent(new Event('3h-auth-gate-updated'))
  } catch {
    /* ignore */
  }
}

export function isPortalAuthenticated(): boolean {
  try {
    return localStorage.getItem(GATE_KEY) === '1'
  } catch {
    return false
  }
}
