export type PartnerOnboardingStatus =
  | 'draft'
  | 'submitted'
  | 'verified'
  | 'published'
  | 'suspended'
  | 'rejected'

export type SocialEnrichmentSource = 'linkedin' | 'facebook' | 'manual'

export type EnrichedProfileSlice = {
  fullName?: string
  title?: string
  company?: string
  industry?: string
  headline?: string
  bio?: string
  experience?: string[]
  certifications?: string[]
  publicSignals?: string[]
  profileImageUrl?: string
  source: SocialEnrichmentSource
  sourceUrl: string
  enrichedAt: string
  /** true = partial / no paid enrichment API */
  isSimulated: boolean
  confidence: 'high' | 'medium' | 'low'
  provider?: string
  warning?: string
}

export type PartnerApplication = {
  id: string
  email: string
  passwordSet: boolean
  fullName: string
  title: string
  company: string
  industry: string
  expertiseTags: string[]
  ecosystemLayers: string[]
  servicesOffered: string[]
  caseStudies: string
  testimonials: string
  certifications: string[]
  linkedinUrl: string
  facebookUrl: string
  availability: 'available' | 'limited' | 'waitlist'
  preferredLanguage: 'vi' | 'en' | 'bilingual'
  engagementTypes: string[]
  bio: string
  experience: string[]
  publicSignals: string[]
  profileImageUrl: string
  status: PartnerOnboardingStatus
  enrichment?: EnrichedProfileSlice | null
  enrichmentReviewed: boolean
  confirmPublish: boolean
  adminNotes: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
}

export const emptyApplication = (): PartnerApplication => ({
  id: `app-${Date.now()}`,
  email: '',
  passwordSet: false,
  fullName: '',
  title: '',
  company: '',
  industry: '',
  expertiseTags: [],
  ecosystemLayers: [],
  servicesOffered: [],
  caseStudies: '',
  testimonials: '',
  certifications: [],
  linkedinUrl: '',
  facebookUrl: '',
  availability: 'available',
  preferredLanguage: 'vi',
  engagementTypes: [],
  bio: '',
  experience: [],
  publicSignals: [],
  profileImageUrl: '',
  status: 'draft',
  enrichment: null,
  enrichmentReviewed: false,
  confirmPublish: false,
  adminNotes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const INDUSTRY_OPTIONS = [
  'Manufacturing',
  'Financial services',
  'Consumer',
  'Technology',
  'Healthcare',
  'Family enterprise',
  'Professional services',
  'Real estate',
  'Energy',
  'Other',
]

export const EXPERTISE_OPTIONS = [
  'Corporate strategy',
  'Board effectiveness',
  'Governance',
  'FMFT / Capability',
  'Execution / SKALE',
  'AI strategy',
  'AI governance',
  'Succession',
  'Family governance',
  'Leadership coaching',
  'Transformation',
  'Risk oversight',
]

export const ENGAGEMENT_OPTIONS = [
  'advisory',
  'project',
  'workshop',
  'retain',
  'board-role',
]

export const LAYER_OPTIONS = [
  { code: 'T1', slug: 'corporate-strategy', label: 'T1 Corporate Strategy' },
  { code: 'T2', slug: 'corporate-governance', label: 'T2 Corporate Governance' },
  { code: 'T3', slug: 'capability-fmft', label: 'T3 Capability / FMFT' },
  { code: 'T4', slug: 'execution-skale', label: 'T4 Execution / SKALE' },
  { code: 'T5', slug: 'ai-strategy-isagc', label: 'T5 AI Strategy / ISAGC' },
  { code: 'T6', slug: 'business-succession', label: 'T6 Business Succession' },
  { code: 'T7', slug: 'family-governance', label: 'T7 Family Governance' },
]

export const SERVICE_OPTIONS = [
  { slug: 'corporate-strategy', label: 'Corporate Strategy Services' },
  { slug: 'governance', label: 'Governance Services' },
  { slug: 'capability-building', label: 'Capability Building Services' },
  { slug: 'performance-execution', label: 'Performance Execution Services' },
  { slug: 'ai-strategy', label: 'AI Strategy Services' },
  { slug: 'succession-advisory', label: 'Succession Advisory Services' },
  { slug: 'family-governance', label: 'Family Governance Services' },
]
