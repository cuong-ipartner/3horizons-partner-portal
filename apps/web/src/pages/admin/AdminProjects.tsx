import { useMemo, useState, type FormEvent } from 'react'
import {
  assignPartner,
  createProject,
  partnerLabels,
  removePartner,
  resetProjectsToSeed,
  setProjectStatus,
  useProjectsState,
  type NetworkProject,
  type ProjectStatus,
} from '@/data/projects-store'
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
import { cn } from '@/lib/cn'
import { DEMO_PARTNER_PERSONAS } from '@/lib/session'
import { DEMO_STAFF_PERSONA, ensureStaffAuth, DEMO_PASSWORD } from '@/lib/auth'
import { isSupabaseAuthEnabled, supabaseBackendLabel } from '@/lib/supabase'
import { Link } from 'react-router-dom'

const statusVi: Record<ProjectStatus, string> = {
  active: 'Đang chạy',
  paused: 'Tạm dừng',
  archived: 'Lưu trữ',
}

const ASSIGNABLE_PARTNERS = [
  ...DEMO_PARTNER_PERSONAS.map((p) => ({
    partnerId: p.partnerId,
    displayName: p.name,
  })),
  { partnerId: 'mai-hoang', displayName: 'Mai Hoàng' },
  { partnerId: 'james-okonkwo', displayName: 'James Okonkwo' },
  { partnerId: 'sofia-nguyen', displayName: 'Sofia Nguyen' },
]

