import { roleLabels, rolePermissions, type AdminRole } from '@/data/admin-seed'
import { AdminBadge, AdminCard, AdminPageHeader } from '@/components/admin/AdminUi'

const roleDesc: Record<AdminRole, string> = {
  super_admin: 'Toàn quyền điều hành OS partner network',
  partner_manager: 'Quản lý vòng đời đối tác và hỗ trợ match',
  content_editor: 'Soạn & publish nội dung hệ sinh thái',
  reviewer_matcher: 'Duyệt hồ sơ + human match review',
  project_operator: 'Vận hành collaboration workspace',
  support: 'Hỗ trợ user, reset password, xem audit',
  finance: 'Billing / sao kê (read-focused)',
}

export function AdminRoles() {
  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Vai trò & phân quyền"
        description="Super admin, partner manager, content editor, reviewer/matcher, project operator, support, finance — rõ ràng, an toàn."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(roleLabels) as AdminRole[]).map((role) => (
          <AdminCard key={role} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-espresso-900">
                {roleLabels[role]}
              </h2>
              <AdminBadge tone="info">{role}</AdminBadge>
            </div>
            <p className="mt-2 text-sm text-espresso-500">{roleDesc[role]}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-espresso-500">
              Permissions
            </p>
            <ul className="mt-2 space-y-1">
              {(rolePermissions[role].includes('*')
                ? ['* (full access)']
                : rolePermissions[role]
              ).map((p) => (
                <li
                  key={p}
                  className="rounded-lg border border-portal-100 bg-portal-50/60 px-2.5 py-1.5 font-mono text-[11px] text-portal-800"
                >
                  {p}
                </li>
              ))}
            </ul>
          </AdminCard>
        ))}
      </div>
    </div>
  )
}
