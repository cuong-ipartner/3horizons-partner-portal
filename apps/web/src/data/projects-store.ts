/**
 * Shared project / collaboration store.
 * - seed mode: localStorage
 * - supabase mode: Postgres + RLS (see projects-supabase.ts)
 */

import { useCallback, useEffect, useState } from 'react'
import { isSupabaseAuthEnabled } from '@/lib/supabase'
import {
  sbAssignPartner,
  sbCreateProject,
  sbFetchAllProjects,
  sbRemovePartner,
  sbSetProjectStatus,
} from '@/data/projects-supabase'

const STORAGE_KEY = '3h-projects-store-v1'
const UPDATED_EVENT = '3h-projects-updated'

export type ProjectStatus = 'active' | 'paused' | 'archived'

export type ProjectMemberRole = 'partner' | 'facilitator' | 'client' | 'owner'

export type ProjectMember = {
  partnerId: string
  /** Display name for admin UI */
  displayName: string
  role: ProjectMemberRole
}

export type ProjectMilestone = {
  label: string
  done: boolean
  due?: string
}

export type NetworkProject = {
  id: string
  title: string
  status: ProjectStatus
  /** Staff owners (names) */
  owners: string[]
  members: ProjectMember[]
  nextAction: string
  dueDate: string
  milestones: ProjectMilestone[]
  files: number
  updates: number
  requestId?: string
  updatedAt: string
  createdAt: string
}

export type CreateProjectInput = {
  title: string
  status?: ProjectStatus
  owners?: string[]
  members?: ProjectMember[]
  nextAction?: string
  dueDate?: string
  milestones?: ProjectMilestone[]
  requestId?: string
}

const SEED_PROJECTS: NetworkProject[] = []

function notify() {
  window.dispatchEvent(new Event(UPDATED_EVENT))
}

function normalizeProject(raw: Partial<NetworkProject>): NetworkProject | null {
  if (!raw.id || !raw.title) return null
  return {
    id: String(raw.id),
    title: String(raw.title),
    status: raw.status === 'paused' || raw.status === 'archived' ? raw.status : 'active',
    owners: Array.isArray(raw.owners) ? raw.owners.map(String) : [],
    members: Array.isArray(raw.members)
      ? raw.members.map((m) => ({
          partnerId: String(m.partnerId),
          displayName: String(m.displayName ?? m.partnerId),
          role: (m.role as ProjectMemberRole) || 'partner',
        }))
      : [],
    nextAction: String(raw.nextAction ?? ''),
    dueDate: String(raw.dueDate ?? ''),
    milestones: Array.isArray(raw.milestones)
      ? raw.milestones.map((m) => ({
          label: String(m.label),
          done: Boolean(m.done),
          due: m.due ? String(m.due) : undefined,
        }))
      : [],
    files: Number(raw.files ?? 0),
    updates: Number(raw.updates ?? 0),
    requestId: raw.requestId ? String(raw.requestId) : undefined,
    updatedAt: String(raw.updatedAt ?? new Date().toISOString().slice(0, 10)),
    createdAt: String(raw.createdAt ?? new Date().toISOString().slice(0, 10)),
  }
}

export function loadAllProjects(): NetworkProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const list = parsed
      .map((item) => normalizeProject(item as Partial<NetworkProject>))
      .filter((p): p is NetworkProject => p != null)
    return list
  } catch {
    return []
  }
}

export function saveAllProjects(projects: NetworkProject[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    notify()
  } catch {
    /* ignore */
  }
}

export function resetProjectsToSeed() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
  saveAllProjects(SEED_PROJECTS)
}

/** Partner sees only projects where they are a member (not archived by default). */
export function listProjectsForPartner(
  partnerId: string,
  opts?: { includeArchived?: boolean },
): NetworkProject[] {
  return loadAllProjects().filter((p) => {
    if (!opts?.includeArchived && p.status === 'archived') return false
    return p.members.some((m) => m.partnerId === partnerId && m.role === 'partner')
  })
}

export function getProjectForPartner(
  projectId: string,
  partnerId: string,
): NetworkProject | null {
  const p = loadAllProjects().find((x) => x.id === projectId)
  if (!p) return null
  const allowed = p.members.some((m) => m.partnerId === partnerId)
  return allowed ? p : null
}

export function milestoneProgress(p: NetworkProject): number {
  if (!p.milestones.length) return 0
  const done = p.milestones.filter((m) => m.done).length
  return Math.round((done / p.milestones.length) * 100)
}

