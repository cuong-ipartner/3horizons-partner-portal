import { useMemo, useState } from 'react'
import {
  adminUsers,
  roleLabels,
  rolePermissions,
  userStatusLabels,
  type AdminUser,
} from '@/data/admin-seed'
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

export function AdminUsers() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [toast, setToast] = useState('')

  const rows = useMemo(() => {
    return adminUsers.filter((u) => {
      const t = `${u.name} ${u.email}`.toLowerCase()
      if (q && !t.includes(q.toLowerCase())) return false
      if (role && u.role !== role) return false
      if (status && u.status !== status) return false
      return true
    })
  }, [q, role, status])

  function notify(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2200)
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Danh sách user, vai trò, quyền, reset mật khẩu, tạm dừng / khôi phục và lịch sử hoạt động."
      />
      {toast ? (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          {toast}
        </div>
      ) : null}

      <FilterBar>
        <input
          className={fieldClass() + ' min-w-[200px] flex-1'}
          placeholder="Tìm tên / email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={fieldClass()} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Tất cả role</option>
          {Object.entries(roleLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select className={fieldClass()} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả status</option>
          <option value="active">Hoạt động</option>
          <option value="suspended">Tạm dừng</option>
          <option value="invited">Đã mời</option>
        </select>
      </FilterBar>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminTable>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last login</Th>
                <Th>Thao tác</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-portal-50/40">
                  <Td>
                    <button type="button" className="text-left" onClick={() => setSelected(u)}>
                      <p className="font-medium text-espresso-900 hover:text-portal-700">{u.name}</p>
                      <p className="text-xs text-espresso-500">{u.email}</p>
                    </button>
                  </Td>
                  <Td>
                    <AdminBadge tone="info">{roleLabels[u.role]}</AdminBadge>
                  </Td>
                  <Td>
                    <AdminBadge
                      tone={
                        u.status === 'active' ? 'ok' : u.status === 'suspended' ? 'danger' : 'warn'
                      }
                    >
                      {userStatusLabels[u.status]}
                    </AdminBadge>
                  </Td>
                  <Td className="text-xs text-espresso-500">{u.lastLogin}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      <ActionBtn onClick={() => notify(`Đã gửi reset mật khẩu tới ${u.email}`)}>
                        Reset MK
                      </ActionBtn>
                      {u.status === 'suspended' ? (
                        <ActionBtn variant="primary" onClick={() => notify(`Đã khôi phục ${u.name}`)}>
                          Khôi phục
                        </ActionBtn>
                      ) : (
                        <ActionBtn variant="danger" onClick={() => notify(`Đã tạm dừng ${u.name}`)}>
                          Tạm dừng
                        </ActionBtn>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </div>

        <aside className="rounded-2xl border border-portal-200/80 bg-white p-5 shadow-sm">
          {selected ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-portal-600">
                Chi tiết user
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-espresso-900">
                {selected.name}
              </h2>
              <p className="text-sm text-espresso-500">{selected.email}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-espresso-500">Role</dt>
                  <dd className="font-medium">{roleLabels[selected.role]}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-espresso-500">Status</dt>
                  <dd className="font-medium">{userStatusLabels[selected.status]}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-espresso-500">Tạo lúc</dt>
                  <dd className="font-medium">{selected.createdAt}</dd>
                </div>
              </dl>
              <p className="mt-5 text-xs font-semibold text-espresso-900">Permissions</p>
              <ul className="mt-2 space-y-1">
                {(rolePermissions[selected.role].includes('*')
                  ? ['Toàn quyền (*)']
                  : rolePermissions[selected.role]
                ).map((p) => (
                  <li key={p} className="rounded-lg bg-portal-50 px-2 py-1.5 text-xs text-portal-800">
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs font-semibold text-espresso-900">Activity history (demo)</p>
              <ul className="mt-2 space-y-2 text-xs text-espresso-500">
                <li>Login · {selected.lastLogin}</li>
                <li>Role assigned · {selected.createdAt}</li>
                <li>Profile viewed · admin</li>
              </ul>
            </>
          ) : (
            <p className="text-sm text-espresso-500">Chọn một user để xem quyền và lịch sử.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
