import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CircleHelp,
  CreditCard,
  ExternalLink,
  FileText,
  Shield,
  User,
} from 'lucide-react'
import { DocumentPreview, type PreviewDoc } from '@/components/portal/DocumentPreview'
import {
  PortalBackLink,
  PortalCard,
  PortalEmpty,
  PortalGhostBtn,
  PortalPage,
  PortalPageHeader,
  PortalProgress,
  PortalSectionLabel,
  PortalStatusPill,
} from '@/components/portal/PortalUi'
import {
  fileTypeLabel,
  formatFileSize,
  getSignedDownloadUrl,
  isPdf,
  listDocuments,
  type DocumentRow,
} from '@/data/documents'
import { milestoneProgress, usePartnerProjects, useProjectsState } from '@/data/projects-store'
import { useDemoSession } from '@/hooks/useDemoSession'
import { usePartnerStanding } from '@/lib/standing'

/* ─── Documents (published only) ────────────────────────── */

function formatDocDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso.slice(0, 10)
  }
}

export function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [preview, setPreview] = useState<PreviewDoc | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void listDocuments({ q, staffView: false }).then((res) => {
      if (cancelled) return
      setDocs(res.docs)
      setError(res.error)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [q])

  async function viewDoc(d: DocumentRow) {
    if (!isPdf(d)) {
      // Non-PDF: download only metadata modal without pdf frame
      setPreview({
        title: d.title,
        type: fileTypeLabel(d),
        tag: d.tags[0] || 'Document',
        body: d.description
          ? [d.description, `${d.fileName} · ${formatFileSize(d.fileSize)}`]
          : [`${d.fileName} · ${formatFileSize(d.fileSize)}`, 'Dùng Download để tải file.'],
        loading: false,
        pdfUrl: null,
      })
      return
    }
    setPreview({
      title: d.title,
      type: 'PDF',
      tag: d.tags[0] || 'Document',
      body: d.description ? [d.description] : undefined,
      loading: true,
      pdfUrl: null,
    })
    const { url, error: urlErr } = await getSignedDownloadUrl(d.filePath)
    setPreview({
      title: d.title,
      type: 'PDF',
      tag: formatFileSize(d.fileSize),
      body: d.description ? [d.description] : undefined,
      loading: false,
      pdfUrl: url,
      error: urlErr || undefined,
    })
  }

  async function downloadDoc(d: DocumentRow) {
    const { url, error: urlErr } = await getSignedDownloadUrl(d.filePath)
    if (urlErr || !url) {
      setError(urlErr || 'Không tải được file')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <PortalPage>
      <PortalPageHeader
        eyebrow="Thư viện"
        title="Documents"
        description="Tài liệu đã publish. Tìm theo tiêu đề hoặc tags."
      />

      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title or tags…"
          className="h-9 min-w-[12rem] flex-1 rounded-lg border border-espresso-900/10 bg-white px-3 text-sm outline-none focus:border-gold-600/40"
        />
      </div>

      {error ? (
        <PortalCard>
          <p className="text-sm text-terracotta-600">{error}</p>
          <Link to="/login" className="mt-3 inline-flex text-sm font-medium text-gold-600 hover:underline">
            Đăng nhập
          </Link>
        </PortalCard>
      ) : null}

      {loading ? <p className="text-sm text-espresso-500">Đang tải…</p> : null}

      {!loading && !error && docs.length === 0 ? (
        <PortalEmpty
          title="Chưa có tài liệu"
          body="Chưa có tài liệu Published. 3HORIZONS sẽ publish khi sẵn sàng."
        />
      ) : null}

      {docs.length > 0 ? (
        <PortalCard padded={false} className="overflow-hidden">
          <ul className="divide-y divide-espresso-900/6">
            {docs.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-cream-50 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-espresso-700">
                  <FileText className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-espresso-900">{d.title}</p>
                  <p className="mt-0.5 text-[11px] text-espresso-500">
                    {fileTypeLabel(d)} · {formatFileSize(d.fileSize)} · {formatDocDate(d.updatedAt)}
                  </p>
                  {d.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-espresso-500">{d.description}</p>
                  ) : null}
                  {d.tags.length ? (
                    <p className="mt-1 text-[11px] text-portal-700">{d.tags.join(' · ')}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <PortalGhostBtn onClick={() => void viewDoc(d)}>View</PortalGhostBtn>
                  <PortalGhostBtn onClick={() => void downloadDoc(d)}>Download</PortalGhostBtn>
                </div>
              </li>
            ))}
          </ul>
        </PortalCard>
      ) : null}

      <DocumentPreview doc={preview} onClose={() => setPreview(null)} />
    </PortalPage>
  )
}

