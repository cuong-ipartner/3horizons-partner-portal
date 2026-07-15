/**
 * Nexus 4-layer memory (client-side demo).
 * Session → local chat history
 * Project / Partner / Global → localStorage + seed facts
 */

import {
  collaborations,
  matchRequests,
  partners,
  problems,
  statusLabels,
} from '@/data/seed'

const GLOBAL_KEY = '3h-nexus-global-memory-v1'
const PROJECT_KEY = '3h-nexus-project-memory-v1'
const PARTNER_KEY = '3h-nexus-partner-memory-v1'
const SESSION_KEY = '3h-nexus-session-messages-v1'

export type NexusMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  at: string
}

export type GlobalMemory = {
  userName?: string
  company?: string
  role?: string
  preferredLanguage?: 'vi' | 'en'
  preferences?: string[]
  recurringPatterns?: string[]
}

export type ProjectMemory = {
  projectId: string
  title: string
  objective?: string
  status: string
  owner?: string
  dueDate?: string
  blockers?: string[]
  nextAction?: string
  milestones?: string[]
  decisions?: string[]
}

export type PartnerMemory = {
  partnerSlug: string
  name: string
  expertise: string[]
  layers: string[]
  services: string[]
  industry: string
  availability: string
  proofPoints: string[]
  notes?: string[]
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota */
  }
}

/** Seeded defaults from confirmed demo data (never invented). */
export function getSeedProjectMemories(): ProjectMemory[] {
  return collaborations.map((c) => ({
    projectId: c.id,
    title: c.title,
    objective: c.title,
    status: c.status === 'active' ? 'Active collaboration' : c.status === 'paused' ? 'Waiting for input' : 'Archived',
    owner: c.owner,
    nextAction: c.nextAction,
    milestones: c.milestones.map((m) => `${m.done ? '✓' : '○'} ${m.label}`),
    blockers: c.status === 'paused' ? ['Tạm dừng theo quyết định ngân sách / scope'] : [],
  }))
}

export function getSeedPartnerMemories(): PartnerMemory[] {
  return partners.map((p) => ({
    partnerSlug: p.slug,
    name: p.name,
    expertise: p.expertise,
    layers: p.layers,
    services: p.services,
    industry: p.industry,
    availability: p.availability,
    proofPoints: p.proofPoints,
  }))
}

export function getSeedMatchContext() {
  return matchRequests.map((r) => ({
    id: r.id,
    title: r.title,
    status: statusLabels[r.status],
    nextAction: r.nextAction,
    problemSlug: r.problemSlug,
    preferredPartner: r.preferredPartner,
  }))
}

export function getDefaultGlobalMemory(): GlobalMemory {
  return {
    userName: 'Cuong Doan',
    company: '3HVN Partner Activation',
    role: 'Partner · Đang triển khai',
    preferredLanguage: 'vi',
    preferences: [
      'Trả lời tiếng Việt mặc định',
      'Văn bản thuần, không markdown **',
      'Ưu tiên định hướng theo vấn đề (problem-first)',
      'Giọng điệu senior advisor',
    ],
  }
}

export function loadGlobalMemory(): GlobalMemory {
  return { ...getDefaultGlobalMemory(), ...readJson<GlobalMemory>(GLOBAL_KEY, {}) }
}

export function saveGlobalMemory(patch: Partial<GlobalMemory>) {
  const next = { ...loadGlobalMemory(), ...patch }
  writeJson(GLOBAL_KEY, next)
  return next
}

export function loadProjectMemories(): ProjectMemory[] {
  const custom = readJson<ProjectMemory[]>(PROJECT_KEY, [])
  const seed = getSeedProjectMemories()
  const map = new Map(seed.map((p) => [p.projectId, p]))
  for (const c of custom) map.set(c.projectId, { ...map.get(c.projectId), ...c })
  return [...map.values()]
}

