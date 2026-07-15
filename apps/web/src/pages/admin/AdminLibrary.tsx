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
  ECOSYSTEM_LAYERS,
  SERVICE_LINES,
  deleteDocument,
  listProductionDocuments,
  setDocumentStatus,
  uploadProductionDocument,
  type DocAccess,
  type DocStatus,
  type ProductionDocument,
} from '@/data/production-library'
import { adminApi } from '@/lib/production-auth'
import { formatFileSize } from '@/data/library-store'
import { Link } from 'react-router-dom'

export function AdminLibrary() {
  const [docs, setDocs] = useState<ProductionDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<DocStatus | ''>('')
  const [layer, setLayer] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState('PDF')
  const [ecosystemLayer, setEcosystemLayer] = useState(ECOSYSTEM_LAYERS[0])
  const [serviceLine, setServiceLine] = useState(SERVICE_LINES[0])
  const [tags, setTags] = useState('')
  const [version, setVersion] = useState('1.0')
  const [accessLevel, setAccessLevel] = useState<DocAccess>('partner')
  const [docStatus, setDocStatus] = useState<DocStatus>('draft')
  const [summary, setSummary] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [replaceId, setReplaceId] = useState<string | null>(null)

  function flash(m: string) {
    setToast(m)
    window.setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const res = await listProductionDocuments(
      { q, status, layer, includeArchived: true },
      { staffView: true },
    )
    setLoading(false)
    setError(res.error)
    setDocs(res.docs)
  }, [q, status, layer])

  useEffect(() => {
    void load()
  }, [load])

  async function onUpload(e: FormEvent) {
    e.preventDefault()
    if (!file || !title.trim()) {
      flash('Chọn file và nhập tiêu đề')
      return
    }
    const res = await uploadProductionDocument(file, {
      title,
      docType,
      ecosystemLayer,
      serviceLine,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      version,
      status: docStatus,
      accessLevel,
      summary,
      replaceDocumentId: replaceId || undefined,
    })
    if (res.error) {
      flash(res.error)
      return
    }
    flash(replaceId ? 'Đã thay version mới' : 'Đã upload')
    setTitle('')
    setSummary('')
    setTags('')
    setFile(null)
    setReplaceId(null)
    if (fileRef.current) fileRef.current.value = ''
    void load()
  }

  async function purgeDemo() {
    const res = await adminApi<{ removed_paths?: string[] }>('/api/admin/documents', {
      method: 'POST',
      body: JSON.stringify({ action: 'purge_demo_files' }),
    })
    flash(res.error || `Purged demo files: ${(res.data?.removed_paths || []).length}`)
    void load()
  }

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Document library"
        description="Upload, version, publish / unpublish / archive / delete. Partner library: /portal/documents"
      />

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

      <form
        onSubmit={(e) => void onUpload(e)}
        className="mb-6 grid gap-3 rounded-2xl border border-portal-200 bg-white p-5 shadow-sm lg:grid-cols-3"
      >
        <p className="text-sm font-semibold text-espresso-900 lg:col-span-3">
          {replaceId ? `Replace version — ${replaceId.slice(0, 8)}…` : 'Upload document'}
        </p>
        <input
          className={fieldClass() + ' w-full lg:col-span-2'}
          placeholder="Title *"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select className={fieldClass() + ' w-full'} value={docType} onChange={(e) => setDocType(e.target.value)}>
          <option>PDF</option>
          <option>DOCX</option>
          <option>XLSX</option>
          <option>PPTX</option>
        </select>
        <select
          className={fieldClass() + ' w-full'}
          value={ecosystemLayer}
          onChange={(e) => setEcosystemLayer(e.target.value)}
        >
          {ECOSYSTEM_LAYERS.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <select
          className={fieldClass() + ' w-full'}
          value={serviceLine}
          onChange={(e) => setServiceLine(e.target.value)}
        >
          {SERVICE_LINES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          className={fieldClass() + ' w-full'}
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <input
          className={fieldClass() + ' w-full'}
          placeholder="Version"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
        />
        <select
          className={fieldClass() + ' w-full'}
          value={docStatus}
          onChange={(e) => setDocStatus(e.target.value as DocStatus)}
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
        <select
          className={fieldClass() + ' w-full'}
          value={accessLevel}
          onChange={(e) => setAccessLevel(e.target.value as DocAccess)}
        >
          <option value="partner">partner</option>
          <option value="staff">staff</option>
          <option value="authenticated">authenticated</option>
          <option value="public">public</option>
        </select>
        <input
          className={fieldClass() + ' w-full lg:col-span-2'}
          placeholder="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf"
          className="text-sm lg:col-span-3"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex flex-wrap gap-2 lg:col-span-3">
          <ActionBtn variant="primary" type="submit">
            {replaceId ? 'Upload new version' : 'Upload'}
          </ActionBtn>
          {replaceId ? (
            <ActionBtn type="button" onClick={() => setReplaceId(null)}>
              Cancel replace
            </ActionBtn>
          ) : null}
          <ActionBtn type="button" onClick={() => void purgeDemo()}>
            Purge demo storage files
          </ActionBtn>
          <Link to="/portal/documents" className="text-xs font-medium text-portal-700 self-center">
            Partner view →
          </Link>
        </div>
      </form>

      <FilterBar>
        <input
          className={fieldClass()}
          placeholder="Search title"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className={fieldClass()}
          value={status}
          onChange={(e) => setStatus(e.target.value as DocStatus | '')}
        >
          <option value="">All status</option>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </select>
        <select className={fieldClass()} value={layer} onChange={(e) => setLayer(e.target.value)}>
          <option value="">All layers</option>
          {ECOSYSTEM_LAYERS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <ActionBtn onClick={() => void load()}>{loading ? '…' : 'Apply'}</ActionBtn>
      </FilterBar>

      <AdminTable>
        <thead>
          <tr>
            <Th>Document</Th>
            <Th>Layer / Service</Th>
            <Th>Ver</Th>
            <Th>Access</Th>
            <Th>Status</Th>
            <Th>Downloads</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {docs.map((d) => (
            <tr key={d.id} className="hover:bg-portal-50/40">
              <Td>
                <p className="font-medium text-espresso-900">{d.title}</p>
                <p className="text-[11px] text-espresso-500">
                  {d.docType} · {formatFileSize(d.fileSize)} · {d.ownerName || '—'} ·{' '}
                  {new Date(d.updatedAt).toLocaleDateString('vi-VN')}
                </p>
                {d.tags.length ? (
                  <p className="mt-0.5 text-[10px] text-portal-600">{d.tags.join(' · ')}</p>
                ) : null}
              </Td>
              <Td className="text-xs">
                <div>{d.ecosystemLayer || '—'}</div>
                <div className="text-espresso-500">{d.serviceLine || '—'}</div>
              </Td>
              <Td className="text-xs font-mono">{d.version}</Td>
              <Td className="text-xs">{d.accessLevel}</Td>
              <Td>
                <AdminBadge
                  tone={
                    d.status === 'published' ? 'ok' : d.status === 'archived' ? 'neutral' : 'warn'
                  }
                >
                  {d.status}
                </AdminBadge>
              </Td>
              <Td className="text-xs tabular-nums">{d.downloadCount}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {d.status !== 'published' ? (
                    <ActionBtn
                      onClick={() =>
                        void setDocumentStatus(d.id, 'published').then((e) => {
                          flash(e || 'Published')
                          void load()
                        })
                      }
                    >
                      Publish
                    </ActionBtn>
                  ) : (
                    <ActionBtn
                      onClick={() =>
                        void setDocumentStatus(d.id, 'draft').then((e) => {
                          flash(e || 'Unpublished')
                          void load()
                        })
                      }
                    >
                      Unpublish
                    </ActionBtn>
                  )}
                  <ActionBtn
                    onClick={() =>
                      void setDocumentStatus(d.id, 'archived').then((e) => {
                        flash(e || 'Archived')
                        void load()
                      })
                    }
                  >
                    Archive
                  </ActionBtn>
                  <ActionBtn
                    onClick={() => {
                      setReplaceId(d.id)
                      setTitle(d.title)
                      setVersion(`${d.versionNumber + 1}.0`)
                      setEcosystemLayer(d.ecosystemLayer || ECOSYSTEM_LAYERS[0])
                      setServiceLine(d.serviceLine || SERVICE_LINES[0])
                      setTags(d.tags.join(', '))
                      setAccessLevel(d.accessLevel)
                      setDocStatus(d.status)
                      setSummary(d.summary || '')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    Replace
                  </ActionBtn>
                  <ActionBtn
                    variant="danger"
                    onClick={() =>
                      void deleteDocument(d.id, d.storagePath).then((e) => {
                        flash(e || 'Deleted')
                        void load()
                      })
                    }
                  >
                    Delete
                  </ActionBtn>
                </div>
              </Td>
            </tr>
          ))}
          {!docs.length && !loading ? (
            <tr>
              <Td className="text-sm text-espresso-500">
                No documents — upload the first production file.
              </Td>
            </tr>
          ) : null}
        </tbody>
      </AdminTable>
    </div>
  )
}
