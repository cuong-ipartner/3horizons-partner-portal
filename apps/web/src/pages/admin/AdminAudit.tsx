import { useMemo, useState } from 'react'
import { auditLogs } from '@/data/admin-seed'
import {
  AdminBadge,
  AdminPageHeader,
  AdminTable,
  FilterBar,
  Td,
  Th,
  fieldClass,
} from '@/components/admin/AdminUi'

const catVi: Record<string, string> = {
  login: 'Đăng nhập',
  approval: 'Duyệt / approve',
  edit: 'Chỉnh sửa',
  permission: 'Phân quyền',
  security: 'Bảo mật',
}

export function AdminAudit() {
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    return auditLogs.filter((a) => {
      if (cat && a.category !== cat) return false
      const t = `${a.actor} ${a.action} ${a.target}`.toLowerCase()
      if (q && !t.includes(q.toLowerCase())) return false
      return true
    })
  }, [cat, q])

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Audit & logs"
        description="Login history, approval history, edit history, permission changes, security logs — truy vết đầy đủ."
      />

      <FilterBar>
        <input
          className={fieldClass() + ' min-w-[200px] flex-1'}
          placeholder="Tìm actor / action / target…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={fieldClass()} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Tất cả loại</option>
          {Object.entries(catVi).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </FilterBar>

      <AdminTable>
        <thead>
          <tr>
            <Th>Thời gian</Th>
            <Th>Actor</Th>
            <Th>Hành động</Th>
            <Th>Target</Th>
            <Th>Loại</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="hover:bg-portal-50/40">
              <Td className="whitespace-nowrap text-xs text-espresso-500">{a.at}</Td>
              <Td className="font-medium">{a.actor}</Td>
              <Td>{a.action}</Td>
              <Td className="text-xs font-mono text-portal-800">{a.target}</Td>
              <Td>
                <AdminBadge
                  tone={
                    a.category === 'security'
                      ? 'danger'
                      : a.category === 'approval'
                        ? 'warn'
                        : a.category === 'permission'
                          ? 'info'
                          : 'neutral'
                  }
                >
                  {catVi[a.category]}
                </AdminBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  )
}
