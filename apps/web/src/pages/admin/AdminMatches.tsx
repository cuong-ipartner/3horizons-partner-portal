import { useMemo, useState } from 'react'
import { adminMatches, matchStatusLabels, type AdminMatchItem } from '@/data/admin-seed'
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

function stTone(s: AdminMatchItem['status']) {
  if (s === 'human_review' || s === 'ai_suggested') return 'warn' as const
  if (s === 'in_project' || s === 'assigned') return 'ok' as const
  if (s === 'closed') return 'neutral' as const
  return 'info' as const
}

export function AdminMatches() {
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<AdminMatchItem | null>(
    adminMatches.find((m) => m.status === 'human_review') ?? adminMatches[0],
  )
  const [toast, setToast] = useState('')

  const rows = useMemo(() => {
    return adminMatches.filter((m) => !status || m.status === status)
  }, [status])

  function act(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2500)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Yêu cầu match"
        description="Queue → AI gợi ý → human review → gán đối tác → chuyển project workspace. Theo dõi end-to-end."
      />
      {toast ? (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          {toast}
        </div>
      ) : null}

      <FilterBar>
        <select className={fieldClass()} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(matchStatusLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <span className="text-xs text-espresso-500">
          Queue: {adminMatches.filter((m) => m.status === 'queue').length} · Review:{' '}
          {adminMatches.filter((m) => m.status === 'human_review').length} · AI:{' '}
          {adminMatches.filter((m) => m.status === 'ai_suggested').length}
        </span>
      </FilterBar>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AdminTable>
            <thead>
              <tr>
                <Th>Request</Th>
                <Th>Ưu tiên</Th>
                <Th>Status</Th>
                <Th>Owner</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr
                  key={m.id}
                  className={`cursor-pointer hover:bg-portal-50/50 ${selected?.id === m.id ? 'bg-portal-50' : ''}`}
                  onClick={() => setSelected(m)}
                >
                  <Td>
                    <p className="font-medium text-espresso-900">{m.title}</p>
                    <p className="text-xs text-espresso-500">
                      {m.id} · {m.company} · {m.problem}
                    </p>
                  </Td>
                  <Td>
                    <AdminBadge
                      tone={
                        m.priority === 'urgent' ? 'danger' : m.priority === 'priority' ? 'warn' : 'neutral'
                      }
                    >
                      {m.priority}
                    </AdminBadge>
                  </Td>
                  <Td>
                    <AdminBadge tone={stTone(m.status)}>{matchStatusLabels[m.status]}</AdminBadge>
                  </Td>
                  <Td className="text-xs">{m.owner}</Td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </div>

        <aside className="rounded-2xl border border-portal-200/80 bg-white p-5 shadow-sm lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-portal-600">
                  Human review
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-espresso-900">
                  {selected.title}
                </h2>
                <p className="text-xs text-espresso-500">
                  {selected.company} · Cập nhật {selected.updatedAt}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-espresso-900">AI match suggestions</p>
                {selected.aiSuggestions.length ? (
                  <ul className="mt-2 space-y-2">
                    {selected.aiSuggestions.map((s) => (
                      <li
                        key={s.partner}
                        className="rounded-xl border border-portal-100 bg-portal-50/60 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-espresso-900">{s.partner}</p>
                          <AdminBadge tone="accent">{Math.round(s.score * 100)}%</AdminBadge>
                        </div>
                        <p className="mt-0.5 text-xs text-espresso-500">{s.reason}</p>
                        <div className="mt-2">
                          <ActionBtn onClick={() => act(`Đã gán ${s.partner} cho ${selected.id}`)}>
                            Gán đối tác này
                          </ActionBtn>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-espresso-500">Chưa có AI suggestion — chạy matching.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-portal-100 pt-4">
                <ActionBtn onClick={() => act(`Chạy AI matching: ${selected.id}`)}>Chạy AI</ActionBtn>
                <ActionBtn onClick={() => act(`Đưa vào human review: ${selected.id}`)}>
                  Human review
                </ActionBtn>
                <ActionBtn
                  variant="primary"
                  onClick={() => act(`Chuyển ${selected.id} → project workspace`)}
                >
                  Mở project
                </ActionBtn>
                <ActionBtn variant="danger" onClick={() => act(`Đóng ${selected.id}`)}>
                  Đóng
                </ActionBtn>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
