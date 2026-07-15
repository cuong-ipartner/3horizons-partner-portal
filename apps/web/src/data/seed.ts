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

export const partners: Partner[] = [
  {
    id: 'p1',
    slug: 'lan-pham',
    name: 'Lan Phạm',
    title: 'Corporate Strategy Partner',
    headline: 'Helps leadership teams turn ambition into clear strategic choices.',
    expertise: ['Corporate strategy', 'Portfolio choices', 'Leadership alignment'],
    layers: ['corporate-strategy', 'capability-fmft', 'execution-skale'],
    services: ['corporate-strategy', 'capability-building'],
    problems: ['strategy-clarity', 'execution-performance'],
    industry: 'Manufacturing',
    region: 'Vietnam',
    languages: ['vi', 'en'],
    engagementTypes: ['advisory', 'workshop', 'project'],
    verified: true,
    availability: 'available',
    proofPoints: [
      'Led strategy resets for 12+ mid-market groups',
      'Former strategy director, regional conglomerate',
      'Facilitated 40+ executive alignment workshops',
    ],
    caseStudySlugs: ['portfolio-reset-manufacturing'],
    testimonials: [
      {
        quote:
          'Lan helped our board converge on three priorities we could actually fund and measure.',
        author: 'Minh Trần',
        role: 'CEO, industrial group',
      },
    ],
    certifications: ['INSEAD Advanced Strategy', '3HORIZONS Verified Partner'],
    bio: 'Lan works with founders and executive teams who need strategic clarity without a 100-page deck that gathers dust. Her approach is choice-led, board-ready, and tightly linked to execution.',
    initials: 'LP',
  },
  {
    id: 'p2',
    slug: 'james-okonkwo',
    name: 'James Okonkwo',
    title: 'Board & Governance Advisor',
    headline: 'Strengthens board cadence, decision rights, and oversight discipline.',
    expertise: ['Board effectiveness', 'Decision rights', 'Risk oversight'],
    layers: ['corporate-governance', 'corporate-strategy', 'family-governance'],
    services: ['governance', 'corporate-strategy'],
    problems: ['governance-board', 'family-governance'],
    industry: 'Financial services',
    region: 'APAC',
    languages: ['en'],
    engagementTypes: ['advisory', 'board-role', 'project'],
    verified: true,
    availability: 'limited',
    proofPoints: [
      'Supported 8 board effectiveness reviews',
      'Ex-bank CRO advisory experience',
      'Designed governance for pre-IPO groups',
    ],
    caseStudySlugs: ['board-reset-financial'],
    testimonials: [
      {
        quote: 'We finally have a board calendar and decision rights the whole team trusts.',
        author: 'H. Nguyen',
        role: 'Chair, financial services',
      },
    ],
    certifications: ['ICD.D', '3HORIZONS Verified Partner'],
    bio: 'James helps boards become useful: clear mandates, healthy challenge, and governance that protects value without slowing the business into paralysis.',
    initials: 'JO',
  },
  {
    id: 'p3',
    slug: 'mai-hoang',
    name: 'Mai Hoàng',
    title: 'Capability & FMFT Coach',
    headline: 'Builds leadership systems and capabilities that make strategy executable.',
    expertise: ['FMFT', 'Leadership bench', 'Org capability'],
    layers: ['capability-fmft', 'corporate-strategy', 'execution-skale'],
    services: ['capability-building', 'performance-execution'],
    problems: ['capability-fmft', 'strategy-clarity'],
    industry: 'Consumer',
    region: 'Vietnam',
    languages: ['vi', 'en'],
    engagementTypes: ['workshop', 'retain', 'project'],
    verified: true,
    availability: 'available',
    proofPoints: [
      'Designed FMFT programs for 5 enterprise groups',
      '15 years OD & leadership development',
      'Linked capability plans to strategy KPIs',
    ],
    caseStudySlugs: ['capability-sprint-consumer'],
    testimonials: [
      {
        quote: 'Our managers stopped firefighting and started owning strategic routines.',
        author: 'Q. Lê',
        role: 'CHRO, consumer brand',
      },
    ],
    certifications: ['ICF PCC', '3HORIZONS Verified Partner'],
    bio: 'Mai connects strategy to people systems. She designs capability journeys that leadership can sustain—not one-off training events.',
    initials: 'MH',
  },
  {
    id: 'p4',
    slug: 'erik-sundberg',
    name: 'Erik Sundberg',
    title: 'Execution / SKALE Lead',
    headline: 'Installs performance rhythm so strategy becomes weekly discipline.',
    expertise: ['SKALE', 'KPI ownership', 'Operating cadence'],
    layers: ['execution-skale', 'corporate-strategy', 'capability-fmft'],
    services: ['performance-execution', 'corporate-strategy'],
    problems: ['execution-performance', 'strategy-clarity'],
    industry: 'Technology',
    region: 'Europe',
    languages: ['en'],
    engagementTypes: ['project', 'retain', 'advisory'],
    verified: true,
    availability: 'available',
    proofPoints: [
      'Scaled execution systems across multi-country BUs',
      'Recovered delayed transformation portfolios',
      'Former COO, digital services group',
    ],
    caseStudySlugs: ['execution-recovery-tech'],
    testimonials: [
      {
        quote: 'We now know who owns what by Monday morning—and it shows in the numbers.',
        author: 'A. Berg',
        role: 'COO, tech services',
      },
    ],
    certifications: ['PMP', '3HORIZONS Verified Partner'],
    bio: 'Erik is allergic to strategy theater. He builds SKALE-style operating systems: owners, measures, cadence, and honest recovery when delivery slips.',
    initials: 'ES',
  },
  {
    id: 'p5',
    slug: 'sofia-nguyen',
    name: 'Sofia Nguyễn',
    title: 'AI Strategy & Governance Partner',
    headline: 'Connects AI ambition to value cases, controls, and board-ready governance.',
    expertise: ['AI strategy', 'ISAGC', 'AI risk & controls'],
    layers: ['ai-strategy-isagc', 'corporate-strategy', 'corporate-governance'],
    services: ['ai-strategy', 'governance'],
    problems: ['ai-strategy-governance', 'strategy-clarity'],
    industry: 'Healthcare',
    region: 'ASEAN',
    languages: ['en', 'vi'],
    engagementTypes: ['advisory', 'project', 'workshop'],
    verified: true,
    availability: 'limited',
    proofPoints: [
      'Built AI portfolios for regulated industries',
      'Designed ISAGC-aligned governance models',
      'Ex-digital transformation lead, healthcare group',
    ],
    caseStudySlugs: ['ai-governance-healthcare'],
    testimonials: [
      {
        quote: 'Sofia stopped our pilot sprawl and gave the board a value and risk language.',
        author: 'Dr. K. Pham',
        role: 'CDO, healthcare network',
      },
    ],
    certifications: ['AI Governance Professional', '3HORIZONS Verified Partner'],
    bio: 'Sofia helps enterprises treat AI as strategy, not experimentation chaos—with clear value cases and governance the board can own.',
    initials: 'SN',
  },
  {
    id: 'p6',
    slug: 'david-tran',
    name: 'David Trần',
    title: 'Succession & Family Governance Advisor',
    headline: 'De-risks leadership and ownership transitions for family enterprises.',
    expertise: ['Succession', 'Family governance', 'Ownership protocols'],
    layers: ['business-succession', 'family-governance', 'corporate-governance'],
    services: ['succession-advisory', 'family-governance', 'governance'],
    problems: ['succession', 'family-governance'],
    industry: 'Family enterprise',
    region: 'Vietnam',
    languages: ['vi', 'en'],
    engagementTypes: ['advisory', 'project', 'workshop'],
    verified: true,
    availability: 'waitlist',
    proofPoints: [
      'Guided 20+ succession roadmaps',
      'Designed family councils for multi-branch owners',
      '20 years family enterprise advisory',
    ],
    caseStudySlugs: ['succession-family-group'],
    testimonials: [
      {
        quote: 'We moved from silence and anxiety to a shared succession plan F2 could trust.',
        author: 'Anonymous',
        role: 'Founder, multi-business group',
      },
    ],
    certifications: ['FFI Advanced Certificate', '3HORIZONS Verified Partner'],
    bio: 'David works at the intersection of family, ownership, and enterprise—creating transition paths that protect both the business and relationships.',
    initials: 'DT',
  },
]

