import { useCallback, useEffect, useState, type FormEvent } from 'react'
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
import { adminApi } from '@/lib/production-auth'

type UserRow = {
  id: string
  email: string
  full_name: string | null
  role: string
  status: string
  partner_slug: string | null
  created_at: string
  last_login_at: string | null
  invited_at: string | null
}

const ROLES = [
  'partner',
  'partner_manager',
  'content_editor',
  'project_operator',
  'super_admin',
  'client',
]

export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('partner')
  const [partnerSlug, setPartnerSlug] = useState('')
  const [tempSecret, setTempSecret] = useState<string | null>(null)

  const flash = (m: string) => {
    setToast(m)
    window.setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const res = await adminApi<{ users: UserRow[] }>('/api/admin/users')
    setLoading(false)
    if (res.error) {
      setError(res.error)
      setUsers([])
      return
    }
    setError(null)
    setUsers(res.data?.users ?? [])
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const rows = users.filter((u) => !status || u.status === status)

  async function onInvite(e: FormEvent) {
    e.preventDefault()
    const res = await adminApi<{
      ok?: boolean
      temporary_password?: string
      error?: string
      message?: string
    }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        action: 'invite',
        email,
        full_name: fullName,
        role,
        partner_slug: partnerSlug || undefined,
      }),
    })
    if (res.error) {
      flash(res.error)
      return
    }
    setTempSecret(res.data?.temporary_password ?? null)
    flash(res.data?.message || 'Đã mời user')
    setEmail('')
    setFullName('')
    setPartnerSlug('')
    void load()
  }

  async function setUserStatus(id: string, next: string) {
    const res = await adminApi('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'set_status', user_id: id, status: next }),
    })
    flash(res.error || `Status → ${next}`)
    void load()
  }

  async function setUserRole(id: string, next: string) {
    const res = await adminApi('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'set_role', user_id: id, role: next }),
    })
    flash(res.error || `Role → ${next}`)
    void load()
  }

  async function resetPw(id: string) {
    const res = await adminApi<{ temporary_password?: string }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset_password', user_id: id }),
    })
    if (res.data?.temporary_password) setTempSecret(res.data.temporary_password)
    flash(res.error || 'Đã reset mật khẩu tạm')
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Users"
        description="Invite, roles, active / suspended / archived, reset password. Requires SUPABASE_SERVICE_ROLE_KEY on Pages Functions."
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-3 text-sm text-terracotta-600">
          {error}
          <p className="mt-1 text-xs">
            Set secret <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> +{' '}
            <code className="font-mono">VITE_SUPABASE_URL</code> on Cloudflare Pages Functions.
          </p>
        </div>
      ) : null}

      {toast ? (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          {toast}
        </div>
      ) : null}

      {tempSecret ? (
        <div className="mb-4 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-espresso-800">
          Mật khẩu tạm (chỉ hiện một lần):{' '}
          <code className="rounded bg-white px-2 py-0.5 font-mono text-xs">{tempSecret}</code>
          <button type="button" className="ml-3 text-xs font-medium text-portal-700" onClick={() => setTempSecret(null)}>
            Ẩn
          </button>
        </div>
      ) : null}

      <form
        onSubmit={(e) => void onInvite(e)}
        className="mb-6 grid gap-3 rounded-2xl border border-portal-200 bg-white p-5 shadow-sm sm:grid-cols-2"
      >
        <p className="text-sm font-semibold text-espresso-900 sm:col-span-2">Invite user</p>
        <input
          className={fieldClass() + ' w-full'}
          placeholder="Email *"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={fieldClass() + ' w-full'}
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <select className={fieldClass() + ' w-full'} value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input
          className={fieldClass() + ' w-full'}
          placeholder="Partner slug (optional)"
          value={partnerSlug}
          onChange={(e) => setPartnerSlug(e.target.value)}
        />
        <div className="sm:col-span-2">
          <ActionBtn variant="primary" type="submit">
            Invite / Create
          </ActionBtn>
        </div>
      </form>

      <FilterBar>
        <select className={fieldClass()} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">active</option>
          <option value="invited">invited</option>
          <option value="suspended">suspended</option>
          <option value="archived">archived</option>
        </select>
        <ActionBtn onClick={() => void load()}>{loading ? 'Loading…' : 'Refresh'}</ActionBtn>
      </FilterBar>

      <AdminTable>
        <thead>
          <tr>
            <Th>User</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Last login</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id} className="hover:bg-portal-50/40">
              <Td>
                <p className="font-medium text-espresso-900">{u.full_name || '—'}</p>
                <p className="text-xs text-espresso-500">{u.email}</p>
              </Td>
              <Td>
                <select
                  className={fieldClass() + ' text-xs'}
                  value={u.role}
                  onChange={(e) => void setUserRole(u.id, e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Td>
              <Td>
                <AdminBadge
                  tone={
                    u.status === 'active' ? 'ok' : u.status === 'suspended' ? 'warn' : 'neutral'
                  }
                >
                  {u.status}
                </AdminBadge>
              </Td>
              <Td className="text-xs text-espresso-500">
                {u.last_login_at ? new Date(u.last_login_at).toLocaleString('vi-VN') : '—'}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {u.status !== 'active' ? (
                    <ActionBtn onClick={() => void setUserStatus(u.id, 'active')}>Activate</ActionBtn>
                  ) : null}
                  {u.status === 'active' ? (
                    <ActionBtn onClick={() => void setUserStatus(u.id, 'suspended')}>Suspend</ActionBtn>
                  ) : null}
                  <ActionBtn onClick={() => void setUserStatus(u.id, 'archived')}>Archive</ActionBtn>
                  <ActionBtn onClick={() => void resetPw(u.id)}>Reset PW</ActionBtn>
                </div>
              </Td>
            </tr>
          ))}
          {!rows.length && !loading ? (
            <tr>
              <Td className="text-sm text-espresso-500">No users yet — invite the first account.</Td>
            </tr>
          ) : null}
        </tbody>
      </AdminTable>
    </div>
  )
}
