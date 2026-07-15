/** Seed data for 3HORIZONS Admin Management Portal (demo). */

export type AdminRole =
  | 'super_admin'
  | 'partner_manager'
  | 'content_editor'
  | 'reviewer_matcher'
  | 'project_operator'
  | 'support'
  | 'finance'

export const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  partner_manager: 'Partner Manager',
  content_editor: 'Content Editor',
  reviewer_matcher: 'Reviewer / Matcher',
  project_operator: 'Project Operator',
  support: 'Support',
  finance: 'Finance / Billing',
}

export const rolePermissions: Record<AdminRole, string[]> = {
  super_admin: ['*'],
  partner_manager: [
    'partners.read',
    'partners.approve',
    'partners.edit',
    'users.read',
    'matches.read',
    'matches.assign',
  ],
  content_editor: ['content.read', 'content.edit', 'content.publish'],
  reviewer_matcher: ['partners.read', 'partners.approve', 'matches.read', 'matches.assign'],
  project_operator: ['projects.read', 'projects.edit', 'matches.read'],
  support: ['users.read', 'users.reset_password', 'audit.read'],
  finance: ['billing.read', 'users.read'],
}

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
  status: 'active' | 'suspended' | 'invited'
  lastLogin: string
  createdAt: string
}

export type AdminPartnerRecord = {
  id: string
  name: string
  title: string
  email: string
  status: 'draft' | 'submitted' | 'verified' | 'published' | 'suspended'
  layers: string[]
  services: string[]
  linkedin?: string
  facebook?: string
  enrichmentNotes?: string
  internalNotes: string
  proofPoints: string[]
  submittedAt: string
  region: string
}

export type AdminMatchItem = {
  id: string
  title: string
  company: string
  problem: string
  status: 'queue' | 'ai_suggested' | 'human_review' | 'assigned' | 'in_project' | 'closed'
  aiSuggestions: { partner: string; score: number; reason: string }[]
  assignedPartner?: string
  owner: string
  updatedAt: string
  priority: 'standard' | 'priority' | 'urgent'
}

export type AdminProject = {
  id: string
  title: string
  status: 'active' | 'paused' | 'archived'
  owners: string[]
  partners: string[]
  dueDate: string
  milestones: { label: string; done: boolean; due?: string }[]
  files: number
  updates: number
}

export type AuditLog = {
  id: string
  at: string
  actor: string
  action: string
  target: string
  category: 'login' | 'approval' | 'edit' | 'permission' | 'security'
}

export type ContentItem = {
  id: string
  type: 'homepage' | 'ecosystem' | 'service' | 'case' | 'training' | 'document' | 'featured'
  title: string
  status: 'draft' | 'published' | 'scheduled'
  updatedAt: string
  editor: string
}

export const adminUsers: AdminUser[] = [
  {
    id: 'u1',
    name: 'Minh Anh',
    email: 'minh.anh@3horizons.vn',
    role: 'super_admin',
    status: 'active',
    lastLogin: '2026-07-14 08:12',
    createdAt: '2025-11-01',
  },
  {
    id: 'u2',
    name: 'Hải Long',
    email: 'hai.long@3horizons.vn',
    role: 'partner_manager',
    status: 'active',
    lastLogin: '2026-07-13 17:40',
    createdAt: '2026-01-12',
  },
  {
    id: 'u3',
    name: 'Thu Hà',
    email: 'thu.ha@3horizons.vn',
    role: 'reviewer_matcher',
    status: 'active',
    lastLogin: '2026-07-14 07:55',
    createdAt: '2026-02-03',
  },
  {
    id: 'u4',
    name: 'Quốc Bảo',
    email: 'quoc.bao@3horizons.vn',
    role: 'content_editor',
    status: 'active',
    lastLogin: '2026-07-12 11:20',
    createdAt: '2026-03-18',
  },
  {
    id: 'u5',
    name: 'Lan Chi',
    email: 'lan.chi@3horizons.vn',
    role: 'project_operator',
    status: 'active',
    lastLogin: '2026-07-11 16:05',
    createdAt: '2026-04-02',
  },
  {
    id: 'u6',
    name: 'Support Desk',
    email: 'support@3horizons.vn',
    role: 'support',
    status: 'active',
    lastLogin: '2026-07-14 09:01',
    createdAt: '2026-01-01',
  },
  {
    id: 'u7',
    name: 'Finance Ops',
    email: 'finance@3horizons.vn',
    role: 'finance',
    status: 'invited',
    lastLogin: '—',
    createdAt: '2026-07-01',
  },
  {
    id: 'u8',
    name: 'Guest Suspended',
    email: 'old@example.com',
    role: 'support',
    status: 'suspended',
    lastLogin: '2026-05-20 10:00',
    createdAt: '2025-08-10',
  },
]

