import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, FileText, User } from 'lucide-react'
import {
  PortalBackLink,
  PortalCard,
  PortalEmpty,
  PortalPage,
  PortalPageHeader,
  PortalProgress,
  PortalSectionLabel,
  PortalStatusPill,
} from '@/components/portal/PortalUi'
import { milestoneProgress, useProjectsState, type NetworkProject } from '@/data/projects-store'
import { useDemoSession } from '@/hooks/useDemoSession'
import { isAuthLocalFallback } from '@/lib/auth'
import { cn } from '@/lib/cn'

const statusVi: Record<string, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Đang dẫn dắt', tone: 'success' },
  paused: { label: 'Tạm dừng', tone: 'warning' },
  archived: { label: 'Lưu trữ', tone: 'neutral' },
}

function canAccess(p: NetworkProject, partnerId: string, isStaff: boolean) {
  if (isStaff) return true
  return p.members.some((m) => m.partnerId === partnerId)
}

function formatDue(due?: string) {
  if (!due) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(due)) {
    const d = new Date(due.slice(0, 10) + 'T12:00:00')
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  }
  return due
}

function daysUntil(due?: string): number | null {
  if (!due || !/^\d{4}-\d{2}-\d{2}/.test(due)) return null
  const d = new Date(due.slice(0, 10) + 'T12:00:00')
  const t = new Date()
  const start = new Date(t.getFullYear(), t.getMonth(), t.getDate())
  return Math.round((d.getTime() - start.getTime()) / 86400000)
}

