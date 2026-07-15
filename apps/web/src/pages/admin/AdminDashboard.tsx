import { Link } from 'react-router-dom'
import {
  adminContent,
  adminKpis,
  adminMatches,
  adminPartners,
  auditLogs,
  matchStatusLabels,
  partnerStatusLabels,
} from '@/data/admin-seed'
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

export function AdminDashboard() {
  const k = adminKpis()
  const pending = adminPartners.filter((p) => p.status === 'submitted' || p.status === 'draft')
  const openMatches = adminMatches.filter((m) => m.status !== 'closed').slice(0, 5)
  const recent = auditLogs.slice(0, 6)

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Trung tâm điều hành Partner Network"
        description="Quản lý user, đối tác, match, project, nội dung và audit — một operating system cho hệ sinh thái."
        actions={
          <>
            <Link to="/admin/partners">
              <ActionBtn variant="primary">Duyệt đối tác</ActionBtn>
            </Link>
            <Link to="/admin/matches">
              <ActionBtn>Hàng đợi match</ActionBtn>
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Tổng users" value={k.totalUsers} hint="Toàn hệ thống" />
        <KpiCard label="Đối tác chờ duyệt" value={k.pendingPartners} hint="Draft + submitted" tone="warn" />
        <KpiCard label="Request đang mở" value={k.activeRequests} hint="Chưa closed/in project" tone="info" />
        <KpiCard label="Project active" value={k.activeProjects} hint="Collaboration" tone="ok" />
        <KpiCard label="Content updates" value={k.contentUpdates} hint="Tháng 7/2026" />
        <KpiCard label="Alerts" value={k.alerts} hint="Urgent + pending" tone="warn" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <AdminCard className="p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-espresso-900">Hàng đợi match requests</h2>
            <Link to="/admin/matches" className="text-xs font-medium text-portal-700 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <AdminTable>
            <thead>
              <tr>
                <Th>Request</Th>
                <Th>Ưu tiên</Th>
                <Th>Trạng thái</Th>
                <Th>AI</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {openMatches.map((m) => (
                <tr key={m.id} className="hover:bg-portal-50/50">
                  <Td>
                    <p className="font-medium text-espresso-900">{m.title}</p>
                    <p className="text-xs text-espresso-500">
                      {m.id} · {m.company}
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
                    <AdminBadge tone="info">{matchStatusLabels[m.status]}</AdminBadge>
                  </Td>
                  <Td className="text-xs text-espresso-500">
                    {m.aiSuggestions.length ? `${m.aiSuggestions.length} gợi ý` : '—'}
                  </Td>
                  <Td>
                    <Link to="/admin/matches">
                      <ActionBtn>Review</ActionBtn>
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminCard>

        <AdminCard className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-espresso-900">Đối tác chờ duyệt</h2>
            <Link to="/admin/partners" className="text-xs font-medium text-portal-700 hover:underline">
              Queue
            </Link>
          </div>
          <ul className="space-y-3">
            {pending.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-portal-100 px-3 py-3 transition hover:border-portal-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-espresso-900">{p.name}</p>
                    <p className="text-xs text-espresso-500">{p.title}</p>
                  </div>
                  <AdminBadge tone={p.status === 'submitted' ? 'warn' : 'neutral'}>
                    {partnerStatusLabels[p.status]}
                  </AdminBadge>
                </div>
                <p className="mt-2 text-[11px] text-espresso-500">
                  Layers: {p.layers.join(', ')} · Nộp {p.submittedAt}
                </p>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <AdminCard className="p-5">
          <h2 className="text-sm font-semibold text-espresso-900">Content updates gần đây</h2>
          <ul className="mt-4 divide-y divide-portal-50">
            {adminContent.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-espresso-900">{c.title}</p>
                  <p className="text-xs text-espresso-500">
                    {c.type} · {c.editor} · {c.updatedAt}
                  </p>
                </div>
                <AdminBadge tone={c.status === 'published' ? 'ok' : c.status === 'draft' ? 'warn' : 'info'}>
                  {c.status}
                </AdminBadge>
              </li>
            ))}
          </ul>
          <Link to="/admin/content" className="mt-2 inline-block text-xs font-medium text-portal-700 hover:underline">
            Quản lý nội dung →
          </Link>
        </AdminCard>

        <AdminCard className="p-5">
          <h2 className="text-sm font-semibold text-espresso-900">Alerts & hoạt động gần đây</h2>
          <ul className="mt-4 space-y-3">
            {recent.map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-portal-600" />
                <div>
                  <p className="font-medium text-espresso-900">{a.action}</p>
                  <p className="text-xs text-espresso-500">
                    {a.at} · {a.actor} · {a.target}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/admin/audit" className="mt-3 inline-block text-xs font-medium text-portal-700 hover:underline">
            Xem audit log →
          </Link>
        </AdminCard>
      </div>
    </div>
  )
}