export const adminPartners: AdminPartnerRecord[] = [
  {
    id: 'ap1',
    name: 'Lan Phạm',
    title: 'Corporate Strategy Partner',
    email: 'lan.pham@example.com',
    status: 'published',
    layers: ['T1', 'T3', 'T4'],
    services: ['Corporate Strategy', 'Capability Building'],
    linkedin: 'linkedin.com/in/lan-pham',
    enrichmentNotes: '15+ năm chiến lược; ex-director conglomerate VN',
    internalNotes: 'Ưu tiên engagement mid-market manufacturing',
    proofPoints: ['12+ strategy resets', '40+ executive workshops'],
    submittedAt: '2026-03-01',
    region: 'Việt Nam',
  },
  {
    id: 'ap2',
    name: 'David Trần',
    title: 'Succession & Family Governance',
    email: 'david.tran@example.com',
    status: 'verified',
    layers: ['T6', 'T7', 'T2'],
    services: ['Succession', 'Family Governance'],
    linkedin: 'linkedin.com/in/david-tran',
    facebook: 'fb.com/david.tran.advisor',
    enrichmentNotes: 'Family enterprise focus · FFI certificate',
    internalNotes: 'Waitlist capacity — assign carefully',
    proofPoints: ['20+ succession roadmaps', 'Family council design'],
    submittedAt: '2026-05-12',
    region: 'Việt Nam',
  },
  {
    id: 'ap3',
    name: 'Sofia Nguyễn',
    title: 'AI Strategy Partner',
    email: 'sofia.nguyen@example.com',
    status: 'submitted',
    layers: ['T5', 'T1', 'T2'],
    services: ['AI Strategy'],
    linkedin: 'linkedin.com/in/sofia-nguyen-ai',
    enrichmentNotes: 'Healthcare AI governance · ISAGC-aligned',
    internalNotes: 'Cần verify proof points trước publish',
    proofPoints: ['AI portfolio regulated industries'],
    submittedAt: '2026-07-10',
    region: 'ASEAN',
  },
  {
    id: 'ap4',
    name: 'Ngô Minh Tuấn',
    title: 'Execution / SKALE Lead',
    email: 'tuan.ngo@example.com',
    status: 'draft',
    layers: ['T4'],
    services: ['Performance Execution'],
    internalNotes: 'Hồ sơ chưa đủ case study',
    proofPoints: [],
    submittedAt: '2026-07-13',
    region: 'Việt Nam',
  },
  {
    id: 'ap5',
    name: 'James Okonkwo',
    title: 'Board Advisor',
    email: 'james.o@example.com',
    status: 'published',
    layers: ['T2', 'T1'],
    services: ['Governance'],
    linkedin: 'linkedin.com/in/james-okonkwo',
    enrichmentNotes: 'Ex-bank CRO advisory',
    internalNotes: 'Limited availability Q3',
    proofPoints: ['8 board effectiveness reviews'],
    submittedAt: '2026-02-20',
    region: 'APAC',
  },
  {
    id: 'ap6',
    name: 'Partner Suspended Co.',
    title: 'Advisor',
    email: 'x@example.com',
    status: 'suspended',
    layers: ['T1'],
    services: ['Corporate Strategy'],
    internalNotes: 'Vi phạm SLA giao tiếp — tạm dừng',
    proofPoints: [],
    submittedAt: '2025-12-01',
    region: 'Việt Nam',
  },
]

