import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, UserPlus } from 'lucide-react'
import {
  PortalCard,
  PortalEmpty,
  PortalPage,
  PortalPageHeader,
  PortalStatusPill,
} from '@/components/portal/PortalUi'
import {
  createReferral,
  CUSTOMER_TYPE_LABELS,
  ENTITY_LABELS,
  formatReferralDate,
  getReferral,
  listReferrals,
  READINESS_LABELS,
  STATUS_LABELS,
  type CreateReferralInput,
  type CustomerType,
  type Readiness,
  type ReceivingEntity,
  type Referral,
  type ReferralStatus,
} from '@/data/referrals'
import { cn } from '@/lib/cn'

const field =
  'h-10 w-full rounded-xl border border-espresso-900/10 bg-white px-3 text-sm text-espresso-900 outline-none focus:border-gold-600/40 focus:ring-2 focus:ring-gold-600/15'
const area =
  'min-h-[5.5rem] w-full rounded-xl border border-espresso-900/10 bg-white px-3 py-2 text-sm text-espresso-900 outline-none focus:border-gold-600/40 focus:ring-2 focus:ring-gold-600/15'

function statusTone(s: ReferralStatus): 'success' | 'warning' | 'neutral' | 'info' {
  if (s === 'converted' || s === 'qualified' || s === 'accepted') return 'success'
  if (s === 'rejected' || s === 'closed') return 'neutral'
  if (s === 'contacted') return 'info'
  return 'warning'
}