/* ─── Training / Năng lực ───────────────────────────────── */

export function TrainingPage() {
  const modules = [
    {
      title: 'Nền tảng onboarding partner',
      progress: 80,
      status: 'Đang theo',
      tone: 'warning' as const,
    },
    {
      title: 'Tầng hệ sinh thái T1–T7',
      progress: 100,
      status: 'Đạt chuẩn',
      tone: 'success' as const,
    },
    {
      title: 'Điều phối workshop chiến lược',
      progress: 35,
      status: 'Đang theo',
      tone: 'warning' as const,
    },
    {
      title: 'Chuẩn mực collaboration 3HORIZONS',
      progress: 0,
      status: 'Chưa mở',
      tone: 'neutral' as const,
    },
  ]

  return (
    <PortalPage>
      <PortalPageHeader
        eyebrow="Năng lực"
        title="Chuẩn mực & enablement"
        description="Lộ trình gọn, không gamification — hoàn thành cốt lõi trước engagement mới."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <PortalCard key={m.title}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-espresso-700">
                  <BookOpen className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-espresso-900">{m.title}</p>
                  <div className="mt-1.5">
                    <PortalStatusPill tone={m.tone}>{m.status}</PortalStatusPill>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium tabular-nums text-espresso-600">{m.progress}%</span>
            </div>
            <div className="mt-5">
              <PortalProgress value={m.progress} gold={m.progress > 0 && m.progress < 100} />
            </div>
          </PortalCard>
        ))}
      </div>
    </PortalPage>
  )
}

/* ─── Engagement / Projects ─────────────────────────────── */

const projectStatusVi: Record<string, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Đang dẫn dắt', tone: 'success' },
  paused: { label: 'Tạm dừng', tone: 'warning' },
  archived: { label: 'Lưu trữ', tone: 'neutral' },
}