export function ProjectDetailPage() {
  const { projectId = '' } = useParams()
  const [search] = useSearchParams()
  const highlight = search.get('m') // milestone label highlight
  const { session } = useDemoSession()
  const { projects, loading } = useProjectsState()
  const localMode = isAuthLocalFallback()

  const project = projects.find((p) => p.id === projectId)
  const allowed =
    project && canAccess(project, session.partnerId, session.role === 'staff')

  if (loading) {
    return (
      <PortalPage>
        <p className="text-sm text-espresso-500">Đang tải engagement…</p>
      </PortalPage>
    )
  }

  if (!project || !allowed) {
    return (
      <PortalPage narrow>
        <PortalEmpty
          title="Không tìm thấy engagement"
          body="Engagement không tồn tại, đã lưu trữ, hoặc bạn không có membership. Liên hệ facilitator nếu cần truy cập."
          action={
            <Link
              to="/portal/projects"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Về danh sách engagement
            </Link>
          }
        />
      </PortalPage>
    )
  }

  const progress = milestoneProgress(project)
  const st = statusVi[project.status] ?? { label: project.status, tone: 'neutral' as const }
  const nextMs = project.milestones.find((m) => !m.done)
  const facilitators = project.members.filter(
    (m) => m.role === 'facilitator' || m.role === 'owner',
  )
  const partners = project.members.filter((m) => m.role === 'partner')

  return (
    <PortalPage>
      <PortalBackLink to="/portal/projects">← Tất cả engagement</PortalBackLink>

      <PortalPageHeader
        eyebrow="Phòng engagement"
        title={project.title}
        description={project.nextAction || 'Engagement do 3HORIZONS điều phối.'}
        action={<PortalStatusPill tone={st.tone}>{st.label}</PortalStatusPill>}
      />

      {localMode ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-50/90 px-4 py-2.5 text-xs text-amber-950">
          Phiên local — dữ liệu demo/localStorage. PDF Storage & RLS cloud cần đăng nhập Supabase
          Auth.
        </div>
      ) : null}

      {/* Hero strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <PortalCard className="sm:col-span-2">
          <PortalSectionLabel>Việc tiếp theo</PortalSectionLabel>
          <p className="mt-2 font-display text-lg font-semibold text-espresso-900">
            {nextMs ? nextMs.label : project.nextAction || 'Chờ mốc từ facilitator'}
          </p>
          {nextMs?.due ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-espresso-500">
              <Calendar className="h-3.5 w-3.5" />
              Hạn {formatDue(nextMs.due)}
              {daysUntil(nextMs.due) != null ? (
                <span
                  className={cn(
                    'ml-1 font-medium',
                    (daysUntil(nextMs.due) ?? 0) < 0
                      ? 'text-terracotta-600'
                      : (daysUntil(nextMs.due) ?? 0) === 0
                        ? 'text-gold-600'
                        : 'text-espresso-600',
                  )}
                >
                  {(daysUntil(nextMs.due) ?? 0) < 0
                    ? `· trễ ${Math.abs(daysUntil(nextMs.due) ?? 0)} ngày`
                    : (daysUntil(nextMs.due) ?? 0) === 0
                      ? '· hôm nay'
                      : `· còn ${daysUntil(nextMs.due)} ngày`}
                </span>
              ) : null}
            </p>
          ) : null}
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-[11px] text-espresso-500">
              <span>Tiến độ mốc</span>
              <span className="font-medium tabular-nums text-espresso-800">{progress}%</span>
            </div>
            <PortalProgress value={progress} gold />
          </div>
        </PortalCard>

        <PortalCard>
          <PortalSectionLabel>Nhịp</PortalSectionLabel>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-espresso-500">Mã</dt>
              <dd className="mt-0.5 font-mono text-xs text-espresso-700">{project.id}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-espresso-500">Hạn engagement</dt>
              <dd className="mt-0.5 font-medium text-espresso-900">
                {project.dueDate ? formatDue(project.dueDate) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-espresso-500">Cập nhật</dt>
              <dd className="mt-0.5 text-espresso-800">{project.updatedAt || '—'}</dd>
            </div>
          </dl>
        </PortalCard>
      </div>

      {/* Timeline */}
      <PortalCard>
        <PortalSectionLabel>Timeline mốc</PortalSectionLabel>
        <ul className="mt-5 space-y-0">
          {project.milestones.length === 0 ? (
            <li className="text-sm text-espresso-500">Chưa có mốc — facilitator sẽ bổ sung.</li>
          ) : (
            project.milestones.map((m, i) => {
              const days = daysUntil(m.due)
              const isHl =
                highlight &&
                m.label.toLowerCase().includes(decodeURIComponent(highlight).toLowerCase())
              return (
                <li
                  key={m.label}
                  id={`milestone-${i}`}
                  className={cn(
                    'relative flex gap-4 border-l-2 py-3 pl-5 transition',
                    m.done
                      ? 'border-espresso-900/20'
                      : days != null && days < 0
                        ? 'border-terracotta-500'
                        : days === 0
                          ? 'border-gold-500'
                          : 'border-gold-600/40',
                    isHl && 'rounded-r-xl bg-gold-500/5',
                  )}
                >
                  <span
                    className={cn(
                      'absolute -left-[9px] top-4 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
                      m.done
                        ? 'bg-espresso-900 text-cream-100'
                        : 'border-2 border-gold-600 bg-white text-transparent',
                    )}
                  >
                    {m.done ? '✓' : ''}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        m.done ? 'text-espresso-500 line-through' : 'text-espresso-900',
                      )}
                    >
                      {m.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-espresso-500">
                      {m.due ? `Hạn ${formatDue(m.due)}` : 'Chưa đặt hạn'}
                      {!m.done && days != null && days < 0
                        ? ` · trễ ${Math.abs(days)} ngày`
                        : !m.done && days === 0
                          ? ' · hôm nay'
                          : !m.done && days != null && days > 0
                            ? ` · còn ${days} ngày`
                            : ''}
                    </p>
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </PortalCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <PortalCard>
          <PortalSectionLabel>Thành viên</PortalSectionLabel>
          <ul className="mt-4 space-y-3">
            {partners.map((m) => (
              <li key={m.partnerId} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso-900 text-[10px] font-semibold text-cream-100">
                  <User className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="font-medium text-espresso-900">{m.displayName}</p>
                  <p className="text-[11px] text-espresso-500">Partner</p>
                </div>
              </li>
            ))}
            {facilitators.map((m) => (
              <li key={m.partnerId + m.role} className="flex items-center gap-3 text-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-200 text-espresso-700">
                  <User className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="font-medium text-espresso-900">{m.displayName}</p>
                  <p className="text-[11px] text-espresso-500">Facilitator · 3HORIZONS</p>
                </div>
              </li>
            ))}
            {!partners.length && !facilitators.length ? (
              <li className="text-sm text-espresso-500">Chưa có thành viên hiển thị.</li>
            ) : null}
          </ul>
        </PortalCard>

        <PortalCard>
          <PortalSectionLabel>Tài liệu & counsel</PortalSectionLabel>
          <p className="mt-3 text-sm leading-relaxed text-espresso-600">
            Brief và SOP gắn engagement sẽ xuất hiện tại đây. Hiện dùng thư viện curated chung.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/portal/documents"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-espresso-900/12 bg-white px-4 text-xs font-semibold text-espresso-900 transition hover:bg-cream-50"
            >
              <FileText className="h-3.5 w-3.5" />
              Thư viện PDF
            </Link>
            <Link
              to="/portal"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-espresso-900 px-4 text-xs font-semibold text-cream-100 transition hover:bg-espresso-800"
            >
              Tổng quan
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-espresso-500">
            Mở <span className="font-medium text-espresso-700">Counsel</span> (góc phải) để hỏi về
            mốc: “{nextMs?.label ?? project.title}”.
          </p>
        </PortalCard>
      </div>
    </PortalPage>
  )
}
