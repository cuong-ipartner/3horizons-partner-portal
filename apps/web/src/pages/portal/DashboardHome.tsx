import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, FileText, Sparkles } from 'lucide-react'
import { milestoneProgress, usePartnerProjects } from '@/data/projects-store'
import { useDemoSession } from '@/hooks/useDemoSession'
import { buildDecisionsFromProjects, computeDayPriority } from '@/lib/priority'
import { usePartnerStanding } from '@/lib/standing'
import { cn } from '@/lib/cn'

const curatedDocs = [
  { name: 'Bộ tài liệu nền — Mạng lưới đối tác', meta: 'Nền tảng · PDF' },
  { name: 'SOP: Điều phối workshop chiến lược', meta: 'Chuẩn mực · DOCX' },
  { name: 'Tóm tắt quản trị AI cho HĐQT', meta: 'Insight · PDF' },
]

function greetingLabel(d = new Date()) {
  const h = d.getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

function formatLongDate(d = new Date()) {
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DashboardHome() {
  const { session } = useDemoSession()
  const { standing } = usePartnerStanding(session)
  const myProjects = usePartnerProjects(session.partnerId, false)
  const primary = myProjects.find((p) => p.status === 'active') ?? myProjects[0]
  const progress = primary ? milestoneProgress(primary) : 0
  const nextMilestone = primary?.milestones.find((m) => !m.done)
  const priority = computeDayPriority(myProjects)
  const decisions = buildDecisionsFromProjects(myProjects)

  return (
    <div className="mx-auto max-w-[1120px] space-y-10 pb-4 animate-portal-in">
      {/* Hero — dark band + real priority */}
      <section className="relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-espresso-900 via-navy-900 to-portal-900 text-cream-100 shadow-card">
        <div className="pointer-events-none absolute inset-0 paper-texture opacity-30 mix-blend-overlay" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-portal-violet/15 blur-3xl" />

        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-500/90">
              Private workspace · 3HORIZONS
            </p>
            {standing.verified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-cream-100">
                <BadgeCheck className="h-3.5 w-3.5 text-gold-500" strokeWidth={1.75} />
                Verified Partner
              </span>
            ) : null}
          </div>

          <p className="mt-5 text-sm text-cream-200/80">{greetingLabel()},</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-white sm:text-[2.35rem] sm:leading-tight">
            {standing.name}
          </h1>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-cream-300/50">
            {formatLongDate()}
          </p>

          <div className="mt-8 max-w-2xl border-l-2 border-gold-500/70 pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-500/90">
              Ưu tiên hôm nay
            </p>
            <p className="mt-2 text-base leading-relaxed text-cream-100/95 sm:text-lg">
              {priority.line}
            </p>
            <p className="mt-2 text-[11px] text-cream-300/55">{priority.meta}</p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={priority.ctaTo}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-cream-100 px-5 text-sm font-semibold text-espresso-900 transition hover:bg-white"
            >
              {priority.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/portal/documents"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-medium text-cream-100 transition hover:border-white/40 hover:bg-white/5"
            >
              Tài liệu curated
            </Link>
          </div>
        </div>
      </section>

      {/* Engagement + Decisions from data */}
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-[1.25rem] border border-espresso-900/8 bg-white p-6 shadow-soft paper-texture lg:col-span-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                Engagement đang dẫn dắt
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold text-espresso-900">
                Collaboration
              </h2>
            </div>
            <Link
              to="/portal/projects"
              className="text-xs font-medium text-espresso-600 underline-offset-4 hover:text-espresso-900 hover:underline"
            >
              Tất cả
            </Link>
          </div>

          {primary ? (
            <div className="mt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-semibold tracking-tight text-espresso-900">
                    {primary.title}
                  </p>
                  <p className="mt-1 text-xs text-espresso-500">
                    {primary.id}
                    {primary.dueDate ? ` · Hạn ${primary.dueDate}` : ''}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                    primary.status === 'active'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/15 text-warning',
                  )}
                >
                  {primary.status === 'active'
                    ? 'Đang dẫn dắt'
                    : primary.status === 'paused'
                      ? 'Tạm dừng'
                      : primary.status}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-espresso-600">{primary.nextAction}</p>

              <div className="mt-6">
                <div className="flex items-center justify-between text-[11px] text-espresso-500">
                  <span>Tiến độ mốc</span>
                  <span className="font-medium tabular-nums text-espresso-800">{progress}%</span>
                </div>
                <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-cream-200">
                  <div
                    className="h-full rounded-full bg-gold-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {nextMilestone ? (
                  <p className="mt-3 text-xs text-espresso-500">
                    Mốc tiếp theo:{' '}
                    <span className="font-medium text-espresso-800">{nextMilestone.label}</span>
                    {nextMilestone.due ? ` · ${nextMilestone.due}` : ''}
                  </p>
                ) : null}
              </div>

              <Link
                to={`/portal/projects/${primary.id}`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-espresso-900 transition hover:text-gold-600"
              >
                Vào phòng engagement
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-espresso-900/10 bg-cream-50/80 px-6 py-10 text-center">
              <p className="font-display text-base font-semibold text-espresso-900">
                Chưa có engagement mở
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-espresso-500">
                Khi 3HORIZONS mở collaboration và gán bạn vào membership, engagement sẽ xuất hiện
                tại đây — im lặng, đúng người, đúng lúc.
              </p>
              <Link
                to="/portal/network"
                className="mt-5 inline-flex text-sm font-medium text-gold-600 hover:underline"
              >
                Tham chiếu hệ sinh thái
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-[1.25rem] border border-espresso-900/8 bg-white p-6 shadow-soft lg:col-span-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
            Việc cần bạn
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-espresso-900">
            Quyết định & chuẩn bị
          </h2>
          <ul className="mt-5 divide-y divide-espresso-900/6">
            {decisions.map((d) => (
              <li key={d.id}>
                <Link
                  to={d.to}
                  className="group flex flex-col gap-0.5 py-3.5 transition first:pt-0 last:pb-0"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-espresso-900 group-hover:text-gold-600">
                    {d.urgency === 'now' ? (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta-500" />
                    ) : d.urgency === 'soon' ? (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    ) : (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-espresso-900/20" />
                    )}
                    {d.title}
                  </span>
                  <span className="pl-3.5 text-[11px] text-espresso-500">{d.meta}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Standing from profile / partners */}
      <section className="rounded-[1.25rem] border border-espresso-900/8 bg-gradient-to-r from-cream-50 to-white px-6 py-5 shadow-soft paper-texture sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
            Standing
          </p>
          <span className="text-[10px] text-espresso-500">
            {standing.source === 'supabase' ? 'Đồng bộ Supabase' : 'Standing demo'}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold text-espresso-900">{standing.name}</p>
            <p className="mt-1 text-sm text-espresso-500">
              Tầng trọng tâm{' '}
              <span className="font-medium text-espresso-800">{standing.focusLayers}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-espresso-500">Trạng thái</p>
              <p className="mt-0.5 font-medium text-espresso-900">{standing.statusLabel}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-espresso-500">Khu vực</p>
              <p className="mt-0.5 font-medium text-espresso-900">{standing.region}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-espresso-500">Thành viên từ</p>
              <p className="mt-0.5 font-medium text-espresso-900">{standing.memberSince}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Library strip */}
      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-[1.25rem] border border-espresso-900/8 bg-white p-5 shadow-soft md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                Thư viện
              </p>
              <h2 className="mt-1 font-display text-base font-semibold text-espresso-900">
                Tài liệu curated
              </h2>
            </div>
            <Link
              to="/portal/documents"
              className="text-xs font-medium text-espresso-600 hover:text-espresso-900 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <ul className="mt-4 space-y-2">
            {curatedDocs.map((d) => (
              <li
                key={d.name}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-cream-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-espresso-700">
                  <FileText className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-espresso-900">{d.name}</p>
                  <p className="text-[11px] text-espresso-500">{d.meta}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col rounded-[1.25rem] border border-espresso-900/8 bg-white p-5 shadow-soft">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
            Năng lực
          </p>
          <h2 className="mt-1 font-display text-base font-semibold text-espresso-900">
            Chuẩn mực partner
          </h2>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-espresso-500">
            Lộ trình enablement gọn — không gamification. Hoàn thành module cốt lõi trước khi nhận
            engagement mới.
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-espresso-500">
              <span>Onboarding nền tảng</span>
              <span className="tabular-nums font-medium text-espresso-800">80%</span>
            </div>
            <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-cream-200">
              <div className="h-full w-[80%] rounded-full bg-espresso-800 transition-all duration-300" />
            </div>
          </div>
          <Link
            to="/portal/training"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-espresso-900 hover:text-gold-600"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            Tiếp tục lộ trình
          </Link>
        </section>
      </div>
    </div>
  )
}
