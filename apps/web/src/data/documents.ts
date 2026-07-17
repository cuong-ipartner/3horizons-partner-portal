/**
 * Simplified documents module — Admin full CRUD, Partner published-only.
 * Table: public.documents · Storage bucket: documents
 */

import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'

export const DOCUMENTS_BUCKET = 'documents'

export type DocStatus = 'draft' | 'published'

export type DocumentRow = {
  id: string
  title: string
  description: string | null
  fileName: string
  filePath: string
  fileSize: number | null
  mimeType: string | null
  tags: string[]
  status: DocStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  publishedAt: string | null
}

type DbRow = {
  id: string
  title: string
  description: string | null
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  tags: string[] | null
  status: DocStatus
  created_by: string
  created_at: string
  updated_at: string
  published_at: string | null
}

const SELECT =
  'id,title,description,file_name,file_path,file_size,mime_type,tags,status,created_by,created_at,updated_at,published_at'

export const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
] as const

export const ALLOWED_EXT = /\.(pdf|docx?|xlsx?|pptx?|png|jpe?g)$/i

/** 25 MB */
export const MAX_FILE_BYTES = 25 * 1024 * 1024

function mapRow(r: DbRow): DocumentRow {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    fileName: r.file_name,
    filePath: r.file_path,
    fileSize: r.file_size,
    mimeType: r.mime_type,
    tags: r.tags ?? [],
    status: r.status === 'published' ? 'published' : 'draft',
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
  }
}

export function formatFileSize(bytes: number | null | undefined) {
  if (bytes == null || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function fileTypeLabel(doc: DocumentRow) {
  const name = doc.fileName || ''
  const ext = name.includes('.') ? name.split('.').pop()!.toUpperCase() : ''
  if (ext) return ext
  if (doc.mimeType?.includes('pdf')) return 'PDF'
  if (doc.mimeType?.includes('image')) return 'Image'
  return 'File'
}

export function isPdf(doc: DocumentRow) {
  return (
    doc.mimeType === 'application/pdf' ||
    doc.fileName.toLowerCase().endsWith('.pdf')
  )
}

function requireClient() {
  const sb = getSupabase()
  if (!sb || !isSupabaseAuthEnabled()) {
    return {
      sb: null as null,
      error:
        'Supabase chưa cấu hình (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Redeploy với env Production.',
    }
  }
  return { sb, error: null as null }
}

export type ListFilters = {
  q?: string
  status?: DocStatus | ''
  /** staffView=true: all statuses; false: only published (partner) */
  staffView?: boolean
}

export async function listDocuments(
  filters: ListFilters = {},
): Promise<{ docs: DocumentRow[]; error: string | null; needsAuth?: boolean }> {
  const { sb, error: cfgErr } = requireClient()
  if (!sb) return { docs: [], error: cfgErr }

  const {
    data: { session },
  } = await sb.auth.getSession()
  if (!session) {
    return {
      docs: [],
      error: 'Cần đăng nhập.',
      needsAuth: true,
    }
  }

  let q = sb.from('documents').select(SELECT).order('updated_at', { ascending: false })

  if (!filters.staffView) {
    q = q.eq('status', 'published')
  } else if (filters.status) {
    q = q.eq('status', filters.status)
  }

  if (filters.q?.trim()) {
    const term = filters.q.trim()
    q = q.or(`title.ilike.%${term}%,description.ilike.%${term}%`)
  }

  const { data, error } = await q
  if (error) return { docs: [], error: error.message }

  let docs = ((data ?? []) as DbRow[]).map(mapRow)

  // Client-side tag search (array)
  if (filters.q?.trim()) {
    const t = filters.q.trim().toLowerCase()
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(t) ||
        (d.description || '').toLowerCase().includes(t) ||
        d.tags.some((tag) => tag.toLowerCase().includes(t)),
    )
  }

  return { docs, error: null }
}

export async function getDocument(
  id: string,
): Promise<{ doc: DocumentRow | null; error: string | null }> {
  const { sb, error: cfgErr } = requireClient()
  if (!sb) return { doc: null, error: cfgErr }

  const { data, error } = await sb.from('documents').select(SELECT).eq('id', id).maybeSingle()
  if (error) return { doc: null, error: error.message }
  if (!data) return { doc: null, error: 'Document not found' }
  return { doc: mapRow(data as DbRow), error: null }
}

export async function getSignedDownloadUrl(filePath: string, expiresSec = 3600) {
  const { sb, error: cfgErr } = requireClient()
  if (!sb) return { url: null as string | null, error: cfgErr }
  const { data, error } = await sb.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(filePath, expiresSec)
  if (error) return { url: null, error: error.message }
  return { url: data.signedUrl, error: null }
}

export function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export function validateUploadFile(file: File): string | null {
  if (file.size > MAX_FILE_BYTES) {
    return `File quá lớn (tối đa ${formatFileSize(MAX_FILE_BYTES)}).`
  }
  const okMime = ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])
  const okExt = ALLOWED_EXT.test(file.name)
  if (!okMime && !okExt) {
    return 'Định dạng không hỗ trợ. Dùng PDF, DOCX, XLSX, PPTX, PNG, JPG.'
  }
  return null
}