export const adminMatches: AdminMatchItem[] = [
  {
    id: 'req-1042',
    title: 'Sẵn sàng kế thừa cho tập đoàn founder',
    company: 'Gia đình H. Holdings',
    problem: 'Succession',
    status: 'human_review',
    aiSuggestions: [
      { partner: 'David Trần', score: 0.92, reason: 'T6/T7 + family enterprise' },
      { partner: 'James Okonkwo', score: 0.71, reason: 'Governance board support' },
    ],
    owner: 'Thu Hà',
    updatedAt: '2026-07-12',
    priority: 'priority',
  },
  {
    id: 'req-1038',
    title: 'Khung chiến lược & quản trị AI',
    company: 'Healthcare Network VN',
    problem: 'AI strategy / governance',
    status: 'ai_suggested',
    aiSuggestions: [
      { partner: 'Sofia Nguyễn', score: 0.94, reason: 'T5 ISAGC + healthcare' },
      { partner: 'Lan Phạm', score: 0.68, reason: 'Strategy framing support' },
    ],
    owner: 'Thu Hà',
    updatedAt: '2026-07-09',
    priority: 'urgent',
  },
  {
    id: 'req-1021',
    title: 'Chuỗi workshop làm rõ chiến lược',
    company: 'Pacific Industrial',
    problem: 'Strategy clarity',
    status: 'in_project',
    aiSuggestions: [{ partner: 'Lan Phạm', score: 0.91, reason: 'T1 strategy workshops' }],
    assignedPartner: 'Lan Phạm',
    owner: 'Lan Chi',
    updatedAt: '2026-07-01',
    priority: 'standard',
  },
  {
    id: 'req-1050',
    title: 'Board effectiveness pre-IPO',
    company: 'FinServ Group',
    problem: 'Governance / board',
    status: 'queue',
    aiSuggestions: [],
    owner: '—',
    updatedAt: '2026-07-14',
    priority: 'priority',
  },
  {
    id: 'req-1010',
    title: 'Rà soát hiệu quả HĐQT',
    company: 'Legacy Co.',
    problem: 'Governance / board',
    status: 'closed',
    aiSuggestions: [],
    assignedPartner: 'James Okonkwo',
    owner: 'Hải Long',
    updatedAt: '2026-05-18',
    priority: 'standard',
  },
]

export const adminProjects: AdminProject[] = [
  {
    id: 'col-221',
    title: 'Chuỗi workshop làm rõ chiến lược',
    status: 'active',
    owners: ['Lan Chi', 'Facilitator 3H'],
    partners: ['Lan Phạm'],
    dueDate: '2026-08-15',
    milestones: [
      { label: 'Discovery call', done: true, due: '2026-06-28' },
      { label: 'Phỏng vấn lãnh đạo', done: true, due: '2026-07-05' },
      { label: 'Workshop 1 — lựa chọn', done: false, due: '2026-07-21' },
      { label: 'Bản chiến lược 1 trang', done: false, due: '2026-08-01' },
    ],
    files: 12,
    updates: 8,
  },
  {
    id: 'col-198',
    title: 'Phục hồi thực thi — danh mục số',
    status: 'paused',
    owners: ['Lan Chi'],
    partners: ['Erik Sundberg'],
    dueDate: '2026-09-30',
    milestones: [
      { label: 'Baseline', done: true },
      { label: 'Cadence design', done: true },
      { label: 'KPI ownership', done: false, due: '2026-08-10' },
    ],
    files: 6,
    updates: 4,
  },
  {
    id: 'col-175',
    title: 'Family council setup',
    status: 'archived',
    owners: ['Hải Long'],
    partners: ['David Trần'],
    dueDate: '2026-04-30',
    milestones: [
      { label: 'Charter draft', done: true },
      { label: 'Council launch', done: true },
    ],
    files: 20,
    updates: 15,
  },
]

