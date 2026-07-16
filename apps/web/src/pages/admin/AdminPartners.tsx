import { useMemo, useState } from 'react'
import {
  adminPartners,
  partnerStatusLabels,
  type AdminPartnerRecord,
} from '@/data/admin-seed'
import { listApplications, updateApplicationStatus } from '@/onboarding/storage'
import { adminApi } from '@/lib/production-auth'
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

function statusTone(s: AdminPartnerRecord['status']) {
  if (s === 'published' || s === 'verified') return 'ok' as const
  if (s === 'submitted') return 'warn' as const
  if (s === 'suspended') return 'danger' as const
  return 'neutral' as const
}

function onboardToRecord(): AdminPartnerRecord[] {
  try {
    return listApplications().map((a) => {
      const layers = Array.isArray(a.ecosystemLayers) ? a.ecosystemLayers : []
      const services = Array.isArray(a.servicesOffered) ? a.servicesOffered : []
      const experience = Array.isArray(a.experience) ? a.experience : []
      const certs = Array.isArray(a.certifications) ? a.certifications : []
      const bio = typeof a.bio === 'string' ? a.bio : ''
      const status =
        a.status === 'rejected' || a.status === 'suspended'
          ? 'suspended'
          : a.status === 'published'
            ? 'published'
            : a.status === 'verified'
              ? 'verified'
              : a.status === 'draft'
                ? 'draft'
                : 'submitted'
      return {
        id: a.id || `app-unknown`,
        name: a.fullName || '—',
        title: a.title || '—',
        email: a.email || '—',
        status,
        layers: layers.map((s) => String(s).slice(0, 24)),
        services: services.map(String),
        linkedin: a.linkedinUrl || undefined,
        facebook: a.facebookUrl || undefined,
        enrichmentNotes: a.enrichment
          ? `${a.enrichment.source} · ${a.enrichment.confidence} · reviewed=${a.enrichmentReviewed}`
          : 'Manual entry',
        internalNotes: a.adminNotes || bio.slice(0, 120),
        proofPoints: experience.slice(0, 3).length ? experience.slice(0, 3) : certs.slice(0, 3),
        submittedAt: (a.submittedAt || a.createdAt || '').toString().slice(0, 10) || '—',
        region: a.preferredLanguage === 'en' ? 'International' : 'Việt Nam',
      }
    })
  } catch {
    return []
  }
}