export function partnerLabels(p: NetworkProject): string[] {
  return p.members.filter((m) => m.role === 'partner').map((m) => m.displayName)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function createProjectLocal(input: CreateProjectInput): NetworkProject {
  const all = loadAllProjects()
  const id = `col-${Date.now().toString(36).slice(-5)}`
  const project: NetworkProject = {
    id,
    title: input.title.trim(),
    status: input.status ?? 'active',
    owners: input.owners?.length ? input.owners : ['Facilitator 3H'],
    members: input.members ?? [],
    nextAction: input.nextAction?.trim() || 'Kickoff collaboration',
    dueDate: input.dueDate || '',
    milestones: input.milestones?.length
      ? input.milestones
      : [
          { label: 'Kickoff', done: false },
          { label: 'Delivery', done: false },
        ],
    files: 0,
    updates: 0,
    requestId: input.requestId,
    updatedAt: today(),
    createdAt: today(),
  }
  saveAllProjects([project, ...all])
  return project
}

/** Create project (Supabase when enabled + authenticated staff; else localStorage). */
export async function createProject(
  input: CreateProjectInput,
): Promise<{ project: NetworkProject | null; error: string | null; via: 'supabase' | 'local' }> {
  if (isSupabaseAuthEnabled()) {
    const res = await sbCreateProject(input)
    if (!res.error && res.project) {
      notify()
      return { project: res.project, error: null, via: 'supabase' }
    }
    // Fall back to local so Admin demo still works if staff session missing
    if (res.error) {
      const local = createProjectLocal(input)
      return {
        project: local,
        error: `Supabase: ${res.error} — đã lưu local fallback`,
        via: 'local',
      }
    }
  }
  return { project: createProjectLocal(input), error: null, via: 'local' }
}

export function updateProject(
  id: string,
  patch: Partial<Omit<NetworkProject, 'id' | 'createdAt'>>,
): NetworkProject | null {
  const all = loadAllProjects()
  const idx = all.findIndex((p) => p.id === id)
  if (idx < 0) return null
  const next: NetworkProject = {
    ...all[idx],
    ...patch,
    id: all[idx].id,
    createdAt: all[idx].createdAt,
    updatedAt: today(),
  }
  all[idx] = next
  saveAllProjects(all)
  return next
}

export function setProjectMembers(id: string, members: ProjectMember[]): NetworkProject | null {
  return updateProject(id, { members })
}

export async function assignPartner(
  projectId: string,
  member: ProjectMember,
): Promise<{ error: string | null; via: 'supabase' | 'local' }> {
  if (isSupabaseAuthEnabled()) {
    const err = await sbAssignPartner(projectId, member)
    if (!err) {
      notify()
      return { error: null, via: 'supabase' }
    }
    // local fallback
    const p = loadAllProjects().find((x) => x.id === projectId)
    if (p) {
      const without = p.members.filter((m) => m.partnerId !== member.partnerId)
      updateProject(projectId, { members: [...without, member] })
    }
    return { error: `Supabase: ${err} — local fallback`, via: 'local' }
  }
  const p = loadAllProjects().find((x) => x.id === projectId)
  if (!p) return { error: 'Project not found', via: 'local' }
  const without = p.members.filter((m) => m.partnerId !== member.partnerId)
  updateProject(projectId, { members: [...without, member] })
  return { error: null, via: 'local' }
}

export async function removePartner(
  projectId: string,
  partnerId: string,
): Promise<{ error: string | null; via: 'supabase' | 'local' }> {
  if (isSupabaseAuthEnabled()) {
    const err = await sbRemovePartner(projectId, partnerId)
    if (!err) {
      notify()
      return { error: null, via: 'supabase' }
    }
    const p = loadAllProjects().find((x) => x.id === projectId)
    if (p) {
      updateProject(projectId, {
        members: p.members.filter((m) => m.partnerId !== partnerId),
      })
    }
    return { error: `Supabase: ${err} — local fallback`, via: 'local' }
  }
  const p = loadAllProjects().find((x) => x.id === projectId)
  if (!p) return { error: 'Project not found', via: 'local' }
  updateProject(projectId, {
    members: p.members.filter((m) => m.partnerId !== partnerId),
  })
  return { error: null, via: 'local' }
}

export async function setProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<{ error: string | null; via: 'supabase' | 'local' }> {
  if (isSupabaseAuthEnabled()) {
    const err = await sbSetProjectStatus(id, status)
    if (!err) {
      notify()
      return { error: null, via: 'supabase' }
    }
    updateProject(id, { status })
    return { error: `Supabase: ${err} — local fallback`, via: 'local' }
  }
  updateProject(id, { status })
  return { error: null, via: 'local' }
}

export type ProjectsHookState = {
  projects: NetworkProject[]
  loading: boolean
  error: string | null
  backend: 'local' | 'supabase'
  refresh: () => Promise<void>
}

/** React hook — localStorage and/or Supabase (RLS). */
export function useProjectsState(): ProjectsHookState {
  const [projects, setProjects] = useState<NetworkProject[]>(() =>
    typeof window === 'undefined' ? SEED_PROJECTS : loadAllProjects(),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backend, setBackend] = useState<'local' | 'supabase'>('local')

  const refresh = useCallback(async () => {
    if (isSupabaseAuthEnabled()) {
      setLoading(true)
      const { projects: remote, error: err } = await sbFetchAllProjects()
      if (!err) {
        setProjects(remote)
        setBackend('supabase')
        setError(null)
        setLoading(false)
        return
      }
      setError(err)
      setProjects(loadAllProjects())
      setBackend('local')
      setLoading(false)
      return
    }
    setProjects(loadAllProjects())
    setBackend('local')
    setError(null)
  }, [])

  useEffect(() => {
    void refresh()
    const onUpdate = () => {
      void refresh()
    }
    window.addEventListener(UPDATED_EVENT, onUpdate)
    window.addEventListener('storage', onUpdate)
    window.addEventListener('3h-session-updated', onUpdate)
    return () => {
      window.removeEventListener(UPDATED_EVENT, onUpdate)
      window.removeEventListener('storage', onUpdate)
      window.removeEventListener('3h-session-updated', onUpdate)
    }
  }, [refresh])

  return { projects, loading, error, backend, refresh }
}

/** @deprecated prefer useProjectsState — kept for simple consumers */
export function useProjects(): NetworkProject[] {
  return useProjectsState().projects
}

export function usePartnerProjects(partnerId: string, includeArchived = false): NetworkProject[] {
  const { projects } = useProjectsState()
  return projects.filter((p) => {
    if (!includeArchived && p.status === 'archived') return false
    return p.members.some((m) => m.partnerId === partnerId && m.role === 'partner')
  })
}

export { SEED_PROJECTS, STORAGE_KEY, UPDATED_EVENT }
