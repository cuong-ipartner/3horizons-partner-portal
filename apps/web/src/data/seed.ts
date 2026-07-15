export type Layer = {
  code: string
  name: string
  slug: string
  short: string
  mandate: string
  solves: string[]
  deliverables: string[]
  partnerTypes: string[]
  serviceSlugs: string[]
}

export type Problem = {
  name: string
  slug: string
  pain: string
  icon: 'compass' | 'landmark' | 'layers' | 'gauge' | 'sparkles' | 'git-branch' | 'users'
  primaryLayer: string
  secondaryLayers: string[]
  serviceSlugs: string[]
}

export type ServiceLine = {
  name: string
  slug: string
  solves: string
  layers: string[]
  partnerNeeded: string
  deliverables: string[]
}

export type Partner = {
  id: string
  slug: string
  name: string
  title: string
  headline: string
  expertise: string[]
  layers: string[]
  services: string[]
  problems: string[]
  industry: string
  region: string
  languages: string[]
  engagementTypes: string[]
  verified: boolean
  availability: 'available' | 'limited' | 'waitlist'
  proofPoints: string[]
  caseStudySlugs: string[]
  testimonials: { quote: string; author: string; role: string }[]
  certifications: string[]
  bio: string
  initials: string
}

export type Insight = {
  slug: string
  title: string
  summary: string
  industry: string
  problemSlug: string
  layerSlugs: string[]
  partnerSlugs: string[]
  outcome: string
}

export type MatchRequest = {
  id: string
  title: string
  problemSlug: string
  layerSlug: string
  serviceSlug: string
  preferredPartner?: string
  status: 'draft' | 'submitted' | 'in_review' | 'needs_info' | 'matched' | 'collaboration_active' | 'closed'
  owner: string
  nextAction: string
  updatedAt: string
  timeline: { date: string; label: string }[]
}

export type Collaboration = {
  id: string
  title: string
  requestId: string
  status: 'active' | 'paused' | 'completed'
  owner: string
  partners: string[]
  nextAction: string
  updatedAt: string
  milestones: { label: string; done: boolean }[]
}

export const layers: Layer[] = [
  {
    code: 'T1',
    name: 'Corporate Strategy',
    slug: 'corporate-strategy',
    short: 'Strategy',
    mandate: 'Clarify direction, choices, and strategic priorities for the enterprise.',
    solves: [
      'Unclear corporate direction and competing priorities',
      'Strategy that does not translate into choices',
      'Misalignment on where to play and how to win',
    ],
    deliverables: [
      'Strategic choices & priority portfolio',
      'Leadership alignment workshops',
      'Strategy cascade roadmap',
      'One-page strategy narrative',
    ],
    partnerTypes: ['Corporate strategist', 'Transformation advisor', 'Industry strategy specialist'],
    serviceSlugs: ['corporate-strategy', 'capability-building', 'performance-execution'],
  },
  {
    code: 'T2',
    name: 'Corporate Governance',
    slug: 'corporate-governance',
    short: 'Governance',
    mandate: 'Strengthen board effectiveness, oversight, and decision rights.',
    solves: [
      'Weak board cadence and unclear decision rights',
      'Governance risk and compliance blind spots',
      'Founder–board tension',
    ],
    deliverables: [
      'Board effectiveness review',
      'Decision-rights matrix',
      'Governance calendar & charter updates',
      'Risk oversight design',
    ],
    partnerTypes: ['Board advisor', 'Governance specialist', 'Independent director coach'],
    serviceSlugs: ['governance', 'corporate-strategy', 'family-governance'],
  },
  {
    code: 'T3',
    name: 'Capability / FMFT',
    slug: 'capability-fmft',
    short: 'Capability',
    mandate: 'Build the organizational capabilities required to execute strategy (FMFT).',
    solves: [
      'Capability gaps blocking strategy',
      'Leadership bench weakness',
      'Skills and routines not matching ambition',
    ],
    deliverables: [
      'Capability assessment',
      'FMFT development programs',
      'Leadership bench plans',
      'Operating routines design',
    ],
    partnerTypes: ['Capability builder', 'Leadership / FMFT coach', 'Org design advisor'],
    serviceSlugs: ['capability-building', 'corporate-strategy', 'performance-execution'],
  },
  {
    code: 'T4',
    name: 'Execution / SKALE',
    slug: 'execution-skale',
    short: 'Execution',
    mandate: 'Drive performance discipline and scalable execution (SKALE).',
    solves: [
      'Strategy–execution gap',
      'Weak operating rhythm and KPI ownership',
      'Performance stalls and delivery failure',
    ],
    deliverables: [
      'SKALE / execution system design',
      'KPI ownership model',
      'Performance war-room cadence',
      'Delivery recovery plans',
    ],
    partnerTypes: ['Execution / PMO lead', 'Performance coach', 'Operating model specialist'],
    serviceSlugs: ['performance-execution', 'corporate-strategy', 'capability-building'],
  },
  {
    code: 'T5',
    name: 'AI Strategy / ISAGC',
    slug: 'ai-strategy-isagc',
    short: 'AI Strategy',
    mandate: 'Define AI strategy and governance (ISAGC) aligned to enterprise value.',
    solves: [
      'AI pilots without strategy',
      'Missing AI governance and risk controls',
      'Unclear value cases for AI',
    ],
    deliverables: [
      'AI strategy & value roadmap',
      'ISAGC governance model',
      'Use-case portfolio prioritization',
      'Risk & control framework',
    ],
    partnerTypes: ['AI strategy advisor', 'AI governance specialist', 'Digital transformation lead'],
    serviceSlugs: ['ai-strategy', 'corporate-strategy', 'governance'],
  },
  {
    code: 'T6',
    name: 'Business Succession',
    slug: 'business-succession',
    short: 'Succession',
    mandate: 'Design and de-risk leadership and ownership succession.',
    solves: [
      'Unclear succession for key roles or ownership',
      'Continuity risk for founder businesses',
      'Handover without readiness',
    ],
    deliverables: [
      'Succession readiness assessment',
      'Role & ownership transition plan',
      'Successor development roadmap',
      'Continuity risk controls',
    ],
    partnerTypes: ['Succession advisor', 'Family business consultant', 'Leadership transition coach'],
    serviceSlugs: ['succession-advisory', 'governance', 'family-governance'],
  },
  {
    code: 'T7',
    name: 'Family Governance',
    slug: 'family-governance',
    short: 'Family Governance',
    mandate: 'Align family owners on purpose, rights, and multi-generation governance.',
    solves: [
      'Family conflict over ownership and roles',
      'Missing family constitution or forums',
      'Blurred family vs business decisions',
    ],
    deliverables: [
      'Family constitution / charter',
      'Family council design',
      'Ownership protocols',
      'Conflict facilitation frameworks',
    ],
    partnerTypes: ['Family governance advisor', 'Family office consultant', 'Facilitation specialist'],
    serviceSlugs: ['family-governance', 'governance', 'succession-advisory'],
  },
]

