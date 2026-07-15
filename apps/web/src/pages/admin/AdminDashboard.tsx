import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ActionBtn,
  AdminBadge,
  AdminCard,
  AdminPageHeader,
  AdminTable,
  KpiCard,
  Td,
  Th,
} from '@/components/admin/AdminUi'
import { listProductionDocuments } from '@/data/production-library'
import { useProjectsState } from '@/data/projects-store'
import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'
import { adminApi } from '@/lib/production-auth'
import { listApplications } from '@/onboarding/storage'

export function AdminDashboard() {
  const { projects, loading: projectsLoading } = useProjectsState()
  const [userCount, setUserCount] = useState(0)
  const [docCount, setDocCount] = useState(0)
  const [auditPreview, setAuditPreview] = useState<
    { id: string; action: string; actor_email: string | null; created_at: string }[]
  >([])
  const [appsPending, setAppsPending] = useState(0)

  useEffect(() => {
    try {
      setAppsPending(
        listApplications().filter((a) => a.status === 'submitted' || a.status === 'draft').length,
      )
    } catch {
      setAppsPending(0)
    }

    void listProductionDocuments({}, { staffView: true }).then((res) => {
      setDocCount(res.docs.length)
    })

    void adminApi<{ users: { id: string }[] }>('/api/admin/users').then((res) => {
      if (res.data?.users) setUserCount(res.data.users.length)
    })

    const sb = getSupabase()
    if (sb && isSupabaseAuthEnabled()) {
      void sb
        .from('audit_logs')
        .select('id,action,actor_email,created_at')
        .order('created_at', { ascending: false })
        .limit(6)
        .then(({ data }) => {
          setAuditPreview(
            (data as { id: string; action: string; actor_email: string | null; created_at: string }[]) ||
              [],
          )
        })
    }
  }, [])

  const activeProjects = projects.filter((p) => p.status === 'active').length

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Trung tâm điều hành Partner Network"
        description="Dữ liệu live — không seed demo. Invite users, upload documents, tạo project từ admin."
        actions={
          <>
            <Link to="/admin/users">
              <ActionBtn variant="primary">Users</ActionBtn>
            </Link>
            <Link to="/admin/library">
              <ActionBtn>Documents</ActionBtn>
            </Link>
            <Link to="/admin/settings">
              <ActionBtn>Cleanup</ActionBtn>
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <KpiCard label="Users" value={userCount} hint="Profiles (API)" />
        <KpiCard
          label="Đối tác chờ duyệt"
          value={appsPending}
          hint="Hồ sơ onboarding local"
          tone={appsPending ? 'warn' : 'ok'}
        />
        <KpiCard
          label="Projects active"
          value={projectsLoading ? '…' : activeProjects}
          hint="Collaboration"
          tone="info"
        />
        <KpiCard label="Documents" value={docCount} hint="Library (staff view)" />
        <KpiCard label="Audit recent" value={auditPreview.length} hint="Last actions" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-espresso-900">Projects</h2>
            <Link to="/admin/projects" className="text-xs font-medium text-portal-700 hover:underline">
              Manage
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-espresso-500">
              Chưa có project. Tạo engagement mới tại{' '}
              <Link to="/admin/projects" className="font-medium text-portal-700 hover:underline">
                Projects
              </Link>
              .
            </p>
          ) : (
            <AdminTable>
              <thead>
                <tr>
                  <Th>Project</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((p) => (
                  <tr key={p.id}>
                    <Td>
                      <p className="font-medium text-espresso-900">{p.title}</p>
                      <p className="text-xs text-espresso-500">{p.id}</p>
                    </Td>
                    <Td>
                      <AdminBadge tone={p.status === 'active' ? 'ok' : 'neutral'}>
                        {p.status}
                      </AdminBadge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminCard>

        <AdminCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-espresso-900">Audit gần đây</h2>
            <Link to="/admin/audit" className="text-xs font-medium text-portal-700 hover:underline">
              Full log
            </Link>
          </div>
          {auditPreview.length === 0 ? (
            <p className="text-sm text-espresso-500">
              Chưa có audit entries. Invite user / upload document sẽ ghi log.
            </p>
          ) : (
            <ul className="space-y-3">
              {auditPreview.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-portal-600" />
                  <div>
                    <p className="font-medium text-espresso-900">{a.action}</p>
                    <p className="text-xs text-espresso-500">
                      {new Date(a.created_at).toLocaleString('vi-VN')} · {a.actor_email || '—'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <AdminCard className="mt-6 p-5">
        <h2 className="text-sm font-semibold text-espresso-900">Go-live checklist</h2>
        <ul className="mt-3 space-y-2 text-sm text-espresso-600">
          <li>
            1. Cloudflare Pages: <code className="font-mono text-xs">VITE_SUPABASE_URL</code> +{' '}
            <code className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> (build)
          </li>
          <li>
            2. Functions secrets: <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>
          </li>
          <li>
            3.{' '}
            <Link to="/admin/users" className="font-medium text-portal-700 hover:underline">
              Invite
            </Link>{' '}
            staff + partner accounts (no demo emails)
          </li>
          <li>
            4.{' '}
            <Link to="/admin/library" className="font-medium text-portal-700 hover:underline">
              Upload
            </Link>{' '}
            production documents → publish
          </li>
          <li>
            5.{' '}
            <Link to="/admin/settings" className="font-medium text-portal-700 hover:underline">
              Cleanup
            </Link>{' '}
            any leftover demo users/files
          </li>
        </ul>
      </AdminCard>
    </div>
  )
}