export type UploadInput = {
  file: File
  title: string
  description?: string
  tags?: string[]
  status?: DocStatus
}

export async function uploadDocument(
  input: UploadInput,
  onProgress?: (pct: number) => void,
): Promise<{ doc: DocumentRow | null; error: string | null }> {
  const { sb, error: cfgErr } = requireClient()
  if (!sb) return { doc: null, error: cfgErr }

  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { doc: null, error: 'Not authenticated' }

  const title = input.title.trim()
  if (!title) return { doc: null, error: 'Title is required' }
  const fileErr = validateUploadFile(input.file)
  if (fileErr) return { doc: null, error: fileErr }

  const status: DocStatus = input.status === 'published' ? 'published' : 'draft'
  const safeName = input.file.name.replace(/[^\w.\-()+ ]+/g, '_').slice(0, 120)
  const path = `${user.id}/${Date.now().toString(36)}-${safeName}`

  onProgress?.(10)
  const { error: upErr } = await sb.storage.from(DOCUMENTS_BUCKET).upload(path, input.file, {
    contentType: input.file.type || 'application/octet-stream',
    upsert: false,
  })
  if (upErr) return { doc: null, error: upErr.message }
  onProgress?.(70)

  const row = {
    title,
    description: input.description?.trim() || null,
    file_name: input.file.name,
    file_path: path,
    file_size: input.file.size,
    mime_type: input.file.type || null,
    tags: input.tags || [],
    status,
    created_by: user.id,
    published_at: status === 'published' ? new Date().toISOString() : null,
  }

  const { data, error } = await sb.from('documents').insert(row).select(SELECT).single()
  if (error) {
    await sb.storage.from(DOCUMENTS_BUCKET).remove([path])
    return { doc: null, error: error.message }
  }
  onProgress?.(100)
  return { doc: mapRow(data as DbRow), error: null }
}

export async function updateDocumentMeta(
  id: string,
  patch: { title?: string; description?: string | null; tags?: string[] },
): Promise<string | null> {
  const { sb, error: cfgErr } = requireClient()
  if (!sb) return cfgErr
  const body: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (patch.title !== undefined) body.title = patch.title.trim()
  if (patch.description !== undefined) body.description = patch.description
  if (patch.tags !== undefined) body.tags = patch.tags
  const { error } = await sb.from('documents').update(body).eq('id', id)
  return error?.message ?? null
}

/** Publish: set published_at = now(). Unpublish: set published_at = null (consistent). */
export async function setDocumentStatus(
  id: string,
  status: DocStatus,
): Promise<string | null> {
  const { sb, error: cfgErr } = requireClient()
  if (!sb) return cfgErr
  const { error } = await sb
    .from('documents')
    .update({
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  return error?.message ?? null
}

export async function deleteDocument(
  id: string,
  filePath: string,
): Promise<string | null> {
  const { sb, error: cfgErr } = requireClient()
  if (!sb) return cfgErr
  const { error } = await sb.from('documents').delete().eq('id', id)
  if (error) return error.message
  await sb.storage.from(DOCUMENTS_BUCKET).remove([filePath])
  return null
}
