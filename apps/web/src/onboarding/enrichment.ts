/**
 * Social profile enrichment client.
 *
 * Calls server POST /api/social-enrich (never invents job history in the browser).
 * - With PROXYCURL_API_KEY: real LinkedIn public person fields
 * - Without key: only URL handle + optional public avatar (honest partial)
 */

import type { EnrichedProfileSlice, SocialEnrichmentSource } from '@/onboarding/types'

function detectSource(url: string): SocialEnrichmentSource | null {
  const lower = url.toLowerCase()
  if (lower.includes('linkedin.com')) return 'linkedin'
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook'
  return null
}

function normalizeUrl(url: string) {
  const t = url.trim()
  return t.startsWith('http') ? t : `https://${t}`
}

export async function enrichFromSocialUrl(
  url: string,
  preferred: SocialEnrichmentSource = 'linkedin',
): Promise<EnrichedProfileSlice> {
  const source = detectSource(url) ?? preferred
  const normalized = normalizeUrl(url)

  const res = await fetch('/api/social-enrich', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: normalized, source }),
  })

  const data = (await res.json().catch(() => ({}))) as EnrichedProfileSlice & {
    error?: string
  }

  if (!res.ok) {
    throw new Error(data.error || `Enrichment failed (${res.status})`)
  }

  if (data.error && !data.sourceUrl) {
    throw new Error(data.error)
  }

  return {
    fullName: data.fullName || '',
    title: data.title || '',
    company: data.company || '',
    industry: data.industry || '',
    headline: data.headline || '',
    bio: data.bio || data.headline || '',
    experience: Array.isArray(data.experience) ? data.experience : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    publicSignals: Array.isArray(data.publicSignals) ? data.publicSignals : [],
    profileImageUrl: data.profileImageUrl || '',
    source: data.source || source,
    sourceUrl: data.sourceUrl || normalized,
    enrichedAt: data.enrichedAt || new Date().toISOString(),
    isSimulated: Boolean(data.isSimulated),
    confidence: data.confidence || 'low',
    provider: data.provider,
    warning: data.warning,
  }
}

/** Merge enrichment into form. force=true replaces empty OR fills from LinkedIn import. */
export function applyEnrichmentToForm(
  current: {
    fullName: string
    title: string
    company: string
    industry: string
    bio: string
    certifications: string[]
    experience: string[]
    publicSignals: string[]
    profileImageUrl: string
  },
  en: EnrichedProfileSlice,
  force = false,
) {
  const pick = (cur: string, next?: string) => {
    const n = (next ?? '').trim()
    if (!n) return cur
    if (force || !cur.trim()) return n
    return cur
  }

  const pickList = (cur: string[], next?: string[]) => {
    const n = Array.isArray(next) ? next.filter(Boolean) : []
    if (!n.length) return cur
    if (force || cur.length === 0) return n
    return cur
  }

  return {
    fullName: pick(current.fullName, en.fullName),
    title: pick(current.title, en.title),
    company: pick(current.company, en.company),
    industry: pick(current.industry, en.industry),
    bio: pick(current.bio, en.bio || en.headline),
    certifications: pickList(current.certifications, en.certifications),
    experience: pickList(current.experience, en.experience),
    publicSignals: pickList(current.publicSignals, en.publicSignals),
    profileImageUrl: pick(current.profileImageUrl, en.profileImageUrl),
  }
}
