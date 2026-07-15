import { useCallback, useEffect, useState } from 'react'
import {
  ActionBtn,
  AdminPageHeader,
  AdminTable,
  FilterBar,
  Td,
  Th,
  fieldClass,
} from '@/components/admin/AdminUi'
import { getSupabase } from '@/lib/supabase'

type AuditRow = {
  id: string
  actor_email: string | null
  action: string
  entity_type: string
  entity_id: string | null
  meta: Record<string, unknown>
  created_at: string
}

export function AdminAudit() {
  const [rows, setRows] = useState<AuditRow[]>([])
  const [q, setQ] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const sb = getSupabase()
    if (!sb) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }
    let query = sb
      .from('audit_logs')
      .select('id,actor_email,action,entity_type,entity_id,meta,created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (q.trim()) query = query.ilike('action', `%${q.trim()}%`)
    const { data, error: err } = await query
    setLoading(false)
    if (err) {
      setError(err.message)
      setRows([])
      return
    }
    setError(null)
    setRows((data as AuditRow[]) || [])
  }, [q])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Audit logs"
        description="Key admin and document actions. Staff-only (RLS)."
      />
      {error ? (
        <div className="mb-4 text-sm text-terracotta-600">{error}</div>
      ) : null}
      <FilterBar>
        <input
          className={fieldClass()}
          placeholder="Filter action"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <ActionBtn onClick={() => void load()}>{loading ? '…' : 'Refresh'}</ActionBtn>
      </FilterBar>
      <AdminTable>
        <thead>
          <tr>
            <Th>When</Th>
            <Th>Actor</Th>
            <Th>Action</Th>
            <Th>Entity</Th>
            <Th>Meta</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td className="text-xs whitespace-nowrap">
                {new Date(r.created_at).toLocaleString('vi-VN')}
              </Td>
              <Td className="text-xs">{r.actor_email || '—'}</Td>
              <Td className="text-xs font-medium">{r.action}</Td>
              <Td className="text-xs">
                {r.entity_type}
                {r.entity_id ? ` · ${r.entity_id}` : ''}
              </Td>
              <Td className="max-w-xs truncate font-mono text-[10px] text-espresso-500">
                {JSON.stringify(r.meta || {})}
              </Td>
            </tr>
          ))}
          {!rows.length && !loading ? (
            <tr>
              <Td className="text-sm text-espresso-500">No audit events yet.</Td>
            </tr>
          ) : null}
        </tbody>
      </AdminTable>
    </div>
  )
}
