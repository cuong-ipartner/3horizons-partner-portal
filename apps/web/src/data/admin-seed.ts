/** Admin types & labels. Record arrays are empty in production (live data via Supabase/API). */

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

export const adminUsers: AdminUser[] = []

export const adminPartners: AdminPartnerRecord[] = []

export const adminMatches: AdminMatchItem[] = []

export const adminProjects: AdminProject[] = []

export const adminContent: ContentItem[] = []

export const auditLogs: AuditLog[] = []

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
