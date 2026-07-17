import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ActionBtn,
  AdminBadge,
  AdminPageHeader,
  AdminTable,
  FilterBar,
  Td,
  Th,
  fieldClass,
} from '@/components/admin/AdminUi'
import {
  CUSTOMER_TYPE_LABELS,
  ENTITY_LABELS,
  formatReferralDate,
  getReferral,
  listReferralEvents,
  listReferrals,
  listStaffUsersForAssign,
  READINESS_LABELS,
  STATUS_LABELS,
  updateReferralStaff,
  type CustomerType,
  type Readiness,
  type ReceivingEntity,
  type Referral,
  type ReferralEvent,
  type ReferralStatus,
} from '@/data/referrals'

function badgeTone(s: ReferralStatus): 'ok' | 'warn' | 'neutral' | 'info' | 'danger' {
  if (s === 'converted' || s === 'qualified' || s === 'accepted') return 'ok'
  if (s === 'rejected') return 'danger'
  if (s === 'closed') return 'neutral'
  if (s === 'contacted') return 'info'
  return 'warn'
}

export function AdminReferrals() {
  const [items, setItems] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<ReferralStatus | ''>('')
  const [entity, setEntity] = useState<ReceivingEntity | ''>('')
  const [customerType, setCustomerType] = useState<CustomerType | ''>('')
  const [readiness, setReadiness] = useState<Readiness | ''>('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await listReferrals({
      q,
      status,
      receivingEntity: entity,
      customerType,
      readiness,
      staffView: true,
    })
    setItems(res.items)
    setError(res.error)
    setLoading(false)
  }, [q, status, entity, customerType, readiness])

  useEffect(() => {
    void load()
  }, [load])

  function exportCsv() {
    const header = [
      'code',
      'created',
      'referrer',
      'entity',
      'customer',
      'contact',
      'phone',
      'need',
      'readiness',
      'status',
    ]
    const rows = items.map((r) =>
      [
        r.referralCode,
        r.createdAt,
        r.referrerName || r.referrerEmail || r.referrerUserId,
        r.receivingEntity,
        r.customerName,
        r.contactName,
        r.contactPhone,
        r.serviceNeed.replace(/\n/g, ' '),
        r.readiness,
        r.status,
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(','),
    )
    const blob = new Blob([[header.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `referrals-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Referral leads"
        description="Tiếp nhận lead từ Partner · gán owner · cập nhật pipeline."
        actions={
          <ActionBtn onClick={exportCsv} disabled={!items.length}>
            Export CSV
          </ActionBtn>
        }
      />

      {error ? <p className="mb-3 text-sm text-terracotta-600">{error}</p> : null}

      <FilterBar>
        <input
          className={fieldClass() + ' min-w-[10rem] flex-1'}
          placeholder="Search code, khách, contact, partner…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className={fieldClass()}
          value={status}
          onChange={(e) => setStatus(e.target.value as ReferralStatus | '')}
        >
          <option value="">All status</option>
          {(Object.keys(STATUS_LABELS) as ReferralStatus[]).map((k) => (
            <option key={k} value={k}>
              {STATUS_LABELS[k]}
            </option>
          ))}
        </select>
        <select
          className={fieldClass()}
          value={entity}
          onChange={(e) => setEntity(e.target.value as ReceivingEntity | '')}
        >
          <option value="">Bên nhận</option>
          <option value="3hvn">3HVN</option>
          <option value="wamexm">WAMEXM</option>
        </select>
        <select
          className={fieldClass()}
          value={customerType}
          onChange={(e) => setCustomerType(e.target.value as CustomerType | '')}
        >
          <option value="">Loại KH</option>
          <option value="individual">Cá nhân</option>
          <option value="business">Doanh nghiệp</option>
        </select>
        <select
          className={fieldClass()}
          value={readiness}
          onChange={(e) => setReadiness(e.target.value as Readiness | '')}
        >
          <option value="">Sẵn sàng</option>
          {(Object.keys(READINESS_LABELS) as Readiness[]).map((k) => (
            <option key={k} value={k}>
              {READINESS_LABELS[k]}
            </option>
          ))}
        </select>
        <ActionBtn onClick={() => void load()}>{loading ? '…' : 'Refresh'}</ActionBtn>
      </FilterBar>

      <AdminTable>
        <thead>
          <tr>
            <Th>Code</Th>
            <Th>Ngày gửi</Th>
            <Th>Partner</Th>
            <Th>Khách hàng</Th>
            <Th>Nhu cầu</Th>
            <Th>Readiness</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="hover:bg-portal-50/40">
              <Td className="font-mono text-xs font-semibold">{r.referralCode}</Td>
              <Td className="text-xs">{formatReferralDate(r.createdAt)}</Td>
              <Td className="text-xs">
                <p className="font-medium">{r.referrerName || '—'}</p>
                <p className="text-espresso-500">{r.referrerEmail || r.referrerOrganization || ''}</p>
              </Td>
              <Td>
                <p className="font-medium text-espresso-900">{r.customerName}</p>
                <p className="text-[11px] text-espresso-500">
                  {r.contactName} · {r.contactPhone}
                </p>
              </Td>
              <Td className="max-w-[12rem] truncate text-xs">{r.serviceNeed}</Td>
              <Td className="text-xs">{READINESS_LABELS[r.readiness]}</Td>
              <Td>
                <AdminBadge tone={badgeTone(r.status)}>{STATUS_LABELS[r.status]}</AdminBadge>
              </Td>
              <Td>
                <Link to={`/admin/referrals/${r.id}`}>
                  <ActionBtn>Mở</ActionBtn>
                </Link>
              </Td>
            </tr>
          ))}
          {!items.length && !loading ? (
            <tr>
              <Td className="text-sm text-espresso-500">Chưa có referral.</Td>
            </tr>
          ) : null}
        </tbody>
      </AdminTable>
    </div>
  )
}

export function AdminReferralDetail() {
  const { referralId = '' } = useParams()
  const [referral, setReferral] = useState<Referral | null>(null)
  const [events, setEvents] = useState<ReferralEvent[]>([])
  const [staff, setStaff] = useState<{ id: string; name: string; email: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [assignId, setAssignId] = useState('')

  const reload = useCallback(async () => {
    const res = await getReferral(referralId)
    setReferral(res.referral)
    setError(res.error)
    if (res.referral) {
      setAssignId(res.referral.assignedTo || '')
      setRejectReason(res.referral.rejectionReason || '')
      setEvents(await listReferralEvents(res.referral.id))
    }
  }, [referralId])

  useEffect(() => {
    void reload()
    void listStaffUsersForAssign().then(setStaff)
  }, [reload])

  function flash(m: string) {
    setToast(m)
    window.setTimeout(() => setToast(null), 3500)
  }

  async function apply(patch: Parameters<typeof updateReferralStaff>[1]) {
    const err = await updateReferralStaff(referralId, patch)
    flash(err || 'Đã cập nhật')
    void reload()
  }

  if (!referral && !error) {
    return <p className="p-8 text-sm text-espresso-500">Đang tải…</p>
  }
  if (!referral) {
    return (
      <div className="p-8">
        <p className="text-sm text-terracotta-600">{error}</p>
        <Link to="/admin/referrals" className="mt-2 inline-block text-sm text-portal-700">
          ← Danh sách
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/admin/referrals" className="mb-3 inline-block text-xs font-medium text-portal-700">
        ← Referrals
      </Link>
      <AdminPageHeader
        title={referral.customerName}
        description={`${referral.referralCode} · ${ENTITY_LABELS[referral.receivingEntity]} · gửi ${formatReferralDate(referral.createdAt)}`}
        actions={
          <AdminBadge tone={badgeTone(referral.status)}>{STATUS_LABELS[referral.status]}</AdminBadge>
        }
      />

      {toast ? (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          {toast}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <section className="rounded-2xl border border-portal-200 bg-white p-5 text-sm shadow-sm">
            <h2 className="text-sm font-semibold text-espresso-900">Khách hàng</h2>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              <Fact label="Loại" value={CUSTOMER_TYPE_LABELS[referral.customerType]} />
              <Fact label="Tên" value={referral.customerName} />
              <Fact label="Liên hệ" value={referral.contactName} />
              <Fact label="Chức danh" value={referral.contactTitle || '—'} />
              <Fact label="Phone" value={referral.contactPhone} />
              <Fact label="Email" value={referral.contactEmail || '—'} />
              <Fact label="Địa điểm" value={referral.location || '—'} />
              <Fact label="Ngành" value={referral.industry || '—'} />
              <Fact label="Quy mô" value={referral.estimatedSize || '—'} />
              <Fact label="Sẵn sàng" value={READINESS_LABELS[referral.readiness]} />
              <Fact label="Liên hệ lúc" value={referral.preferredContactTime || '—'} />
            </dl>
            <div className="mt-4">
              <p className="text-xs font-medium text-espresso-500">Nhu cầu</p>
              <p className="mt-1 whitespace-pre-wrap text-espresso-800">{referral.serviceNeed}</p>
            </div>
            {referral.notes ? (
              <div className="mt-3">
                <p className="text-xs font-medium text-espresso-500">Ghi chú partner</p>
                <p className="mt-1 whitespace-pre-wrap">{referral.notes}</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-portal-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-espresso-900">Lịch sử</h2>
            <ul className="mt-3 space-y-2 text-xs">
              {events.map((ev) => (
                <li key={ev.id} className="border-b border-portal-50 pb-2">
                  <p className="font-medium text-espresso-800">
                    {ev.eventType}
                    {ev.toStatus ? ` → ${ev.toStatus}` : ''}
                  </p>
                  <p className="text-espresso-500">
                    {formatReferralDate(ev.createdAt)} · {ev.actorEmail || '—'}
                  </p>
                </li>
              ))}
              {!events.length ? <li className="text-espresso-500">Chưa có event</li> : null}
            </ul>
          </section>
        </div>

        <aside className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl border border-portal-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-espresso-900">Partner giới thiệu</h2>
            <p className="mt-2 text-sm font-medium">{referral.referrerName || '—'}</p>
            <p className="text-xs text-espresso-500">{referral.referrerEmail || ''}</p>
            <p className="mt-1 text-xs text-espresso-500">
              Org slug: {referral.referrerOrganization || '—'}
            </p>
            <p className="mt-2 text-[11px] text-espresso-500">
              Consent: {referral.customerConsent ? 'Yes' : 'No'}
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-portal-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-espresso-900">Actions</h2>

            <div>
              <label className="mb-1 block text-xs text-espresso-600">Assign owner</label>
              <div className="flex gap-2">
                <select
                  className={fieldClass() + ' flex-1'}
                  value={assignId}
                  onChange={(e) => setAssignId(e.target.value)}
                >
                  <option value="">— Unassigned —</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ActionBtn
                  onClick={() =>
                    void apply({ assignedTo: assignId || null })
                  }
                >
                  Save
                </ActionBtn>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionBtn variant="primary" onClick={() => void apply({ status: 'accepted' })}>
                Accept
              </ActionBtn>
              <ActionBtn onClick={() => void apply({ status: 'contacted' })}>Contacted</ActionBtn>
              <ActionBtn onClick={() => void apply({ status: 'qualified' })}>Qualified</ActionBtn>
              <ActionBtn onClick={() => void apply({ status: 'converted' })}>Converted</ActionBtn>
              <ActionBtn onClick={() => void apply({ status: 'closed' })}>Close</ActionBtn>
            </div>

            <div>
              <label className="mb-1 block text-xs text-espresso-600">Reject reason *</label>
              <textarea
                className={fieldClass() + ' min-h-[4rem] w-full py-2'}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Bắt buộc khi Reject"
              />
              <ActionBtn
                variant="danger"
                onClick={() =>
                  void apply({ status: 'rejected', rejectionReason: rejectReason })
                }
              >
                Reject
              </ActionBtn>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-espresso-500">{label}</dt>
      <dd className="font-medium text-espresso-900">{value}</dd>
    </div>
  )
}