export function ProjectsPage() {
  const { session } = useDemoSession()
  const { loading, error } = useProjectsState()
  const myProjects = usePartnerProjects(session.partnerId, false)

  return (
    <PortalPage>
      <PortalPageHeader
        eyebrow="Engagement"
        title="Engagement đang mở"
        description="Chỉ engagement bạn được gán. Mở phòng làm việc để xem timeline mốc."
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-espresso-500">
        <span>
          Standing:{' '}
          <span className="font-medium text-espresso-800">{session.name}</span>
        </span>
        {loading ? <span>· đang tải…</span> : null}
        {error ? <span className="text-terracotta-600">{error}</span> : null}
      </div>

      {myProjects.length === 0 ? (
        <PortalEmpty
          title="Chưa có engagement mở"
          body="Khi 3HORIZONS mở collaboration và gán bạn vào membership, engagement xuất hiện tại đây — đúng người, đúng lúc."
          action={
            <Link
              to="/portal/network"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:underline"
            >
              Tham chiếu hệ sinh thái
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {myProjects.map((p) => {
            const progress = milestoneProgress(p)
            const st = projectStatusVi[p.status] ?? { label: p.status, tone: 'neutral' as const }
            const nextMs = p.milestones.find((m) => !m.done)
            return (
              <Link key={p.id} to={`/portal/projects/${p.id}`} className="group block">
                <PortalCard className="transition group-hover:border-espresso-900/15">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <PortalSectionLabel>Engagement</PortalSectionLabel>
                      <p className="mt-1.5 font-display text-lg font-semibold tracking-tight text-espresso-900 group-hover:text-gold-600">
                        {p.title}
                      </p>
                      <p className="mt-1 text-[11px] text-espresso-500">
                        {p.dueDate ? `Hạn ${p.dueDate}` : 'Chưa đặt hạn tổng'}
                      </p>
                    </div>
                    <PortalStatusPill tone={st.tone}>{st.label}</PortalStatusPill>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-espresso-600">{p.nextAction}</p>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-[11px] text-espresso-500">
                      <span>Tiến độ mốc</span>
                      <span className="font-medium tabular-nums text-espresso-800">{progress}%</span>
                    </div>
                    <PortalProgress value={progress} gold />
                    {nextMs ? (
                      <p className="mt-2.5 text-xs text-espresso-500">
                        Mốc tiếp theo:{' '}
                        <span className="font-medium text-espresso-800">{nextMs.label}</span>
                        {nextMs.due ? ` · ${nextMs.due}` : ''}
                      </p>
                    ) : null}
                  </div>

                  <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-espresso-800 group-hover:text-gold-600">
                    Vào phòng engagement
                    <ArrowRight className="h-3.5 w-3.5" />
                  </p>
                </PortalCard>
              </Link>
            )
          })}
        </div>
      )}
    </PortalPage>
  )
}

/* ─── Ecosystem / Network ───────────────────────────────── */

export function PortalNetworkPage() {
  return (
    <PortalPage narrow>
      <PortalPageHeader
        eyebrow="Hệ sinh thái"
        title="Tham chiếu mạng lưới chọn lọc"
        description="Taxonomy vấn đề, tầng T1–T7 và hồ sơ đã xác minh. Matching do 3HORIZONS điều phối — không gửi từ không gian partner."
      />

      <PortalCard>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-espresso-900 text-cream-100">
            <ExternalLink className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold text-espresso-900">
              Phòng trưng bày công khai
            </p>
            <p className="mt-2 text-sm leading-relaxed text-espresso-500">
              Mở taxonomy và danh bạ để hiểu hệ sinh thái — không phải chợ freelancer, không tự
              gửi yêu cầu match từ đây.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/problems"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-espresso-900 px-5 text-sm font-semibold text-cream-100 transition hover:bg-espresso-800"
              >
                Xem theo vấn đề
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/partners"
                className="inline-flex h-10 items-center rounded-full border border-espresso-900/12 bg-white px-5 text-sm font-medium text-espresso-800 transition hover:bg-cream-50"
              >
                Danh bạ verified
              </Link>
            </div>
          </div>
        </div>
      </PortalCard>

      <PortalCard className="bg-cream-50/80">
        <PortalSectionLabel>Ghi nhớ</PortalSectionLabel>
        <p className="mt-2 text-sm leading-relaxed text-espresso-600">
          Engagement và collaboration chỉ mở khi desk 3HORIZONS gán membership. Counsel (Nexus)
          hỗ trợ làm rõ vấn đề — không thay matching desk.
        </p>
      </PortalCard>
    </PortalPage>
  )
}

/* ─── Account / Hồ sơ ───────────────────────────────────── */

export function AccountPage() {
  const { session } = useDemoSession()
  const { standing, loading } = usePartnerStanding(session)

  return (
    <PortalPage narrow>
      <PortalPageHeader
        eyebrow="Hồ sơ"
        title="Standing của bạn"
        description="Danh tính trong mạng lưới chọn lọc — đồng bộ profile Supabase khi đã đăng nhập."
      />

      <PortalCard className="paper-texture">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-espresso-900 text-lg font-semibold tracking-wide text-cream-100">
            {standing.initials}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-xl font-semibold text-espresso-900">{standing.name}</p>
              {standing.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-gold-600/25 bg-gold-500/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-600">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-espresso-500">{standing.email}</p>
            <p className="mt-1 text-[10px] text-espresso-500">
              {loading
                ? 'Đang tải standing…'
                : standing.source === 'supabase'
                  ? 'Nguồn: Supabase profile / partners'
                  : 'Nguồn: standing local (fallback)'}
            </p>
          </div>
        </div>

        <dl className="mt-8 grid gap-5 border-t border-espresso-900/6 pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-espresso-500">Tầng trọng tâm</dt>
            <dd className="mt-1 text-sm font-medium text-espresso-900">{standing.focusLayers}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-espresso-500">Khu vực</dt>
            <dd className="mt-1 text-sm font-medium text-espresso-900">{standing.region}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-espresso-500">Trạng thái</dt>
            <dd className="mt-1 text-sm font-medium text-espresso-900">{standing.statusLabel}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-espresso-500">Thành viên từ</dt>
            <dd className="mt-1 text-sm font-medium text-espresso-900">{standing.memberSince}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] uppercase tracking-wider text-espresso-500">Partner ID</dt>
            <dd className="mt-1 font-mono text-sm font-medium text-espresso-900">{standing.partnerId}</dd>
          </div>
        </dl>
      </PortalCard>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { to: '/portal/account/security', label: 'Bảo mật', icon: Shield, desc: 'Mật khẩu & phiên' },
          { to: '/portal/account/billing', label: 'Thanh toán', icon: CreditCard, desc: 'Sao kê engagement' },
          { to: '/portal/account/activity', label: 'Nhật ký', icon: Activity, desc: 'Sự kiện gần đây' },
          { to: '/portal/account/help', label: 'Hướng dẫn', icon: CircleHelp, desc: 'Cách dùng không gian' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="group">
            <PortalCard className="h-full transition group-hover:border-espresso-900/15">
              <item.icon className="h-5 w-5 text-espresso-700" strokeWidth={1.75} />
              <p className="mt-3 text-sm font-semibold text-espresso-900 group-hover:text-gold-600">
                {item.label}
              </p>
              <p className="mt-0.5 text-xs text-espresso-500">{item.desc}</p>
            </PortalCard>
          </Link>
        ))}
      </div>
    </PortalPage>
  )
}