export function AdminPartners() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [tick, setTick] = useState(0)
  const merged = useMemo(() => {
    void tick
    const onboard = onboardToRecord()
    const ids = new Set(onboard.map((p) => p.id))
    return [...onboard, ...adminPartners.filter((p) => !ids.has(p.id))]
  }, [tick])
  const [selected, setSelected] = useState<AdminPartnerRecord | null>(null)
  const [note, setNote] = useState('')
  const [toast, setToast] = useState('')

  const rows = useMemo(() => {
    return merged.filter((p) => {
      const t = `${p.name} ${p.title} ${p.email}`.toLowerCase()
      if (q && !t.includes(q.toLowerCase())) return false
      if (status && p.status !== status) return false
      return true
    })
  }, [q, status, merged])

  async function act(msg: string, id?: string, nextStatus?: AdminPartnerRecord['status']) {
    if (id && nextStatus && id.startsWith('app-')) {
      updateApplicationStatus(id, nextStatus, note)
      setTick((x) => x + 1)
    }
    // Approve / publish → activate Auth user (email confirm + status active)
    if (
      selected?.email &&
      (nextStatus === 'verified' || nextStatus === 'published')
    ) {
      const res = await adminApi('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          action: 'activate_partner',
          email: selected.email,
        }),
      })
      if (res.error) {
        setToast(`${msg} — nhưng activate login: ${res.error}`)
        window.setTimeout(() => setToast(''), 5000)
        return
      }
      setToast(`${msg} · Login đã Active (email confirmed)`)
      window.setTimeout(() => setToast(''), 3500)
      return
    }
    if (selected?.email && nextStatus === 'suspended') {
      // find user via activate list — optional suspend by email through users page
      setToast(msg)
      window.setTimeout(() => setToast(''), 2500)
      return
    }
    setToast(msg)
    window.setTimeout(() => setToast(''), 2500)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Quản lý đối tác"
        description="Duyệt hồ sơ draft → submitted → verified → published. Gán tầng, service line, ghi chú nội bộ và xác minh proof points."
      />
      {toast ? (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          {toast}
        </div>
      ) : null}

      <FilterBar>
        <input
          className={fieldClass() + ' min-w-[200px] flex-1'}
          placeholder="Tìm đối tác…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={fieldClass()} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả status</option>
          {Object.entries(partnerStatusLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </FilterBar>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AdminTable>
            <thead>
              <tr>
                <Th>Đối tác</Th>
                <Th>Status</Th>
                <Th>Layers</Th>
                <Th>Nộp</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className={`cursor-pointer hover:bg-portal-50/50 ${selected?.id === p.id ? 'bg-portal-50' : ''}`}
                  onClick={() => {
                    setSelected(p)
                    setNote(p.internalNotes)
                  }}
                >
                  <Td>
                    <p className="font-medium text-espresso-900">{p.name}</p>
                    <p className="text-xs text-espresso-500">{p.title}</p>
                  </Td>
                  <Td>
                    <AdminBadge tone={statusTone(p.status)}>{partnerStatusLabels[p.status]}</AdminBadge>
                  </Td>
                  <Td className="text-xs">{p.layers.join(' · ')}</Td>
                  <Td className="text-xs text-espresso-500">{p.submittedAt}</Td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <Td className="text-sm text-espresso-500">
                    Chưa có hồ sơ đối tác. Partners từ form /join sẽ xuất hiện tại đây.
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </AdminTable>
        </div>

        <aside className="rounded-2xl border border-portal-200/80 bg-white p-5 shadow-sm lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-portal-600">
                  Review hồ sơ
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold text-espresso-900">
                  {selected.name}
                </h2>
                <p className="text-sm text-espresso-500">{selected.title}</p>
                <div className="mt-2">
                  <AdminBadge tone={statusTone(selected.status)}>
                    {partnerStatusLabels[selected.status]}
                  </AdminBadge>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-espresso-900">Enrichment (LinkedIn / FB)</p>
                <ul className="mt-2 space-y-1 text-xs text-espresso-600">
                  <li>LinkedIn: {selected.linkedin ?? '—'}</li>
                  <li>Facebook: {selected.facebook ?? '—'}</li>
                  <li className="rounded-lg bg-portal-50 p-2">{selected.enrichmentNotes ?? 'Chưa có enrichment'}</li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-semibold text-espresso-900">Ecosystem layers</p>
                <p className="mt-1 text-sm">{selected.layers.join(', ')}</p>
                <p className="mt-2 text-xs font-semibold text-espresso-900">Service lines</p>
                <p className="mt-1 text-sm">{selected.services.join(', ')}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-espresso-900">Proof points</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-espresso-600">
                  {selected.proofPoints.length ? (
                    selected.proofPoints.map((pp) => <li key={pp}>{pp}</li>)
                  ) : (
                    <li className="text-warning">Chưa có proof points — cần bổ sung trước publish</li>
                  )}
                </ul>
              </div>

              <div>
                <label className="text-xs font-semibold text-espresso-900">Internal notes</label>
                <textarea
                  className="mt-1.5 min-h-20 w-full rounded-xl border border-portal-200 p-3 text-sm outline-none focus:border-portal-600"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 border-t border-portal-100 pt-4">
                <ActionBtn
                  variant="primary"
                  onClick={() =>
                    void act(`Đã approve / verify: ${selected.name}`, selected.id, 'verified')
                  }
                >
                  Approve + Active login
                </ActionBtn>
                <ActionBtn
                  onClick={() =>
                    void act(`Đã publish: ${selected.name}`, selected.id, 'published')
                  }
                >
                  Publish + Active login
                </ActionBtn>
                <ActionBtn
                  variant="danger"
                  onClick={() =>
                    void act(`Đã reject / suspend: ${selected.name}`, selected.id, 'suspended')
                  }
                >
                  Reject / Suspend
                </ActionBtn>
                <ActionBtn
                  onClick={() =>
                    void act('Đã lưu internal notes', selected.id, selected.status)
                  }
                >
                  Lưu notes
                </ActionBtn>
                <p className="w-full text-[11px] text-espresso-500">
                  Approve/Publish sẽ bật login portal (status active + email confirmed) cho{' '}
                  <span className="font-medium">{selected.email}</span>.
                </p>
              </div>
              {selected.linkedin ? (
                <p className="text-[11px] text-espresso-500 break-all">LinkedIn: {selected.linkedin}</p>
              ) : null}
              {selected.facebook ? (
                <p className="text-[11px] text-espresso-500 break-all">Facebook: {selected.facebook}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-espresso-500">Chọn đối tác để review.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
