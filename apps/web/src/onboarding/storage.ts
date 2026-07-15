import { emptyApplication, type PartnerApplication } from '@/onboarding/types'

const DRAFT_KEY = '3h-partner-onboarding-draft-v1'
const APPS_KEY = '3h-partner-applications-v1'

/** Ensure arrays/strings exist — prevents runtime crash from partial localStorage drafts. */
export function normalizeApplication(raw: Partial<PartnerApplication> | null | undefined): PartnerApplication {
  const base = emptyApplication()
  if (!raw || typeof raw !== 'object') return base

  return {
    ...base,
    ...raw,
    id: typeof raw.id === 'string' && raw.id ? raw.id : base.id,
    email: String(raw.email ?? ''),
    passwordSet: Boolean(raw.passwordSet),
    fullName: String(raw.fullName ?? ''),
    title: String(raw.title ?? ''),
    company: String(raw.company ?? ''),
    industry: String(raw.industry ?? ''),
    expertiseTags: Array.isArray(raw.expertiseTags) ? raw.expertiseTags.map(String) : [],
    ecosystemLayers: Array.isArray(raw.ecosystemLayers) ? raw.ecosystemLayers.map(String) : [],
    servicesOffered: Array.isArray(raw.servicesOffered) ? raw.servicesOffered.map(String) : [],
    caseStudies: String(raw.caseStudies ?? ''),
    testimonials: String(raw.testimonials ?? ''),
    certifications: Array.isArray(raw.certifications) ? raw.certifications.map(String) : [],
    linkedinUrl: String(raw.linkedinUrl ?? ''),
    facebookUrl: String(raw.facebookUrl ?? ''),
    availability:
      raw.availability === 'limited' || raw.availability === 'waitlist' || raw.availability === 'available'
        ? raw.availability
        : 'available',
    preferredLanguage:
      raw.preferredLanguage === 'en' || raw.preferredLanguage === 'bilingual' || raw.preferredLanguage === 'vi'
        ? raw.preferredLanguage
        : 'vi',
    engagementTypes: Array.isArray(raw.engagementTypes) ? raw.engagementTypes.map(String) : [],
    bio: String(raw.bio ?? ''),
    experience: Array.isArray(raw.experience) ? raw.experience.map(String) : [],
    publicSignals: Array.isArray(raw.publicSignals) ? raw.publicSignals.map(String) : [],
    profileImageUrl: String(raw.profileImageUrl ?? ''),
    status: raw.status ?? 'draft',
    enrichment: raw.enrichment ?? null,
    enrichmentReviewed: Boolean(raw.enrichmentReviewed),
    confirmPublish: Boolean(raw.confirmPublish),
    adminNotes: String(raw.adminNotes ?? ''),
    createdAt: String(raw.createdAt ?? base.createdAt),
    updatedAt: String(raw.updatedAt ?? base.updatedAt),
    submittedAt: raw.submittedAt ? String(raw.submittedAt) : undefined,
  }
}

export function loadDraft(): PartnerApplication | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return normalizeApplication(JSON.parse(raw) as Partial<PartnerApplication>)
  } catch {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      /* ignore */
    }
    return null
  }
}

export function saveDraft(app: PartnerApplication) {
  const next = normalizeApplication({ ...app, updatedAt: new Date().toISOString() })
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
  } catch {
    /* quota */
  }
  return next
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* ignore */
  }
}

export function listApplications(): PartnerApplication[] {
  try {
    const raw = localStorage.getItem(APPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => normalizeApplication(item as Partial<PartnerApplication>))
  } catch {
    return []
  }
}

export function submitApplication(app: PartnerApplication) {
  const submitted = normalizeApplication({
    ...app,
    status: 'submitted',
    enrichmentReviewed: true,
    confirmPublish: true,
    passwordSet: true,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  const all = listApplications().filter((a) => a.id !== submitted.id)
  all.unshift(submitted)
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
  clearDraft()
  return submitted
}

export function updateApplicationStatus(
  id: string,
  status: PartnerApplication['status'],
  adminNotes?: string,
) {
  const all = listApplications()
  const idx = all.findIndex((a) => a.id === id)
  if (idx < 0) return null
  all[idx] = normalizeApplication({
    ...all[idx],
    status,
    adminNotes: adminNotes ?? all[idx].adminNotes,
    updatedAt: new Date().toISOString(),
  })
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
  return all[idx]
}
