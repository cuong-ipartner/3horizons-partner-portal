import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, FileText } from 'lucide-react'
import { listProductionDocuments, type ProductionDocument } from '@/data/production-library'
import { milestoneProgress, usePartnerProjects } from '@/data/projects-store'
import { useDemoSession } from '@/hooks/useDemoSession'
import { buildDecisionsFromProjects, computeDayPriority } from '@/lib/priority'
import { usePartnerStanding } from '@/lib/standing'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

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
  const [recentDocs, setRecentDocs] = useState<ProductionDocument[]>([])

  useEffect(() => {
    void listProductionDocuments({}).then((res) => {
      setRecentDocs(res.docs.slice(0, 5))
    })
  }, [])

  return (
    <div className="mx-auto max-w-[1120px] space-y-10 pb-4 animate-portal-in">
      <section className="relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-espresso-900 via-navy-900 to-portal-900 text-cream-100 shadow-card">
        <div className="pointer-events-none absolute inset-0 paper-texture opacity-30 mix-blend-overlay" />
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
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-white sm:text-[2.35rem]">
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

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={priority.ctaTo}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-cream-100 px-5 text-sm font-semibold text-espresso-900 transition hover:bg-white"
            >
              {priority.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/portal/documents"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm font-medium text-cream-100 transition hover:bg-white/5"
            >
              Tài liệu
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-[1.25rem] border border-espresso-900/8 bg-white p-6 shadow-soft lg:col-span-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                Engagement
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold text-espresso-900">
                Đang dẫn dắt
              </h2>
            </div>
            <Link to="/portal/projects" className="text-xs font-medium text-espresso-600 hover:underline">
              Tất cả
            </Link>
          </div>

          {primary ? (
            <div className="mt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-semibold text-espresso-900">{primary.title}</p>
                  <p className="mt-1 text-xs text-espresso-500">
                    {primary.dueDate ? `Hạn ${primary.dueDate}` : '—'}
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
                  {primary.status === 'active' ? 'Đang dẫn dắt' : primary.status}
                </span>
              </div>
              <p className="mt-4 text-sm text-espresso-600">{primary.nextAction}</p>
              <div className="mt-6">
                <div className="flex justify-between text-[11px] text-espresso-500">
                  <span>Tiến độ mốc</span>
                  <span className="font-medium tabular-nums">{progress}%</span>
                </div>
                <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-cream-200">
                  <div className="h-full rounded-full bg-gold-600" style={{ width: `${progress}%` }} />
                </div>
                {nextMilestone ? (
                  <p className="mt-3 text-xs text-espresso-500">
                    Mốc tiếp theo:{' '}
                    <span className="font-medium text-espresso-800">{nextMilestone.label}</span>
                  </p>
                ) : null}
              </div>
              <Link
                to={`/portal/projects/${primary.id}`}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-espresso-900 hover:text-gold-600"
              >
                Vào phòng engagement
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-espresso-900/10 bg-cream-50/80 px-6 py-10 text-center">
              <p className="font-display text-base font-semibold text-espresso-900">
                Chưa có engagement
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-espresso-500">
                Khi 3HORIZONS mở collaboration và gán membership, engagement sẽ xuất hiện tại đây.
              </p>
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
          {decisions.length === 0 ? (
            <p className="mt-6 text-sm text-espresso-500">Không có việc mở từ engagement hiện tại.</p>
          ) : (
            <ul className="mt-5 divide-y divide-espresso-900/6">
              {decisions.map((d) => (
                <li key={d.id}>
                  <Link to={d.to} className="group flex flex-col gap-0.5 py-3.5">
                    <span className="text-sm font-medium text-espresso-900 group-hover:text-gold-600">
                      {d.title}
                    </span>
                    <span className="text-[11px] text-espresso-500">{d.meta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-[1.25rem] border border-espresso-900/8 bg-gradient-to-r from-cream-50 to-white px-6 py-5 shadow-soft sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">Standing</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold text-espresso-900">{standing.name}</p>
            <p className="mt-1 text-sm text-espresso-500">
              {standing.focusLayers || '—'}
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-espresso-500">Trạng thái</p>
              <p className="mt-0.5 font-medium text-espresso-900">{standing.statusLabel}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-espresso-500">Khu vực</p>
              <p className="mt-0.5 font-medium text-espresso-900">{standing.region || '—'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.25rem] border border-espresso-900/8 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
              Tài liệu
            </p>
            <h2 className="mt-1 font-display text-base font-semibold text-espresso-900">
              Mới publish
            </h2>
          </div>
          <Link to="/portal/documents" className="text-xs font-medium text-espresso-600 hover:underline">
            Thư viện
          </Link>
        </div>
        {recentDocs.length === 0 ? (
          <p className="mt-4 text-sm text-espresso-500">Chưa có tài liệu publish.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recentDocs.map((d) => (
              <li key={d.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-espresso-700">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-espresso-900">{d.title}</p>
                  <p className="text-[11px] text-espresso-500">
                    v{d.version}
                    {d.ecosystemLayer ? ` · ${d.ecosystemLayer}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