export function PartnerReferralsListPage() {
  const [items, setItems] = useState<Referral[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    void listReferrals({ q }).then((res) => {
      setItems(res.items)
      setError(res.error)
      setLoading(false)
    })
  }, [q])

  return (
    <PortalPage>
      <PortalPageHeader
        eyebrow="Giới thiệu"
        title="Referral leads"
        description="Gửi lead khách hàng cho 3HORIZONS Vietnam hoặc WAMEXM. Theo dõi trạng thái xử lý."
        action={
          <Link
            to="/portal/referrals/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-espresso-900 px-4 text-sm font-semibold text-cream-100"
          >
            <Plus className="h-4 w-4" />
            Gửi referral
          </Link>
        }
      />

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm mã REF hoặc tên khách hàng…"
        className={cn(field, 'max-w-md')}
      />

      {error ? <p className="text-sm text-terracotta-600">{error}</p> : null}
      {loading ? <p className="text-sm text-espresso-500">Đang tải…</p> : null}

      {!loading && !items.length ? (
        <PortalEmpty
          title="Chưa có referral"
          body="Gửi lead đầu tiên khi bạn có khách hàng phù hợp với 3HVN hoặc WAMEXM."
          action={
            <Link
              to="/portal/referrals/new"
              className="text-sm font-semibold text-gold-600 hover:underline"
            >
              Tạo referral →
            </Link>
          }
        />
      ) : null}

      {items.length > 0 ? (
        <PortalCard padded={false} className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-espresso-900/8 bg-cream-50 text-[11px] uppercase tracking-wide text-espresso-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Mã</th>
                <th className="px-4 py-3 font-semibold">Khách hàng</th>
                <th className="px-4 py-3 font-semibold">Ngày gửi</th>
                <th className="px-4 py-3 font-semibold">Sẵn sàng</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-900/6">
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-cream-50/80">
                  <td className="px-4 py-3">
                    <Link
                      to={`/portal/referrals/${r.id}`}
                      className="font-mono text-xs font-semibold text-portal-800 hover:underline"
                    >
                      {r.referralCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-espresso-900">{r.customerName}</td>
                  <td className="px-4 py-3 text-xs text-espresso-500">
                    {formatReferralDate(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-xs">{READINESS_LABELS[r.readiness]}</td>
                  <td className="px-4 py-3">
                    <PortalStatusPill tone={statusTone(r.status)}>
                      {STATUS_LABELS[r.status]}
                    </PortalStatusPill>
                  </td>
                  <td className="px-4 py-3 text-xs text-espresso-500">
                    {formatReferralDate(r.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PortalCard>
      ) : null}
    </PortalPage>
  )
}

export function PartnerReferralNewPage() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [receivingEntity, setReceivingEntity] = useState<ReceivingEntity>('3hvn')
  const [customerType, setCustomerType] = useState<CustomerType>('business')
  const [customerName, setCustomerName] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactTitle, setContactTitle] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [location, setLocation] = useState('')
  const [industry, setIndustry] = useState('')
  const [estimatedSize, setEstimatedSize] = useState('')
  const [serviceNeed, setServiceNeed] = useState('')
  const [readiness, setReadiness] = useState<Readiness>('exploring')
  const [preferredContactTime, setPreferredContactTime] = useState('')
  const [notes, setNotes] = useState('')
  const [consent, setConsent] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const input: CreateReferralInput = {
      receivingEntity,
      customerType,
      customerName,
      contactName,
      contactTitle,
      contactEmail,
      contactPhone,
      location,
      industry,
      estimatedSize,
      serviceNeed,
      readiness,
      preferredContactTime,
      notes,
      customerConsent: consent,
    }
    const res = await createReferral(input)
    setBusy(false)
    if (res.error || !res.referral) {
      setError(res.error || 'Gửi thất bại')
      return
    }
    setToast(`Đã gửi referral thành công. Mã giới thiệu: ${res.referral.referralCode}`)
    window.setTimeout(() => {
      navigate(`/portal/referrals/${res.referral!.id}`)
    }, 900)
  }

  return (
    <PortalPage>
      <Link
        to="/portal/referrals"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-espresso-600 hover:text-espresso-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Danh sách referral
      </Link>
      <PortalPageHeader
        eyebrow="Giới thiệu"
        title="Gửi referral"
        description="Chỉ nhập thông tin khách hàng. Thông tin người giới thiệu lấy từ tài khoản đăng nhập."
      />

      {toast ? (
        <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {toast}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-3 text-sm text-terracotta-600">
          {error}
        </div>
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
        <PortalCard className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">
              Bên nhận referral *
            </label>
            <select
              className={field}
              value={receivingEntity}
              onChange={(e) => setReceivingEntity(e.target.value as ReceivingEntity)}
              required
            >
              <option value="3hvn">{ENTITY_LABELS['3hvn']}</option>
              <option value="wamexm">{ENTITY_LABELS.wamexm}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">
              Loại khách hàng *
            </label>
            <select
              className={field}
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value as CustomerType)}
              required
            >
              <option value="individual">{CUSTOMER_TYPE_LABELS.individual}</option>
              <option value="business">{CUSTOMER_TYPE_LABELS.business}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">
              Tên khách hàng / doanh nghiệp *
            </label>
            <input
              className={field}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-espresso-600">
                Người liên hệ chính *
              </label>
              <input
                className={field}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-espresso-600">
                Chức danh
              </label>
              <input
                className={field}
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-espresso-600">
                Số điện thoại *
              </label>
              <input
                className={field}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                inputMode="tel"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-espresso-600">Email</label>
              <input
                className={field}
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-espresso-600">
                Địa điểm / tỉnh thành
              </label>
              <input className={field} value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-espresso-600">
                Lĩnh vực kinh doanh
              </label>
              <input className={field} value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">
              Quy mô ước tính
            </label>
            <input
              className={field}
              value={estimatedSize}
              onChange={(e) => setEstimatedSize(e.target.value)}
              placeholder="Ví dụ: doanh thu 50 tỷ/năm, 100 nhân sự, tài sản đầu tư 10–20 tỷ"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">
              Nhu cầu dịch vụ / vấn đề cần hỗ trợ *
            </label>
            <textarea
              className={area}
              value={serviceNeed}
              onChange={(e) => setServiceNeed(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">
              Mức độ sẵn sàng *
            </label>
            <select
              className={field}
              value={readiness}
              onChange={(e) => setReadiness(e.target.value as Readiness)}
              required
            >
              {(Object.keys(READINESS_LABELS) as Readiness[]).map((k) => (
                <option key={k} value={k}>
                  {READINESS_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">
              Thời điểm phù hợp để liên hệ
            </label>
            <input
              className={field}
              value={preferredContactTime}
              onChange={(e) => setPreferredContactTime(e.target.value)}
              placeholder="VD: tuần sau, sau 15/08, buổi sáng…"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">Ghi chú thêm</label>
            <textarea className={area} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <label className="flex items-start gap-2 rounded-xl border border-espresso-900/10 bg-cream-50 px-3 py-3 text-sm text-espresso-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            <span>
              Tôi xác nhận khách hàng đã đồng ý để 3HORIZONS Vietnam / WAMEXM liên hệ. *
            </span>
          </label>
        </PortalCard>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/portal/referrals"
            className="inline-flex h-11 items-center rounded-full border border-espresso-900/15 px-5 text-sm font-medium text-espresso-700"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-espresso-900 px-5 text-sm font-semibold text-cream-100 disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            {busy ? 'Đang gửi…' : 'Gửi referral'}
          </button>
        </div>
      </form>
    </PortalPage>
  )
}

export function PartnerReferralDetailPage() {
  const { referralId = '' } = useParams()
  const [referral, setReferral] = useState<Referral | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void getReferral(referralId).then((res) => {
      setReferral(res.referral)
      setError(res.error)
      setLoading(false)
    })
  }, [referralId])

  if (loading) {
    return (
      <PortalPage>
        <p className="text-sm text-espresso-500">Đang tải…</p>
      </PortalPage>
    )
  }

  if (!referral) {
    return (
      <PortalPage>
        <PortalEmpty
          title="Không tìm thấy referral"
          body={error || 'Referral không tồn tại hoặc không thuộc tài khoản của bạn.'}
          action={
            <Link to="/portal/referrals" className="text-sm font-semibold text-gold-600">
              Về danh sách
            </Link>
          }
        />
      </PortalPage>
    )
  }

  return (
    <PortalPage>
      <Link
        to="/portal/referrals"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-espresso-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Danh sách
      </Link>
      <PortalPageHeader
        eyebrow={referral.referralCode}
        title={referral.customerName}
        description="Chi tiết read-only sau khi gửi. 3HORIZONS cập nhật trạng thái xử lý."
        action={
          <PortalStatusPill tone={statusTone(referral.status)}>
            {STATUS_LABELS[referral.status]}
          </PortalStatusPill>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <PortalCard className="space-y-3 text-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-espresso-500">
            Khách hàng
          </p>
          <Row label="Loại" value={CUSTOMER_TYPE_LABELS[referral.customerType]} />
          <Row label="Tên" value={referral.customerName} />
          <Row label="Liên hệ" value={referral.contactName} />
          <Row label="Chức danh" value={referral.contactTitle || '—'} />
          <Row label="Điện thoại" value={referral.contactPhone} />
          <Row label="Email" value={referral.contactEmail || '—'} />
          <Row label="Địa điểm" value={referral.location || '—'} />
          <Row label="Ngành" value={referral.industry || '—'} />
          <Row label="Quy mô" value={referral.estimatedSize || '—'} />
        </PortalCard>
        <PortalCard className="space-y-3 text-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-espresso-500">
            Xử lý
          </p>
          <Row label="Bên nhận" value={ENTITY_LABELS[referral.receivingEntity]} />
          <Row label="Sẵn sàng" value={READINESS_LABELS[referral.readiness]} />
          <Row label="Liên hệ lúc" value={referral.preferredContactTime || '—'} />
          <Row label="Ngày gửi" value={formatReferralDate(referral.createdAt)} />
          <Row label="Cập nhật" value={formatReferralDate(referral.updatedAt)} />
          {referral.status === 'rejected' && referral.rejectionReason ? (
            <Row label="Lý do từ chối" value={referral.rejectionReason} />
          ) : null}
          <div>
            <p className="text-xs text-espresso-500">Nhu cầu</p>
            <p className="mt-1 whitespace-pre-wrap text-espresso-800">{referral.serviceNeed}</p>
          </div>
          {referral.notes ? (
            <div>
              <p className="text-xs text-espresso-500">Ghi chú của bạn</p>
              <p className="mt-1 whitespace-pre-wrap text-espresso-800">{referral.notes}</p>
            </div>
          ) : null}
        </PortalCard>
      </div>
    </PortalPage>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-espresso-900/5 pb-2">
      <span className="text-xs text-espresso-500">{label}</span>
      <span className="text-right font-medium text-espresso-900">{value}</span>
    </div>
  )
}
