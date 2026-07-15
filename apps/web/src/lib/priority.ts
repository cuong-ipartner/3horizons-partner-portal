/**
 * Phase C — priority-of-day and decisions derived from real engagement milestones.
 */

import type { NetworkProject, ProjectMilestone } from '@/data/projects-store'

export type PrioritySource =
  | 'milestone_overdue'
  | 'milestone_due_soon'
  | 'milestone_next'
  | 'next_action'
  | 'empty'

export type DayPriority = {
  line: string
  source: PrioritySource
  meta: string
  ctaLabel: string
  ctaTo: string
  projectId?: string
  projectTitle?: string
}

export type DecisionItem = {
  id: string
  title: string
  meta: string
  to: string
  urgency: 'now' | 'soon' | 'plan'
}

function parseDue(due?: string): Date | null {
  if (!due) return null
  // Accept YYYY-MM-DD or DD/MM/YYYY
  if (/^\d{4}-\d{2}-\d{2}/.test(due)) {
    const d = new Date(due.slice(0, 10) + 'T12:00:00')
    return Number.isNaN(d.getTime()) ? null : d
  }
  const m = due.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

function startOfToday() {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}

function daysFromToday(due: Date) {
  const t = startOfToday().getTime()
  return Math.round((due.getTime() - t) / 86400000)
}

function formatDueVi(due?: string) {
  const d = parseDue(due)
  if (!d) return due || ''
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
}

type OpenMs = {
  project: NetworkProject
  milestone: ProjectMilestone
  due: Date | null
  days: number | null
}

function collectOpenMilestones(projects: NetworkProject[]): OpenMs[] {
  const out: OpenMs[] = []
  for (const project of projects) {
    if (project.status === 'archived') continue
    for (const milestone of project.milestones) {
      if (milestone.done) continue
      const due = parseDue(milestone.due)
      out.push({
        project,
        milestone,
        due,
        days: due ? daysFromToday(due) : null,
      })
    }
  }
  return out
}

/** Single hero line for dashboard. */
export function computeDayPriority(projects: NetworkProject[]): DayPriority {
  const active = projects.filter((p) => p.status !== 'archived')
  if (!active.length) {
    return {
      line: 'Hồ sơ sẵn sàng — 3HORIZONS sẽ mở engagement khi có collaboration phù hợp.',
      source: 'empty',
      meta: 'Không có engagement mở',
      ctaLabel: 'Xem standing',
      ctaTo: '/portal/account',
    }
  }

  const open = collectOpenMilestones(active)
  const overdue = open
    .filter((x) => x.days != null && x.days < 0)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
  if (overdue[0]) {
    const x = overdue[0]
    return {
      line: `Mốc trễ: ${x.milestone.label} — ${x.project.title}`,
      source: 'milestone_overdue',
      meta: `Quá hạn ${Math.abs(x.days ?? 0)} ngày · ${formatDueVi(x.milestone.due)}`,
      ctaLabel: `Tiếp tục: ${x.milestone.label}`,
      ctaTo: `/portal/projects/${x.project.id}?m=${encodeURIComponent(x.milestone.label)}`,
      projectId: x.project.id,
      projectTitle: x.project.title,
    }
  }

  const soon = open
    .filter((x) => x.days != null && x.days >= 0 && x.days <= 7)
    .sort((a, b) => (a.days ?? 99) - (b.days ?? 99))
  if (soon[0]) {
    const x = soon[0]
    const when =
      x.days === 0 ? 'Hôm nay' : x.days === 1 ? 'Ngày mai' : `Còn ${x.days} ngày`
    return {
      line: `${x.milestone.label} · ${x.project.title}`,
      source: 'milestone_due_soon',
      meta: `${when} · hạn ${formatDueVi(x.milestone.due)}`,
      ctaLabel: `Tiếp tục: ${x.milestone.label}`,
      ctaTo: `/portal/projects/${x.project.id}?m=${encodeURIComponent(x.milestone.label)}`,
      projectId: x.project.id,
      projectTitle: x.project.title,
    }
  }

  const primary = active.find((p) => p.status === 'active') ?? active[0]
  const nextMs = primary.milestones.find((m) => !m.done)
  if (nextMs) {
    return {
      line: `${nextMs.label}${nextMs.due ? ` · hạn ${formatDueVi(nextMs.due)}` : ''} — ${primary.title}`,
      source: 'milestone_next',
      meta: primary.nextAction || 'Mốc tiếp theo trên engagement',
      ctaLabel: `Tiếp tục: ${nextMs.label}`,
      ctaTo: `/portal/projects/${primary.id}?m=${encodeURIComponent(nextMs.label)}`,
      projectId: primary.id,
      projectTitle: primary.title,
    }
  }

  if (primary.nextAction) {
    return {
      line: primary.nextAction,
      source: 'next_action',
      meta: primary.title,
      ctaLabel: 'Vào phòng engagement',
      ctaTo: `/portal/projects/${primary.id}`,
      projectId: primary.id,
      projectTitle: primary.title,
    }
  }

  return {
    line: `${primary.title} — chờ mốc tiếp theo từ facilitator.`,
    source: 'next_action',
    meta: primary.id,
    ctaLabel: 'Vào phòng engagement',
    ctaTo: `/portal/projects/${primary.id}`,
    projectId: primary.id,
    projectTitle: primary.title,
  }
}

/** 2–4 decision rows for “Việc cần bạn”. */
export function buildDecisionsFromProjects(projects: NetworkProject[]): DecisionItem[] {
  const items: DecisionItem[] = []
  const open = collectOpenMilestones(projects.filter((p) => p.status !== 'archived'))

  for (const x of open
    .filter((o) => o.days != null && o.days < 0)
    .slice(0, 2)) {
    items.push({
      id: `overdue-${x.project.id}-${x.milestone.label}`,
      title: `Chốt mốc trễ: ${x.milestone.label}`,
      meta: `${x.project.title} · quá hạn ${Math.abs(x.days ?? 0)} ngày`,
      to: `/portal/projects/${x.project.id}?m=${encodeURIComponent(x.milestone.label)}`,
      urgency: 'now',
    })
  }

  for (const x of open
    .filter((o) => o.days != null && o.days >= 0 && o.days <= 7)
    .slice(0, 3 - items.length)) {
    const when =
      x.days === 0 ? 'Hôm nay' : x.days === 1 ? 'Ngày mai' : `Còn ${x.days} ngày`
    items.push({
      id: `soon-${x.project.id}-${x.milestone.label}`,
      title: x.milestone.label,
      meta: `${x.project.title} · ${when}`,
      to: `/portal/projects/${x.project.id}?m=${encodeURIComponent(x.milestone.label)}`,
      urgency: x.days === 0 ? 'now' : 'soon',
    })
  }

  if (items.length < 3) {
    const primary = projects.find((p) => p.status === 'active')
    if (primary?.nextAction && !items.some((i) => i.title === primary.nextAction)) {
      items.push({
        id: `next-${primary.id}`,
        title: primary.nextAction,
        meta: `${primary.title} · Việc tiếp theo`,
        to: `/portal/projects/${primary.id}`,
        urgency: 'soon',
      })
    }
  }

  if (items.length < 3) {
    items.push({
      id: 'docs-brief',
      title: 'Đọc brief curated trước mốc kế tiếp',
      meta: 'Tài liệu · Chuẩn bị',
      to: '/portal/documents',
      urgency: 'plan',
    })
  }

  if (items.length < 3) {
    items.push({
      id: 'standing',
      title: 'Rà soát standing & tầng trọng tâm',
      meta: 'Hồ sơ · Định kỳ',
      to: '/portal/account',
      urgency: 'plan',
    })
  }

  return items.slice(0, 4)
}
