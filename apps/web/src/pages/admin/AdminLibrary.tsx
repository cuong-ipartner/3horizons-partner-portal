import { useRef, useState, type FormEvent } from 'react'
import {
  deleteLibraryDocument,
  formatFileSize,
  seedDemoLibraryPdfs,
  setLibraryPublished,
  uploadLibraryPdf,
  useLibraryDocuments,
} from '@/data/library-store'
import { DEMO_STAFF_PERSONA, ensureStaffAuth } from '@/lib/auth'
import { isSupabaseAuthEnabled, supabaseBackendLabel } from '@/lib/supabase'
import {
  ActionBtn,
  AdminPageHeader,
  AdminTable,
  FilterBar,
  Td,
  Th,
  fieldClass,
  AdminBadge,
} from '@/components/admin/AdminUi'
import { Link } from 'react-router-dom'

export function AdminLibrary() {
  const { docs, loading, error, refresh } = useLibraryDocuments(true)
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('Nền tảng')
  const [summary, setSummary] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 4000)
  }

  async function ensureStaff() {
    if (!isSupabaseAuthEnabled()) {
      flash('Bật VITE_DATA_MODE=supabase và đăng nhập staff')
      return false
    }
    const res = await ensureStaffAuth()
    if (!res.ok) {
      flash(`Staff: ${res.error}`)
      return false
    }
    return true
  }

  async function onUpload(e: FormEvent) {
    e.preventDefault()
    if (!file || !title.trim()) {
      flash('Chọn PDF và nhập tiêu đề')
      return
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      flash('Chỉ nhận file PDF')
      return
    }
    setBusy(true)
    if (!(await ensureStaff())) {
      setBusy(false)
      return
    }
    const res = await uploadLibraryPdf({
      file,
      title: title.trim(),
      tag,
      summary: summary.trim() || undefined,
      published: true,
    })
    setBusy(false)
    if (res.error) {
      flash(res.error)
      return
    }
    setTitle('')
    setSummary('')
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
    await refresh()
    flash(`Đã upload: ${res.doc?.title}`)
  }

  async function onSeed() {
    setBusy(true)
    if (!(await ensureStaff())) {
      setBusy(false)
      return
    }
    const res = await seedDemoLibraryPdfs()
    setBusy(false)
    await refresh()
    flash(
      res.error
        ? res.error
        : res.created
          ? `Đã seed ${res.created} PDF demo`
          : 'Seed: các tài liệu demo đã tồn tại',
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Thư viện PDF (Storage)"
        description="Bucket partner-library · metadata library_documents · partner đọc signed URL · staff upload."
      />

      <div className="mb-4 rounded-2xl border border-portal-200 bg-portal-50/80 px-4 py-3 text-xs text-espresso-600">
        <p className="font-medium text-portal-800">{supabaseBackendLabel()}</p>
        <p className="mt-1">
          Staff demo: {DEMO_STAFF_PERSONA.email} · Portal partner xem tại{' '}
          <Link to="/portal/documents" className="font-medium text-portal-700 hover:underline">
            /portal/documents
          </Link>
        </p>
      </div>

      {toast ? (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
          {toast}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-2.5 text-sm text-terracotta-600">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={(e) => void onUpload(e)}
        className="mb-6 grid gap-3 rounded-2xl border border-portal-200 bg-white p-5 shadow-sm sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <p className="text-sm font-semibold text-espresso-900">Upload PDF</p>
          <p className="mt-0.5 text-xs text-espresso-500">Tối đa 25 MB · application/pdf</p>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-espresso-600">Tiêu đề *</label>
          <input
            className={fieldClass() + ' w-full'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: SOP workshop chiến lược"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-espresso-600">Tag</label>
          <select
            className={fieldClass() + ' w-full'}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option>Nền tảng</option>
            <option>Chuẩn mực</option>
            <option>Mẫu</option>
            <option>Insight</option>
            <option>Engagement</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-espresso-600">File PDF *</label>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="block w-full text-sm text-espresso-700 file:mr-3 file:rounded-lg file:border-0 file:bg-portal-100 file:px-3 file:py-2 file:text-xs file:font-medium file:text-portal-800"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-espresso-600">Tóm tắt</label>
          <input
            className={fieldClass() + ' w-full'}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="1–2 câu cho partner"
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <ActionBtn variant="primary" type="submit">
            {busy ? 'Đang xử lý…' : 'Upload lên Storage'}
          </ActionBtn>
          <ActionBtn type="button" onClick={() => void onSeed()}>
            Seed 3 PDF demo
          </ActionBtn>
          <ActionBtn type="button" onClick={() => void refresh()}>
            Refresh
          </ActionBtn>
        </div>
      </form>

      <FilterBar>
        <span className="text-xs text-espresso-500">
          {loading ? 'Đang tải…' : `${docs.length} tài liệu`}
          {busy ? ' · busy' : ''}
        </span>
      </FilterBar>

      <AdminTable>
        <thead>
          <tr>
            <Th>Tài liệu</Th>
            <Th>Tag</Th>
            <Th>Size</Th>
            <Th>Status</Th>
            <Th>Path</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.id} className="hover:bg-portal-50/40">
              <Td>
                <p className="font-medium text-espresso-900">{d.title}</p>
                {d.summary ? <p className="text-xs text-espresso-500">{d.summary}</p> : null}
              </Td>
              <Td className="text-xs">{d.tag}</Td>
              <Td className="text-xs">{formatFileSize(d.fileSize)}</Td>
              <Td>
                <AdminBadge tone={d.published ? 'ok' : 'warn'}>
                  {d.published ? 'published' : 'draft'}
                </AdminBadge>
              </Td>
              <Td className="max-w-[10rem] truncate font-mono text-[10px] text-espresso-500">
                {d.storagePath}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  <ActionBtn
                    onClick={() =>
                      void setLibraryPublished(d.id, !d.published).then((err) => {
                        flash(err || (d.published ? 'Đã ẩn' : 'Đã publish'))
                        void refresh()
                      })
                    }
                  >
                    {d.published ? 'Ẩn' : 'Publish'}
                  </ActionBtn>
                  <ActionBtn
                    variant="danger"
                    onClick={() =>
                      void deleteLibraryDocument(d.id, d.storagePath).then((err) => {
                        flash(err || 'Đã xóa')
                        void refresh()
                      })
                    }
                  >
                    Xóa
                  </ActionBtn>
                </div>
              </Td>
            </tr>
          ))}
          {!docs.length && !loading ? (
            <tr>
              <Td className="text-sm text-espresso-500">
                Chưa có PDF. Upload hoặc bấm “Seed 3 PDF demo” (cần staff session).
              </Td>
            </tr>
          ) : null}
        </tbody>
      </AdminTable>
    </div>
  )
}