function AccountSubPage({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string
  description: string
  icon: typeof User
  children: ReactNode
}) {
  return (
    <PortalPage narrow>
      <PortalPageHeader eyebrow="Hồ sơ" title={title} description={description} />
      <PortalCard>
        <div className="mb-5 flex items-center gap-2 text-espresso-700">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
          <PortalSectionLabel>{title}</PortalSectionLabel>
        </div>
        {children}
      </PortalCard>
      <PortalBackLink to="/portal/account">← Về standing</PortalBackLink>
    </PortalPage>
  )
}

export function SecurityPage() {
  return (
    <AccountSubPage
      title="Bảo mật"
      description="Mật khẩu, xác thực hai yếu tố và phiên đăng nhập."
      icon={Shield}
    >
      <ul className="space-y-0 text-sm text-espresso-600">
        <li className="flex items-center justify-between border-b border-espresso-900/6 py-3.5">
          <span>Mật khẩu</span>
          <button type="button" className="font-medium text-espresso-900 hover:text-gold-600">
            Đổi
          </button>
        </li>
        <li className="flex items-center justify-between border-b border-espresso-900/6 py-3.5">
          <span>Xác thực hai yếu tố</span>
          <PortalStatusPill tone="warning">Chưa bật</PortalStatusPill>
        </li>
        <li className="flex items-center justify-between py-3.5">
          <span>Phiên đăng nhập</span>
          <span className="text-espresso-500">1 thiết bị</span>
        </li>
      </ul>
    </AccountSubPage>
  )
}

export function BillingPage() {
  return (
    <AccountSubPage
      title="Thanh toán"
      description="Engagement do 3HORIZONS quản lý thương mại — portal không phải marketplace."
      icon={CreditCard}
    >
      <p className="text-sm leading-relaxed text-espresso-600">
        Không có hoá đơn mở. Sao kê và điều khoản engagement được facilitator chia sẻ khi có
        collaboration active.
      </p>
    </AccountSubPage>
  )
}

export function ActivityPage() {
  const events = [
    { t: '13/07, 09:12', e: 'Đăng nhập từ TP. Hồ Chí Minh' },
    { t: '12/07, 16:40', e: 'Cập nhật hồ sơ năng lực' },
    { t: '10/07, 11:05', e: 'Mở Bộ tài liệu nền' },
    { t: '08/07, 08:22', e: 'Đạt chuẩn: Tầng hệ sinh thái T1–T7' },
  ]
  return (
    <AccountSubPage
      title="Nhật ký"
      description="Sự kiện bảo mật và hoạt động gần đây trong không gian riêng."
      icon={Activity}
    >
      <ul className="divide-y divide-espresso-900/6">
        {events.map((ev) => (
          <li
            key={ev.t + ev.e}
            className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm text-espresso-800">{ev.e}</span>
            <span className="text-[11px] tabular-nums text-espresso-500">{ev.t}</span>
          </li>
        ))}
      </ul>
    </AccountSubPage>
  )
}

export function HelpPage() {
  return (
    <AccountSubPage
      title="Hướng dẫn"
      description="Cách dùng private workspace và hệ sinh thái hiệu quả."
      icon={CircleHelp}
    >
      <ol className="list-decimal space-y-3 pl-4 text-sm leading-relaxed text-espresso-600">
        <li>
          <span className="font-medium text-espresso-900">Tổng quan</span> — ưu tiên hôm nay và
          engagement đang dẫn dắt.
        </li>
        <li>
          <span className="font-medium text-espresso-900">Engagement</span> — collaboration do
          3HORIZONS gán; không tự tạo.
        </li>
        <li>
          <span className="font-medium text-espresso-900">Tài liệu & Năng lực</span> — chuẩn mực
          trước khi nhận engagement mới.
        </li>
        <li>
          <span className="font-medium text-espresso-900">Hệ sinh thái</span> — tham chiếu công
          khai; matching không gửi từ đây.
        </li>
        <li>
          <span className="font-medium text-espresso-900">Counsel (Nexus)</span> — hỏi chiến lược /
          mốc; liên hệ facilitator cho vận hành engagement.
        </li>
      </ol>
    </AccountSubPage>
  )
}
