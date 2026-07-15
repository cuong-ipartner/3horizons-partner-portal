import { Link } from 'react-router-dom'
import { adminContent } from '@/data/admin-seed'
import {
  ActionBtn,
  AdminBadge,
  AdminPageHeader,
  AdminTable,
  Td,
  Th,
} from '@/components/admin/AdminUi'

const typeVi: Record<string, string> = {
  homepage: 'Trang chủ',
  ecosystem: 'Tầng hệ sinh thái',
  service: 'Dòng dịch vụ',
  case: 'Case study',
  training: 'Huấn luyện',
  document: 'Tài liệu',
  featured: 'Featured partners',
}

export function AdminContent() {
  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Quản lý nội dung"
        description="Ecosystem pages, service lines, case studies, training, documents, featured partners và homepage."
        actions={
          <Link to="/admin/content/homepage">
            <ActionBtn variant="primary">Sửa trang chủ (editor)</ActionBtn>
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Homepage', to: '/admin/content/homepage', desc: 'Hero, sections, CTA' },
          { label: 'Ecosystem layers', to: '/layers', desc: 'T1–T7 landing' },
          { label: 'Case studies', to: '/insights', desc: 'Insights public' },
          { label: 'Thư viện PDF', to: '/admin/library', desc: 'Upload Storage + seed' },
        ].map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-2xl border border-portal-200/80 bg-white p-4 shadow-sm transition hover:border-portal-300"
          >
            <p className="text-sm font-semibold text-espresso-900">{c.label}</p>
            <p className="mt-1 text-xs text-espresso-500">{c.desc}</p>
          </Link>
        ))}
      </div>

      <AdminTable>
        <thead>
          <tr>
            <Th>Nội dung</Th>
            <Th>Loại</Th>
            <Th>Status</Th>
            <Th>Editor</Th>
            <Th>Cập nhật</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {adminContent.map((c) => (
            <tr key={c.id} className="hover:bg-portal-50/40">
              <Td>
                <p className="font-medium text-espresso-900">{c.title}</p>
              </Td>
              <Td className="text-xs">{typeVi[c.type] ?? c.type}</Td>
              <Td>
                <AdminBadge
                  tone={
                    c.status === 'published' ? 'ok' : c.status === 'draft' ? 'warn' : 'info'
                  }
                >
                  {c.status}
                </AdminBadge>
              </Td>
              <Td className="text-xs">{c.editor}</Td>
              <Td className="text-xs text-espresso-500">{c.updatedAt}</Td>
              <Td>
                <ActionBtn>Edit</ActionBtn>
              </Td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  )
}