export function AdminProjects() {
  const { projects, loading, error, backend, refresh } = useProjectsState()
  const [status, setStatus] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [owner, setOwner] = useState('Facilitator 3H')
  const [createPartnerId, setCreatePartnerId] = useState(ASSIGNABLE_PARTNERS[0].partnerId)
  const [assignPartnerId, setAssignPartnerId] = useState(ASSIGNABLE_PARTNERS[0].partnerId)

  const selected: NetworkProject | null =
    projects.find((p) => p.id === selectedId) ?? projects[0] ?? null

  const rows = useMemo(
    () => projects.filter((p) => !status || p.status === status),
    [projects, status],
  )

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 4000)
  }

  async function ensureStaffSession() {
    if (!isSupabaseAuthEnabled()) return true
    const res = await ensureStaffAuth()
    if (!res.ok) {
      flash(`Staff: ${res.error}`)
      return false
    }
    return true
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    if (isSupabaseAuthEnabled()) {
      const ok = await ensureStaffSession()
      if (!ok) {
        setBusy(false)
        return
      }
    }
    const persona = ASSIGNABLE_PARTNERS.find((p) => p.partnerId === createPartnerId)
    const res = await createProject({
      title: title.trim(),
      dueDate: dueDate || undefined,
      nextAction: nextAction || 'Kickoff collaboration',
      owners: owner ? [owner] : ['Facilitator 3H'],
      members: [
        {
          partnerId: createPartnerId,
          displayName: persona?.displayName ?? createPartnerId,
          role: 'partner',
        },
        { partnerId: 'staff-3h', displayName: 'Facilitator 3H', role: 'facilitator' },
      ],
    })
    await refresh()
    setBusy(false)
    if (res.project) {
      setSelectedId(res.project.id)
      setShowCreate(false)
      setTitle('')
      setDueDate('')
      setNextAction('')
      flash(
        `Đã tạo ${res.project.id} via ${res.via}${res.error ? ` (${res.error})` : ''} — partner ${persona?.displayName}`,
      )
    } else {
      flash(res.error || 'Tạo project thất bại')
    }
  }

  async function onAssign() {
    if (!selected) return
    setBusy(true)
    if (isSupabaseAuthEnabled()) await ensureStaffSession()
    const persona = ASSIGNABLE_PARTNERS.find((p) => p.partnerId === assignPartnerId)
    const res = await assignPartner(selected.id, {
      partnerId: assignPartnerId,
      displayName: persona?.displayName ?? assignPartnerId,
      role: 'partner',
    })
    await refresh()
    setBusy(false)
    flash(
      res.error
        ? res.error
        : `Đã gán ${persona?.displayName} via ${res.via}`,
    )
  }

  async function onRemovePartner(partnerId: string) {
    if (!selected) return
    setBusy(true)
    if (isSupabaseAuthEnabled()) await ensureStaffSession()
    const res = await removePartner(selected.id, partnerId)
    await refresh()
    setBusy(false)
    flash(res.error || `Đã gỡ ${partnerId} via ${res.via}`)
  }

  async function onStatus(s: ProjectStatus) {
    if (!selected) return
    setBusy(true)
    if (isSupabaseAuthEnabled()) await ensureStaffSession()
    const res = await setProjectStatus(selected.id, s)
    await refresh()
    setBusy(false)
    flash(res.error || `Status → ${statusVi[s]} (${res.via})`)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Dự án & collaboration"
        description="Tạo / gán partner / status. Supabase RLS: staff full; partner chỉ thấy membership."
      />

      <div className="mb-4 rounded-2xl border border-portal-200 bg-portal-50/80 px-4 py-3 text-sm text-espresso-700">
        <p className="font-medium text-portal-800">
          Backend: <span className="font-semibold">{backend}</span>
          {loading ? ' · loading…' : ''}
          {busy ? ' · busy…' : ''}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-espresso-500">
          {supabaseBackendLabel()}. Staff demo:{' '}
          <Link to="/login" className="font-medium text-portal-700 hover:underline">
            login Facilitator 3H
          </Link>{' '}
          ({DEMO_STAFF_PERSONA.email} / {DEMO_PASSWORD}).
        </p>
        {error ? <p className="mt-1 text-xs text-terracotta-600">{error}</p> : null}
      </div>

      {toast ? (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
          {toast}
        </div>
      ) : null}

      <FilterBar>
        <select className={fieldClass()} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả</option>
          <option value="active">Đang chạy</option>
          <option value="paused">Tạm dừng</option>
          <option value="archived">Lưu trữ</option>
        </select>
        <ActionBtn variant="primary" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Đóng form' : 'Tạo project'}
        </ActionBtn>
        <ActionBtn
          onClick={() => {
            void refresh()
            flash('Đã refresh')
          }}
        >
          Refresh
        </ActionBtn>
        <ActionBtn
          onClick={() => {
            resetProjectsToSeed()
            setSelectedId(null)
            void refresh()
            flash('Reset local seed (không xoá Supabase)')
          }}
        >
          Reset local seed
        </ActionBtn>
      </FilterBar>

      {showCreate ? (
        <form
          onSubmit={(e) => void onCreate(e)}
          className="mb-6 grid gap-3 rounded-2xl border border-portal-200 bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-espresso-600">Tên project *</label>
            <input
              className={fieldClass() + ' w-full'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Workshop kế thừa — Tập đoàn X"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">
              Gán partner (membership)
            </label>
            <select
              className={fieldClass() + ' w-full'}
              value={createPartnerId}
              onChange={(e) => setCreatePartnerId(e.target.value)}
            >
              {ASSIGNABLE_PARTNERS.map((p) => (
                <option key={p.partnerId} value={p.partnerId}>
                  {p.displayName} ({p.partnerId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">Owner 3H</label>
            <input
              className={fieldClass() + ' w-full'}
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">Due date</label>
            <input
              type="date"
              className={fieldClass() + ' w-full'}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">Next action</label>
            <input
              className={fieldClass() + ' w-full'}
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Kickoff / agenda / …"
            />
          </div>
          <div className="flex items-end sm:col-span-2">
            <ActionBtn variant="primary" type="submit">
              Tạo & gán partner
            </ActionBtn>
          </div>
        </form>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AdminTable>
            <thead>
              <tr>
                <Th>Project</Th>
                <Th>Status</Th>
                <Th>Partners</Th>
                <Th>Due</Th>
                <Th>Files</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className={`cursor-pointer hover:bg-portal-50/50 ${
                    (selected?.id ?? selectedId) === p.id ? 'bg-portal-50' : ''
                  }`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <Td>
                    <p className="font-medium text-espresso-900">{p.title}</p>
                    <p className="text-xs text-espresso-500">{p.id}</p>
                  </Td>
                  <Td>
                    <AdminBadge
                      tone={
                        p.status === 'active' ? 'ok' : p.status === 'paused' ? 'warn' : 'neutral'
                      }
                    >
                      {statusVi[p.status]}
                    </AdminBadge>
                  </Td>
                  <Td className="text-xs">{partnerLabels(p).join(', ') || '—'}</Td>
                  <Td className="text-xs">{p.dueDate || '—'}</Td>
                  <Td className="text-xs">{p.files}</Td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <Td className="text-sm text-espresso-500">
                    {loading
                      ? 'Đang tải…'
                      : 'Chưa có project (login staff Supabase hoặc tạo mới).'}
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
                  Workspace
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-espresso-900">
                  {selected.title}
                </h2>
                <p className="text-xs text-espresso-500">
                  {selected.id} · Due {selected.dueDate || '—'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-espresso-900">Membership (ACL)</p>
                <ul className="mt-2 space-y-1.5">
                  {selected.members.map((m) => (
                    <li
                      key={m.partnerId + m.role}
                      className="flex items-center justify-between gap-2 rounded-lg border border-portal-100 px-3 py-2 text-xs"
                    >
                      <span>
                        <span className="font-medium text-espresso-800">{m.displayName}</span>
                        <span className="text-espresso-500">
                          {' '}
                          · {m.role} · {m.partnerId}
                        </span>
                      </span>
                      {m.role === 'partner' ? (
                        <button
                          type="button"
                          className="font-medium text-terracotta-600 hover:underline"
                          onClick={() => void onRemovePartner(m.partnerId)}
                        >
                          Gỡ
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex flex-wrap gap-2">
                  <select
                    className={fieldClass()}
                    value={assignPartnerId}
                    onChange={(e) => setAssignPartnerId(e.target.value)}
                  >
                    {ASSIGNABLE_PARTNERS.map((p) => (
                      <option key={p.partnerId} value={p.partnerId}>
                        {p.displayName}
                      </option>
                    ))}
                  </select>
                  <ActionBtn onClick={() => void onAssign()}>Gán partner</ActionBtn>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-espresso-900">Status</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(['active', 'paused', 'archived'] as ProjectStatus[]).map((s) => (
                    <ActionBtn
                      key={s}
                      variant={selected.status === s ? 'primary' : 'ghost'}
                      onClick={() => void onStatus(s)}
                    >
                      {statusVi[s]}
                    </ActionBtn>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-espresso-900">Milestones</p>
                <ul className="mt-2 space-y-2">
                  {selected.milestones.map((m) => (
                    <li
                      key={m.label}
                      className="flex items-center gap-2 rounded-lg border border-portal-100 px-3 py-2 text-sm"
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                          m.done ? 'bg-success text-white' : 'bg-portal-100 text-espresso-500',
                        )}
                      >
                        {m.done ? '✓' : ''}
                      </span>
                      <span className={m.done ? 'text-espresso-500 line-through' : 'text-espresso-800'}>
                        {m.label}
                      </span>
                      {m.due ? (
                        <span className="ml-auto text-[11px] text-espresso-500">{m.due}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] leading-relaxed text-espresso-500">
                Next: {selected.nextAction}
              </p>
            </div>
          ) : (
            <p className="text-sm text-espresso-500">Chọn một project hoặc tạo mới.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