export const insights: Insight[] = [
  {
    slug: 'portfolio-reset-manufacturing',
    title: 'Portfolio reset for a multi-BU manufacturing group',
    summary:
      'Leadership aligned on three funded priorities and retired initiatives that diluted focus.',
    industry: 'Manufacturing',
    problemSlug: 'strategy-clarity',
    layerSlugs: ['corporate-strategy', 'execution-skale'],
    partnerSlugs: ['lan-pham'],
    outcome: 'Strategic focus reduced active initiatives by 40%; quarterly review cadence installed.',
  },
  {
    slug: 'board-reset-financial',
    title: 'Board effectiveness reset in financial services',
    summary: 'Decision rights and board calendar redesigned ahead of growth financing.',
    industry: 'Financial services',
    problemSlug: 'governance-board',
    layerSlugs: ['corporate-governance'],
    partnerSlugs: ['james-okonkwo'],
    outcome: 'Board packs shortened; risk committee mandate clarified within 90 days.',
  },
  {
    slug: 'capability-sprint-consumer',
    title: 'Capability sprint for a consumer brand scaling regionally',
    summary: 'FMFT-linked leadership routines closed the strategy–people gap.',
    industry: 'Consumer',
    problemSlug: 'capability-fmft',
    layerSlugs: ['capability-fmft'],
    partnerSlugs: ['mai-hoang'],
    outcome: 'Manager operating system adopted across 6 markets.',
  },
  {
    slug: 'execution-recovery-tech',
    title: 'Execution recovery for a delayed digital portfolio',
    summary: 'SKALE cadence restored ownership and recovery plans for stuck initiatives.',
    industry: 'Technology',
    problemSlug: 'execution-performance',
    layerSlugs: ['execution-skale'],
    partnerSlugs: ['erik-sundberg'],
    outcome: 'On-time delivery improved from 48% to 81% in two quarters.',
  },
  {
    slug: 'ai-governance-healthcare',
    title: 'AI strategy and governance for a healthcare network',
    summary: 'ISAGC model linked use-cases to value, risk, and board oversight.',
    industry: 'Healthcare',
    problemSlug: 'ai-strategy-governance',
    layerSlugs: ['ai-strategy-isagc', 'corporate-governance'],
    partnerSlugs: ['sofia-nguyen'],
    outcome: 'Board-approved AI portfolio with staged controls; pilot sprawl reduced.',
  },
  {
    slug: 'succession-family-group',
    title: 'Succession roadmap for a multi-generation family group',
    summary: 'Ownership protocols and successor readiness plan reduced key-man risk.',
    industry: 'Family enterprise',
    problemSlug: 'succession',
    layerSlugs: ['business-succession', 'family-governance'],
    partnerSlugs: ['david-tran'],
    outcome: 'Shared 5-year transition plan with family council cadence.',
  },
]

