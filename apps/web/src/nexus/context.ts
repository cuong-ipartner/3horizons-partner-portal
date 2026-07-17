/**
 * Live context for Nexus — profile + projects from Supabase (never invent).
 * Service catalog from product taxonomy (seed layers/services) — public product facts.
 */

import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'
import { layers, serviceLines } from '@/data/seed'
import {
  listProjectsForPartner,
  type NetworkProject,
} from '@/data/projects-store'
import {
  sbFetchAllProjects,
} from '@/data/projects-supabase'

export type NexusLiveContext = {
  block: string
  hasActiveProject: boolean
  userName?: string
  partnerSlug?: string
}

function serviceCatalogBlock(): string {
  const lines = [
    '<services_catalog source="3horizons_product">',
    'Dịch vụ / giải pháp 3HORIZONS Việt Nam (catalog sản phẩm — không bịa case):',
    ...serviceLines.map(
      (s) =>
        `- ${s.name} (slug: ${s.slug}): ${s.solves} | Layers: ${s.layers.join(', ')} | Cần partner: ${s.partnerNeeded}`,
    ),
    '',
    'Tầng hệ sinh thái:',
    ...layers.map((l) => `- ${l.code} ${l.name}: ${l.mandate}`),
    '</services_catalog>',
  ]
  return lines.join('\n')
}

function projectLines(projects: NetworkProject[]): string[] {
  if (!projects.length) {
    return [
      '<projects>',
      'empty: true',
      'message: Chưa có engagement/project trong hệ thống cho partner này. Không bịa project hoặc client.',
      '</projects>',
    ]
  }
  const lines = ['<projects>']
  for (const p of projects.slice(0, 8)) {
    lines.push(
      `- id=${p.id} | title=${p.title} | status=${p.status} | next=${p.nextAction || '—'} | due=${p.dueDate || '—'}`,
    )
    const open = p.milestones.filter((m) => !m.done).slice(0, 3)
    if (open.length) {
      lines.push(`  open_milestones: ${open.map((m) => m.label).join('; ')}`)
    }
  }
  lines.push('</projects>')
  return lines
}

/** Build XML-ish context injected every Nexus turn. */
export async function buildNexusLiveContext(opts: {
  routePath?: string
  activeProjectId?: string
  /** from session */
  sessionPartnerSlug?: string
  sessionName?: string
  sessionEmail?: string
}): Promise<NexusLiveContext> {
  const parts: string[] = [
    '<live_context source="supabase_or_session" rules="never_invent_missing_fields">',
    `<route>${opts.routePath || '/'}</route>`,
  ]

  let userName = opts.sessionName
  let partnerSlug = opts.sessionPartnerSlug
  let hasActiveProject = false

  if (isSupabaseAuthEnabled()) {
    const sb = getSupabase()
    if (sb) {
      const {
        data: { user },
      } = await sb.auth.getUser()
      if (user) {
        const { data: profile } = await sb
          .from('profiles')
          .select(
            'full_name, email, role, partner_slug, region, focus_layers, verified, status, standing_status',
          )
          .eq('id', user.id)
          .maybeSingle()

        const p = profile as {
          full_name?: string | null
          email?: string | null
          role?: string | null
          partner_slug?: string | null
          region?: string | null
          focus_layers?: string | null
          verified?: boolean | null
          status?: string | null
          standing_status?: string | null
        } | null

        userName = p?.full_name || userName || user.email?.split('@')[0]
        partnerSlug = p?.partner_slug || partnerSlug

        parts.push('<partner>')
        parts.push(`  user_id: ${user.id}`)
        parts.push(`  full_name: ${p?.full_name || userName || '—'}`)
        parts.push(`  email: ${p?.email || user.email || opts.sessionEmail || '—'}`)
        parts.push(`  role: ${p?.role || 'partner'}`)
        parts.push(`  partner_slug: ${p?.partner_slug || partnerSlug || '—'}`)
        parts.push(`  region: ${p?.region || '—'}`)
        parts.push(`  focus_layers: ${p?.focus_layers || '—'}`)
        parts.push(`  verified: ${p?.verified === true ? 'yes' : p?.verified === false ? 'no' : '—'}`)
        parts.push(`  status: ${p?.status || '—'}`)
        parts.push(`  standing_status: ${p?.standing_status || '—'}`)
        parts.push('</partner>')

        // Projects: try Supabase staff/all + filter membership, else local store
        let projects: NetworkProject[] = []
        try {
          const fetched = await sbFetchAllProjects()
          const all = fetched.projects || []
          if (all.length) {
            const slug = partnerSlug || ''
            const isStaff =
              p?.role &&
              ['super_admin', 'partner_manager', 'project_operator', 'content_editor'].includes(
                p.role,
              )
            projects = isStaff
              ? all
              : all.filter((pr: NetworkProject) =>
                  pr.members.some((m) => m.partnerId === slug && m.role === 'partner'),
                )
          }
        } catch {
          /* fall through */
        }
        if (!projects.length && partnerSlug) {
          projects = listProjectsForPartner(partnerSlug, { includeArchived: false })
        }

        hasActiveProject = projects.some((pr) => pr.status === 'active')
        parts.push(...projectLines(projects))

        if (opts.activeProjectId) {
          const active = projects.find((pr) => pr.id === opts.activeProjectId)
          parts.push('<project>')
          if (active) {
            parts.push(`  id: ${active.id}`)
            parts.push(`  title: ${active.title}`)
            parts.push(`  status: ${active.status}`)
            parts.push(`  next_action: ${active.nextAction || '—'}`)
            parts.push(`  due: ${active.dueDate || '—'}`)
            parts.push(
              `  members: ${active.members.map((m) => `${m.displayName}(${m.role})`).join(', ') || '—'}`,
            )
          } else {
            parts.push('  empty: true')
            parts.push(
              '  message: Project id được chọn không có trong data — nói “chưa có data” / không bịa.',
            )
          }
          parts.push('</project>')
        }
      } else {
        parts.push('<partner>')
        parts.push('  empty: true')
        parts.push('  message: Chưa đăng nhập Supabase — chỉ dùng session UI nếu có.')
        parts.push(`  session_name: ${opts.sessionName || '—'}`)
        parts.push(`  session_partner_slug: ${opts.sessionPartnerSlug || '—'}`)
        parts.push('</partner>')
        parts.push(...projectLines([]))
      }
    }
  } else {
    parts.push('<partner>')
    parts.push('  empty: true')
    parts.push('  message: Supabase chưa cấu hình trên build.')
    parts.push(`  session_name: ${opts.sessionName || '—'}`)
    parts.push('</partner>')
    const local = opts.sessionPartnerSlug
      ? listProjectsForPartner(opts.sessionPartnerSlug)
      : []
    hasActiveProject = local.some((p) => p.status === 'active')
    parts.push(...projectLines(local))
  }

  parts.push(serviceCatalogBlock())
  parts.push('</live_context>')

  return {
    block: parts.join('\n'),
    hasActiveProject,
    userName,
    partnerSlug,
  }
}