export const problems: Problem[] = [
  {
    name: 'Strategy clarity',
    slug: 'strategy-clarity',
    pain: 'Leadership is not aligned on direction, priorities, or strategic choices.',
    icon: 'compass',
    primaryLayer: 'corporate-strategy',
    secondaryLayers: ['capability-fmft', 'execution-skale'],
    serviceSlugs: ['corporate-strategy', 'capability-building', 'performance-execution'],
  },
  {
    name: 'Governance / board',
    slug: 'governance-board',
    pain: 'Board and decision rights are unclear, weak, or not trusted.',
    icon: 'landmark',
    primaryLayer: 'corporate-governance',
    secondaryLayers: ['corporate-strategy', 'family-governance'],
    serviceSlugs: ['governance', 'corporate-strategy', 'family-governance'],
  },
  {
    name: 'Capability / FMFT',
    slug: 'capability-fmft',
    pain: 'The organization lacks the capabilities and leadership system to deliver strategy.',
    icon: 'layers',
    primaryLayer: 'capability-fmft',
    secondaryLayers: ['corporate-strategy', 'execution-skale'],
    serviceSlugs: ['capability-building', 'corporate-strategy', 'performance-execution'],
  },
  {
    name: 'Execution / performance',
    slug: 'execution-performance',
    pain: 'Plans exist but performance, rhythm, and delivery do not scale.',
    icon: 'gauge',
    primaryLayer: 'execution-skale',
    secondaryLayers: ['corporate-strategy', 'capability-fmft'],
    serviceSlugs: ['performance-execution', 'corporate-strategy', 'capability-building'],
  },
  {
    name: 'AI strategy / governance',
    slug: 'ai-strategy-governance',
    pain: 'AI initiatives lack strategy, governance, and enterprise value framing.',
    icon: 'sparkles',
    primaryLayer: 'ai-strategy-isagc',
    secondaryLayers: ['corporate-strategy', 'corporate-governance'],
    serviceSlugs: ['ai-strategy', 'corporate-strategy', 'governance'],
  },
  {
    name: 'Succession',
    slug: 'succession',
    pain: 'Leadership or ownership transition is undefined or high-risk.',
    icon: 'git-branch',
    primaryLayer: 'business-succession',
    secondaryLayers: ['corporate-governance', 'family-governance'],
    serviceSlugs: ['succession-advisory', 'governance', 'family-governance'],
  },
  {
    name: 'Family governance',
    slug: 'family-governance',
    pain: 'Family owners need shared rules, forums, and decision discipline.',
    icon: 'users',
    primaryLayer: 'family-governance',
    secondaryLayers: ['corporate-governance', 'business-succession'],
    serviceSlugs: ['family-governance', 'governance', 'succession-advisory'],
  },
]