export const matchRequests: MatchRequest[] = [
  {
    id: 'req-1042',
    title: 'Sẵn sàng kế thừa cho tập đoàn founder',
    problemSlug: 'succession',
    layerSlug: 'business-succession',
    serviceSlug: 'succession-advisory',
    preferredPartner: 'david-tran',
    status: 'in_review',
    owner: 'Bạn',
    nextAction: '3HORIZONS đang rà soát brief — phản hồi trong 2 ngày làm việc',
    updatedAt: '2026-07-12',
    timeline: [
      { date: '2026-07-10', label: 'Đã gửi yêu cầu' },
      { date: '2026-07-11', label: 'Giao bàn matching' },
      { date: '2026-07-12', label: 'Đang đánh giá độ phù hợp đối tác' },
    ],
  },
  {
    id: 'req-1038',
    title: 'Khung chiến lược & quản trị AI',
    problemSlug: 'ai-strategy-governance',
    layerSlug: 'ai-strategy-isagc',
    serviceSlug: 'ai-strategy',
    status: 'needs_info',
    owner: 'Bạn',
    nextAction: 'Bổ sung ràng buộc ngành có kiểm soát và danh sách pilot AI hiện tại',
    updatedAt: '2026-07-09',
    timeline: [
      { date: '2026-07-05', label: 'Đã gửi yêu cầu' },
      { date: '2026-07-08', label: 'Bắt đầu rà soát' },
      { date: '2026-07-09', label: 'Yêu cầu bổ sung thông tin' },
    ],
  },
  {
    id: 'req-1021',
    title: 'Chuỗi workshop làm rõ chiến lược',
    problemSlug: 'strategy-clarity',
    layerSlug: 'corporate-strategy',
    serviceSlug: 'corporate-strategy',
    preferredPartner: 'lan-pham',
    status: 'collaboration_active',
    owner: 'Bạn',
    nextAction: 'Mở workspace collaboration — tài liệu kickoff đã sẵn',
    updatedAt: '2026-07-01',
    timeline: [
      { date: '2026-06-20', label: 'Đã gửi yêu cầu' },
      { date: '2026-06-24', label: 'Đã ghép đối tác' },
      { date: '2026-06-28', label: 'Đã mở collaboration' },
    ],
  },
  {
    id: 'req-1010',
    title: 'Rà soát hiệu quả HĐQT',
    problemSlug: 'governance-board',
    layerSlug: 'corporate-governance',
    serviceSlug: 'governance',
    status: 'closed',
    owner: 'Bạn',
    nextAction: 'Đã lưu trữ — engagement hoàn tất',
    updatedAt: '2026-05-18',
    timeline: [
      { date: '2026-04-02', label: 'Đã gửi yêu cầu' },
      { date: '2026-04-10', label: 'Đã ghép' },
      { date: '2026-05-18', label: 'Đã đóng' },
    ],
  },
]

