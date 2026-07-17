import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
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
import {
  deleteDocument,
  formatFileSize,
  getSignedDownloadUrl,
  listDocuments,
  parseTags,
  setDocumentStatus,
  updateDocumentMeta,
  uploadDocument,
  type DocStatus,
  type DocumentRow,
} from '@/data/documents'
import { isSupabaseAuthEnabled } from '@/lib/supabase'

export function AdminLibrary() {
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<DocStatus | ''>('')

  const [showUpload, setShowUpload] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [status, setStatus] = useState<DocStatus>('draft')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editTags, setEditTags] = useState('')

  function flash(m: string) {
    setToast(m)
    window.setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const res = await listDocuments({
      q,
      status: statusFilter,
      staffView: true,
    })
    setLoading(false)
    setError(res.error)
    setDocs(res.docs)
  }, [q, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  function resetForm() {
    setTitle('')
    setDescription('')
    setTags('')
    setStatus('draft')
    setFile(null)
    setProgress(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  function onPickFile(f: File | null) {
    setFile(f)
    if (f && !title.trim()) {
      setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '))
    }
  }

  async function onUpload(e: FormEvent) {
    e.preventDefault()
    if (!file || !title.trim()) {
      flash('Title và file là bắt buộc')
      return
    }
    setUploading(true)
    setProgress(5)
    const res = await uploadDocument(
      {
        file,
        title,
        description,
        tags: parseTags(tags),
        status,
      },
      (p) => setProgress(p),
    )
    setUploading(false)
    if (res.error) {
      flash(res.error)
      return
    }
    flash('Upload thành công')
    resetForm()
    setShowUpload(false)
    void load()
  }

  async function onDownload(d: DocumentRow) {
    const { url, error: err } = await getSignedDownloadUrl(d.filePath)
    if (err || !url) {
      flash(err || 'Không tạo được link tải')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function onToggleStatus(d: DocumentRow) {
    const next: DocStatus = d.status === 'published' ? 'draft' : 'published'
    const err = await setDocumentStatus(d.id, next)
    flash(err || (next === 'published' ? 'Published' : 'Unpublished (draft)'))
    void load()
  }

  async function onDelete(d: DocumentRow) {
    if (!window.confirm(`Xóa “${d.title}”? File sẽ bị gỡ khỏi storage.`)) return
    const err = await deleteDocument(d.id, d.filePath)
    flash(err || 'Đã xóa')
    void load()
  }

  async function onSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editId || !editTitle.trim()) return
    const err = await updateDocumentMeta(editId, {
      title: editTitle,
      description: editDesc.trim() || null,
      tags: parseTags(editTags),
    })
    flash(err || 'Đã lưu')
    setEditId(null)
    void load()
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Documents"
        description="Upload đơn giản. Partner chỉ thấy tài liệu Published."
        actions={
          <ActionBtn
            variant="primary"
            onClick={() => {
              setShowUpload((v) => !v)
              setEditId(null)
            }}
          >
            {showUpload ? 'Đóng form' : 'Upload document'}
          </ActionBtn>
        }
      />

      {!isSupabaseAuthEnabled() ? (
        <div className="mb-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-2 text-sm text-terracotta-600">
          Supabase chưa cấu hình trên bản build (VITE_SUPABASE_*).
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-2 text-sm text-terracotta-600">
          {error}
        </div>
      ) : null}
      {toast ? (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          {toast}
        </div>
      ) : null}

      {showUpload ? (
        <form
          onSubmit={(e) => void onUpload(e)}
          className="mb-6 space-y-4 rounded-2xl border border-portal-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-semibold text-espresso-900">Upload document</p>
          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">Title *</label>
            <input
              className={fieldClass() + ' w-full'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Document title"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">File *</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              className="text-sm"
              required
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-[11px] text-espresso-500">
              PDF, DOCX, XLSX, PPTX, PNG, JPG · tối đa 25 MB
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-espresso-600">
              Description (optional)
            </label>
            <textarea
              className={fieldClass() + ' min-h-[4.5rem] w-full py-2'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-espresso-600">
                Tags (optional, comma-separated)
              </label>
              <input
                className={fieldClass() + ' w-full'}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="onboarding, policy"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-espresso-600">Status</label>
              <select
                className={fieldClass() + ' w-full'}
                value={status}
                onChange={(e) => setStatus(e.target.value as DocStatus)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          {uploading ? (
            <div className="h-2 overflow-hidden rounded-full bg-portal-100">
              <div
                className="h-full bg-portal-700 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <ActionBtn type="button" onClick={() => { resetForm(); setShowUpload(false) }}>
              Cancel
            </ActionBtn>
            <ActionBtn variant="primary" type="submit">
              {uploading ? `Uploading… ${progress}%` : 'Upload'}
            </ActionBtn>
          </div>
        </form>
      ) : null}

      {editId ? (
        <form
          onSubmit={(e) => void onSaveEdit(e)}
          className="mb-6 space-y-3 rounded-2xl border border-portal-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-semibold text-espresso-900">Edit document</p>
          <input
            className={fieldClass() + ' w-full'}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />
          <textarea
            className={fieldClass() + ' min-h-[4rem] w-full py-2'}
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
          />
          <input
            className={fieldClass() + ' w-full'}
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="Tags"
          />
          <div className="flex gap-2">
            <ActionBtn type="button" onClick={() => setEditId(null)}>
              Cancel
            </ActionBtn>
            <ActionBtn variant="primary" type="submit">
              Save
            </ActionBtn>
          </div>
        </form>
      ) : null}

      <FilterBar>
        <input
          className={fieldClass() + ' min-w-[12rem] flex-1'}
          placeholder="Search title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className={fieldClass()}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DocStatus | '')}
        >
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <ActionBtn onClick={() => void load()}>{loading ? '…' : 'Refresh'}</ActionBtn>
      </FilterBar>

      <AdminTable>
        <thead>
          <tr>
            <Th>Document</Th>
            <Th>Tags</Th>
            <Th>Status</Th>
            <Th>Updated</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.id} className="hover:bg-portal-50/40">
              <Td>
                <p className="font-medium text-espresso-900">{d.title}</p>
                <p className="text-[11px] text-espresso-500">
                  {d.fileName} · {formatFileSize(d.fileSize)}
                </p>
                {d.description ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-espresso-500">{d.description}</p>
                ) : null}
              </Td>
              <Td className="text-xs text-portal-700">
                {d.tags.length ? d.tags.join(', ') : '—'}
              </Td>
              <Td>
                <AdminBadge tone={d.status === 'published' ? 'ok' : 'warn'}>{d.status}</AdminBadge>
              </Td>
              <Td className="text-xs text-espresso-500">
                {new Date(d.updatedAt).toLocaleString('vi-VN')}
              </Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  <ActionBtn onClick={() => void onDownload(d)}>Download</ActionBtn>
                  <ActionBtn
                    onClick={() => {
                      setEditId(d.id)
                      setEditTitle(d.title)
                      setEditDesc(d.description || '')
                      setEditTags(d.tags.join(', '))
                      setShowUpload(false)
                    }}
                  >
                    Edit
                  </ActionBtn>
                  <ActionBtn onClick={() => void onToggleStatus(d)}>
                    {d.status === 'published' ? 'Unpublish' : 'Publish'}
                  </ActionBtn>
                  <ActionBtn variant="danger" onClick={() => void onDelete(d)}>
                    Delete
                  </ActionBtn>
                </div>
              </Td>
            </tr>
          ))}
          {!docs.length && !loading ? (
            <tr>
              <Td className="text-sm text-espresso-500">Chưa có tài liệu. Upload file đầu tiên.</Td>
            </tr>
          ) : null}
        </tbody>
      </AdminTable>
    </div>
  )
}