/** Detect reply language from latest user text. Default VI. */
export function detectMessageLang(text: string): 'vi' | 'en' {
  const t = text.trim()
  if (!t) return 'vi'
  // Strong English signal: mostly ASCII letters and English function words
  const enHits = (
    t.match(
      /\b(the|and|or|what|how|when|where|please|help|project|partner|referral|service|need|want|can|could|would|should)\b/gi,
    ) || []
  ).length
  const hasVi =
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(t) ||
    /\b(tôi|mình|bạn|không|được|cần|giúp|dịch vụ|đối tác|giới thiệu|dự án|hôm nay)\b/i.test(t)
  if (hasVi) return 'vi'
  if (enHits >= 2 || (/^[a-zA-Z0-9\s.,?'"!\-:/]+$/.test(t) && t.length > 12)) return 'en'
  return 'vi'
}

export function pickNexusOpening(opts: {
  hasActiveProject: boolean
  userName?: string
  lang?: 'vi' | 'en'
}): string {
  const name = opts.userName?.trim()
  const greet = name ? (opts.lang === 'en' ? `Hi ${name}` : `Chào ${name}`) : opts.lang === 'en' ? 'Hello' : 'Chào bạn'

  if (opts.hasActiveProject) {
    return opts.lang === 'en'
      ? `${greet}. Nexus here — you have an active engagement. I can help with next milestone, service positioning for clients, or a referral brief. What do you need now?`
      : `${greet}. Mình là Nexus. Bạn đang có engagement active — mình có thể hỗ trợ mốc tiếp theo, định vị dịch vụ 3HVN cho khách, hoặc brief giới thiệu. Bạn cần gì ngay?`
  }

  return opts.lang === 'en'
    ? `${greet}. I'm Nexus, 3HORIZONS strategic advisor. I can help you introduce 3HORIZONS Vietnam services to clients, prepare referral briefs, or navigate documents/engagements. What would you like to focus on?`
    : `${greet}. Mình là Nexus — cố vấn chiến lược 3HORIZONS. Mình hỗ trợ bạn giới thiệu dịch vụ 3HORIZONS Việt Nam cho khách hàng, soạn brief referral, hoặc điều hướng tài liệu / engagement. Bạn muốn bắt đầu phần nào?`
}