export function upsertProjectMemory(pm: ProjectMemory) {
  const all = loadProjectMemories()
  const idx = all.findIndex((p) => p.projectId === pm.projectId)
  if (idx >= 0) all[idx] = pm
  else all.push(pm)
  writeJson(PROJECT_KEY, all)
  return all
}

export function loadPartnerMemories(): PartnerMemory[] {
  const custom = readJson<PartnerMemory[]>(PARTNER_KEY, [])
  const seed = getSeedPartnerMemories()
  const map = new Map(seed.map((p) => [p.partnerSlug, p]))
  for (const c of custom) map.set(c.partnerSlug, { ...map.get(c.partnerSlug), ...c })
  return [...map.values()]
}

export function loadSessionMessages(): NexusMessage[] {
  return readJson<NexusMessage[]>(SESSION_KEY, [])
}

export function saveSessionMessages(messages: NexusMessage[]) {
  writeJson(SESSION_KEY, messages.slice(-40))
}

export function clearSessionMessages() {
  localStorage.removeItem(SESSION_KEY)
}

/** Build context block injected into system message. */
export function buildMemoryContextBlock(opts?: {
  activeProjectId?: string
  activePartnerSlug?: string
  routePath?: string
}): string {
  const global = loadGlobalMemory()
  const projects = loadProjectMemories()
  const partnerMem = loadPartnerMemories()
  const matches = getSeedMatchContext()
  const problemList = problems.map((p) => `- ${p.name} (${p.slug}): ${p.pain}`).join('\n')

  const activeProject =
    (opts?.activeProjectId && projects.find((p) => p.projectId === opts.activeProjectId)) ||
    projects.find((p) => p.status === 'Active collaboration') ||
    projects[0]

  const activePartner =
    (opts?.activePartnerSlug &&
      partnerMem.find((p) => p.partnerSlug === opts.activePartnerSlug)) ||
    null

  const lines: string[] = [
    '=== CONFIRMED MEMORY CONTEXT (use only this; do not invent) ===',
    '',
    '[Global memory]',
    `User: ${global.userName ?? '—'}`,
    `Company: ${global.company ?? '—'}`,
    `Role: ${global.role ?? '—'}`,
    `Language preference: ${global.preferredLanguage ?? 'vi'}`,
    `Preferences: ${(global.preferences ?? []).join('; ') || '—'}`,
    '',
    `[Portal route] ${opts?.routePath ?? '/portal'}`,
    '',
    '[Active project memory]',
  ]

  if (activeProject) {
    lines.push(
      `ID: ${activeProject.projectId}`,
      `Title: ${activeProject.title}`,
      `Status: ${activeProject.status}`,
      `Owner: ${activeProject.owner ?? '—'}`,
      `Next action: ${activeProject.nextAction ?? '—'}`,
      `Milestones: ${(activeProject.milestones ?? []).join(' | ') || '—'}`,
      `Blockers: ${(activeProject.blockers ?? []).join('; ') || '—'}`,
    )
  } else {
    lines.push('No active project memory.')
  }

  lines.push('', '[Match requests (confirmed)]')
  for (const m of matches.slice(0, 4)) {
    lines.push(`- ${m.id}: ${m.title} | ${m.status} | Next: ${m.nextAction}`)
  }

  lines.push('', '[Partner memory catalog (verified seed)]')
  for (const p of partnerMem.slice(0, 6)) {
    lines.push(
      `- ${p.name} (${p.partnerSlug}): ${p.expertise.join(', ')}; layers=${p.layers.join(',')}; industry=${p.industry}; availability=${p.availability}`,
    )
  }

  if (activePartner) {
    lines.push(
      '',
      '[Focused partner]',
      `${activePartner.name}: ${activePartner.proofPoints.join('; ')}`,
    )
  }

  lines.push('', '[Problem taxonomy (for matching)]', problemList)
  lines.push('', '=== END MEMORY ===')

  return lines.join('\n')
}
