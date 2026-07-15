/**
 * Supabase-backed projects CRUD (RLS enforced).
 */

import { getSupabase } from '@/lib/supabase'
import type {
  CreateProjectInput,
  NetworkProject,
  ProjectMember,
  ProjectStatus,
} from '@/data/projects-store'

type ProjectRow = {
  id: string
  title: string
  status: ProjectStatus
  next_action: string | null
  due_date: string | null
  files_count: number
  updates_count: number
  request_id: string | null
  created_at: string
  updated_at: string
}

type MemberRow = {
  project_id: string
  partner_slug: string | null
  display_name: string
  role: ProjectMember['role']
}

type MilestoneRow = {
  project_id: string
  label: string
  done: boolean
  due_date: string | null
  sort_order: number
}

function mapProjects(
  rows: ProjectRow[],
  members: MemberRow[],
  milestones: MilestoneRow[],
): NetworkProject[] {
  return rows.map((p) => {
    const pMembers = members
      .filter((m) => m.project_id === p.id)
      .map((m) => ({
        partnerId: m.partner_slug || m.display_name,
        displayName: m.display_name,
        role: m.role,
      }))
    const pMs = milestones
      .filter((m) => m.project_id === p.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((m) => ({
        label: m.label,
        done: m.done,
        due: m.due_date ?? undefined,
      }))
    return {
      id: p.id,
      title: p.title,
      status: p.status,
      owners: pMembers.filter((m) => m.role === 'facilitator' || m.role === 'owner').map((m) => m.displayName),
      members: pMembers,
      nextAction: p.next_action || '',
      dueDate: p.due_date || '',
      milestones: pMs,
      files: p.files_count ?? 0,
      updates: p.updates_count ?? 0,
      requestId: p.request_id ?? undefined,
      updatedAt: p.updated_at?.slice(0, 10) ?? '',
      createdAt: p.created_at?.slice(0, 10) ?? '',
    }
  })
}

export async function sbFetchAllProjects(): Promise<{
  projects: NetworkProject[]
  error: string | null
}> {
  const sb = getSupabase()
  if (!sb) return { projects: [], error: 'No Supabase client' }

  const { data: rows, error } = await sb
    .from('projects')
    .select(
      'id, title, status, next_action, due_date, files_count, updates_count, request_id, created_at, updated_at',
    )
    .order('updated_at', { ascending: false })

  if (error) return { projects: [], error: error.message }

  const ids = (rows ?? []).map((r) => r.id)
  if (!ids.length) return { projects: [], error: null }

  const [memRes, msRes] = await Promise.all([
    sb
      .from('project_members')
      .select('project_id, partner_slug, display_name, role')
      .in('project_id', ids),
    sb
      .from('project_milestones')
      .select('project_id, label, done, due_date, sort_order')
      .in('project_id', ids),
  ])

  if (memRes.error) return { projects: [], error: memRes.error.message }
  if (msRes.error) return { projects: [], error: msRes.error.message }

  return {
    projects: mapProjects(
      (rows ?? []) as ProjectRow[],
      (memRes.data ?? []) as MemberRow[],
      (msRes.data ?? []) as MilestoneRow[],
    ),
    error: null,
  }
}

export async function sbCreateProject(
  input: CreateProjectInput,
): Promise<{ project: NetworkProject | null; error: string | null }> {
  const sb = getSupabase()
  if (!sb) return { project: null, error: 'No Supabase client' }

  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { project: null, error: 'Chưa đăng nhập Supabase (cần staff session)' }

  const id = `col-${Date.now().toString(36).slice(-6)}`
  const { error: pErr } = await sb.from('projects').insert({
    id,
    title: input.title.trim(),
    status: input.status ?? 'active',
    next_action: input.nextAction?.trim() || 'Kickoff collaboration',
    due_date: input.dueDate || null,
    files_count: 0,
    updates_count: 0,
    request_id: input.requestId ?? null,
    created_by: user.id,
  })
  if (pErr) return { project: null, error: pErr.message }

  const members = input.members?.length
    ? input.members
    : []

  if (members.length) {
    const { error: mErr } = await sb.from('project_members').insert(
      members.map((m) => ({
        project_id: id,
        partner_slug: m.partnerId,
        display_name: m.displayName,
        role: m.role,
        user_id: null,
      })),
    )
    if (mErr) return { project: null, error: mErr.message }
  }

  const milestones = input.milestones?.length
    ? input.milestones
    : [
        { label: 'Kickoff', done: false },
        { label: 'Delivery', done: false },
      ]

  await sb.from('project_milestones').insert(
    milestones.map((m, i) => ({
      project_id: id,
      label: m.label,
      done: m.done,
      due_date: m.due ?? null,
      sort_order: i + 1,
    })),
  )

  const { projects, error } = await sbFetchAllProjects()
  const project = projects.find((p) => p.id === id) ?? null
  return { project, error }
}

export async function sbSetProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<string | null> {
  const sb = getSupabase()
  if (!sb) return 'No Supabase client'
  const { error } = await sb.from('projects').update({ status }).eq('id', id)
  return error?.message ?? null
}

export async function sbAssignPartner(
  projectId: string,
  member: ProjectMember,
): Promise<string | null> {
  const sb = getSupabase()
  if (!sb) return 'No Supabase client'

  // Remove existing same partner_slug then insert
  await sb
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('partner_slug', member.partnerId)

  const { error } = await sb.from('project_members').insert({
    project_id: projectId,
    partner_slug: member.partnerId,
    display_name: member.displayName,
    role: member.role,
  })
  return error?.message ?? null
}

export async function sbRemovePartner(
  projectId: string,
  partnerId: string,
): Promise<string | null> {
  const sb = getSupabase()
  if (!sb) return 'No Supabase client'
  const { error } = await sb
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('partner_slug', partnerId)
  return error?.message ?? null
}