export const collaborations: Collaboration[] = [
  {
    id: 'col-221',
    title: 'Chuỗi workshop làm rõ chiến lược',
    requestId: 'req-1021',
    status: 'active',
    owner: 'Bạn · Facilitator 3HORIZONS',
    partners: ['lan-pham'],
    nextAction: 'Xác nhận agenda workshop tuần 21/07',
    updatedAt: '2026-07-13',
    milestones: [
      { label: 'Cuộc gọi discovery', done: true },
      { label: 'Phỏng vấn lãnh đạo', done: true },
      { label: 'Workshop 1 — lựa chọn', done: false },
      { label: 'Bản chiến lược 1 trang', done: false },
    ],
  },
  {
    id: 'col-198',
    title: 'Phục hồi thực thi — danh mục số',
    requestId: 'req-0990',
    status: 'paused',
    owner: 'Bạn · Facilitator 3HORIZONS',
    partners: ['erik-sundberg'],
    nextAction: 'Tiếp tục sau rà soát ngân sách Q3',
    updatedAt: '2026-06-30',
    milestones: [
      { label: 'Chẩn đoán baseline', done: true },
      { label: 'Thiết kế nhịp vận hành', done: true },
      { label: 'Bản đồ sở hữu KPI', done: false },
      { label: 'Pilot war-room', done: false },
    ],
  },
]

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