export const serviceLines: ServiceLine[] = [
  {
    name: 'Corporate Strategy Services',
    slug: 'corporate-strategy',
    solves: 'Strategy clarity and enterprise direction',
    layers: ['corporate-strategy', 'capability-fmft', 'execution-skale'],
    partnerNeeded: 'Corporate strategists and transformation advisors',
    deliverables: [
      'Strategic choices & priority portfolio',
      'Growth / portfolio options',
      'Leadership alignment workshops',
      'Strategy cascade roadmap',
    ],
  },
  {
    name: 'Governance Services',
    slug: 'governance',
    solves: 'Board effectiveness and decision rights',
    layers: ['corporate-governance', 'corporate-strategy', 'family-governance'],
    partnerNeeded: 'Board and governance specialists',
    deliverables: [
      'Board effectiveness review',
      'Decision-rights matrix',
      'Governance calendar & charter updates',
      'Risk oversight design',
    ],
  },
  {
    name: 'Capability Building Services',
    slug: 'capability-building',
    solves: 'FMFT and organizational capability gaps',
    layers: ['capability-fmft', 'corporate-strategy', 'execution-skale'],
    partnerNeeded: 'Capability builders and leadership coaches',
    deliverables: [
      'Capability assessment',
      'FMFT development programs',
      'Leadership bench plans',
      'Operating routines design',
    ],
  },
  {
    name: 'Performance Execution Services',
    slug: 'performance-execution',
    solves: 'Execution discipline and scalable performance',
    layers: ['execution-skale', 'corporate-strategy', 'capability-fmft'],
    partnerNeeded: 'Execution leads and performance specialists',
    deliverables: [
      'SKALE / execution system design',
      'KPI ownership model',
      'Performance war-room cadence',
      'Delivery recovery plans',
    ],
  },
  {
    name: 'AI Strategy Services',
    slug: 'ai-strategy',
    solves: 'AI strategy and AI governance alignment',
    layers: ['ai-strategy-isagc', 'corporate-strategy', 'corporate-governance'],
    partnerNeeded: 'AI strategy and governance advisors',
    deliverables: [
      'AI strategy & value roadmap',
      'ISAGC governance model',
      'Use-case portfolio prioritization',
      'Risk & control framework',
    ],
  },
  {
    name: 'Succession Advisory Services',
    slug: 'succession-advisory',
    solves: 'Leadership and ownership succession risk',
    layers: ['business-succession', 'corporate-governance', 'family-governance'],
    partnerNeeded: 'Succession and transition advisors',
    deliverables: [
      'Succession readiness assessment',
      'Role & ownership transition plan',
      'Successor development roadmap',
      'Continuity risk controls',
    ],
  },
  {
    name: 'Family Governance Services',
    slug: 'family-governance',
    solves: 'Family alignment and multi-generation governance',
    layers: ['family-governance', 'corporate-governance', 'business-succession'],
    partnerNeeded: 'Family governance and family-office advisors',
    deliverables: [
      'Family constitution / charter',
      'Family council design',
      'Ownership protocols',
      'Conflict facilitation frameworks',
    ],
  },
]

export const partners: Partner[] = []

export const insights: Insight[] = []

export const matchRequests: MatchRequest[] = []

export const collaborations: Collaboration[] = []

export function getLayer(slug: string) {
  return layers.find((l) => l.slug === slug)
}

export function getProblem(slug: string) {
  return problems.find((p) => p.slug === slug)
}

export function getService(slug: string) {
  return serviceLines.find((s) => s.slug === slug)
}

export function getPartner(slug: string) {
  return partners.find((p) => p.slug === slug)
}

export function getInsight(slug: string) {
  return insights.find((i) => i.slug === slug)
}

export function partnersForLayer(layerSlug: string) {
  return partners.filter((p) => p.layers.includes(layerSlug))
}

export function partnersForProblem(problemSlug: string) {
  return partners.filter((p) => p.problems.includes(problemSlug))
}

export function partnersForService(serviceSlug: string) {
  return partners.filter((p) => p.services.includes(serviceSlug))
}

export const statusLabels: Record<MatchRequest['status'], string> = {
  draft: 'Nháp',
  submitted: 'Đã gửi',
  in_review: 'Đang rà soát',
  needs_info: 'Cần bổ sung',
  matched: 'Đã ghép',
  collaboration_active: 'Đang collaboration',
  closed: 'Đã đóng',
}