export const adminContent: ContentItem[] = [
  {
    id: 'c1',
    type: 'homepage',
    title: 'Trang chủ Mạng lưới đối tác',
    status: 'published',
    updatedAt: '2026-07-14',
    editor: 'Quốc Bảo',
  },
  {
    id: 'c2',
    type: 'ecosystem',
    title: 'Tầng T5 AI Strategy / ISAGC',
    status: 'published',
    updatedAt: '2026-07-08',
    editor: 'Quốc Bảo',
  },
  {
    id: 'c3',
    type: 'service',
    title: 'Succession Advisory Services',
    status: 'draft',
    updatedAt: '2026-07-13',
    editor: 'Quốc Bảo',
  },
  {
    id: 'c4',
    type: 'case',
    title: 'Case: Portfolio reset manufacturing',
    status: 'published',
    updatedAt: '2026-06-20',
    editor: 'Thu Hà',
  },
  {
    id: 'c5',
    type: 'training',
    title: 'Module: Onboarding đối tác',
    status: 'published',
    updatedAt: '2026-07-01',
    editor: 'Lan Chi',
  },
  {
    id: 'c6',
    type: 'document',
    title: 'SOP Workshop facilitation',
    status: 'published',
    updatedAt: '2026-07-06',
    editor: 'Lan Chi',
  },
  {
    id: 'c7',
    type: 'featured',
    title: 'Featured partners — homepage strip',
    status: 'scheduled',
    updatedAt: '2026-07-14',
    editor: 'Quốc Bảo',
  },
]

export const auditLogs: AuditLog[] = [
  {
    id: 'a1',
    at: '2026-07-14 09:12',
    actor: 'Minh Anh',
    action: 'Đăng nhập admin',
    target: 'Admin portal',
    category: 'login',
  },
  {
    id: 'a2',
    at: '2026-07-14 08:55',
    actor: 'Thu Hà',
    action: 'Chuyển match sang human review',
    target: 'req-1042',
    category: 'approval',
  },
  {
    id: 'a3',
    at: '2026-07-13 16:20',
    actor: 'Hải Long',
    action: 'Duyệt hồ sơ đối tác (verified)',
    target: 'David Trần',
    category: 'approval',
  },
  {
    id: 'a4',
    at: '2026-07-13 11:05',
    actor: 'Quốc Bảo',
    action: 'Cập nhật nội dung trang chủ',
    target: 'homepage',
    category: 'edit',
  },
  {
    id: 'a5',
    at: '2026-07-12 14:40',
    actor: 'Minh Anh',
    action: 'Gán role partner_manager',
    target: 'Hải Long',
    category: 'permission',
  },
  {
    id: 'a6',
    at: '2026-07-11 09:30',
    actor: 'Support Desk',
    action: 'Reset mật khẩu user',
    target: 'old@example.com',
    category: 'security',
  },
  {
    id: 'a7',
    at: '2026-07-10 18:02',
    actor: 'Hải Long',
    action: 'Tạm dừng đối tác',
    target: 'Partner Suspended Co.',
    category: 'approval',
  },
  {
    id: 'a8',
    at: '2026-07-09 10:15',
    actor: 'System',
    action: 'AI gợi ý match (2 partners)',
    target: 'req-1038',
    category: 'edit',
  },
]

export const matchStatusLabels: Record<AdminMatchItem['status'], string> = {
  queue: 'Hàng đợi',
  ai_suggested: 'AI gợi ý',
  human_review: 'Human review',
  assigned: 'Đã gán đối tác',
  in_project: 'Trong project',
  closed: 'Đã đóng',
}

export const partnerStatusLabels: Record<AdminPartnerRecord['status'], string> = {
  draft: 'Nháp',
  submitted: 'Đã nộp',
  verified: 'Đã verify',
  published: 'Đã publish',
  suspended: 'Tạm dừng',
}

export const userStatusLabels: Record<AdminUser['status'], string> = {
  active: 'Hoạt động',
  suspended: 'Tạm dừng',
  invited: 'Đã mời',
}

export function adminKpis() {
  return {
    totalUsers: adminUsers.length,
    pendingPartners: adminPartners.filter((p) => p.status === 'submitted' || p.status === 'draft')
      .length,
    activeRequests: adminMatches.filter((m) => !['closed', 'in_project'].includes(m.status)).length,
    activeProjects: adminProjects.filter((p) => p.status === 'active').length,
    contentUpdates: adminContent.filter((c) => c.updatedAt >= '2026-07-01').length,
    alerts: adminMatches.filter((m) => m.priority === 'urgent').length +
      adminPartners.filter((p) => p.status === 'submitted').length,
  }
}
