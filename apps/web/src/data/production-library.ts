/**
 * Production document library — metadata, versions, activity, RBAC-aware lists.
 */

import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'
import { slugifyFilename } from '@/lib/pdf'

export type DocStatus = 'draft' | 'published' | 'archived'
export type DocAccess = 'public' | 'authenticated' | 'partner' | 'staff'

export type ProductionDocument = {
  id: string
  title: string
  docType: string
  ecosystemLayer: string | null
  serviceLine: string | null
  tags: string[]
  version: string
  versionNumber: number
  status: DocStatus
  accessLevel: DocAccess
  ownerName: string | null
  ownerId: string | null
  storagePath: string
  fileSize: number | null
  summary: string | null
  downloadCount: number
  updatedAt: string
  createdAt: string
}

export type DocumentFilters = {
  q?: string
  status?: DocStatus | ''
  layer?: string
  service?: string
  tag?: string
  access?: DocAccess | ''
  includeArchived?: boolean
}

type Row = {
  id: string
  title: string
  doc_type: string | null
  file_type: string | null
  ecosystem_layer: string | null
  service_line: string | null
  tags: string[] | null
  version: string | null
  version_number: number | null
  status: DocStatus
  access_level: DocAccess
  owner_name: string | null
  owner_id: string | null
  storage_path: string
  file_size: number | null
  summary: string | null
  download_count: number | null
  updated_at: string
  created_at: string
  published?: boolean
}

function mapRow(r: Row): ProductionDocument {
  return {
    id: r.id,
    title: r.title,
    docType: r.doc_type || r.file_type || 'PDF',
    ecosystemLayer: r.ecosystem_layer,
    serviceLine: r.service_line,
    tags: r.tags ?? [],
    version: r.version || '1.0',
    versionNumber: r.version_number ?? 1,
    status: r.status || (r.published ? 'published' : 'draft'),
    accessLevel: r.access_level || 'partner',
    ownerName: r.owner_name,
    ownerId: r.owner_id,
    storagePath: r.storage_path,
    fileSize: r.file_size,
    summary: r.summary,
    downloadCount: r.download_count ?? 0,
    updatedAt: r.updated_at,
    createdAt: r.created_at,
  }
}

const SELECT =
  'id,title,doc_type,file_type,ecosystem_layer,service_line,tags,version,version_number,status,access_level,owner_name,owner_id,storage_path,file_size,summary,download_count,updated_at,created_at,published'

export async function listProductionDocuments(
  filters: DocumentFilters = {},
  opts?: { staffView?: boolean },
): Promise<{ docs: ProductionDocument[]; error: string | null; needsAuth?: boolean }> {
  const sb = getSupabase()
  if (!sb || !isSupabaseAuthEnabled()) {
    return {
      docs: [],
      error:
        'Chưa kết nối Supabase trên bản build. Cloudflare Pages cần VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY rồi redeploy.',
    }
  }

  const {
    data: { session },
  } = await sb.auth.getSession()
  if (!session) {
    return {
      docs: [],
      error: 'Phiên đăng nhập hết hạn. Đăng nhập lại tại /admin/login (staff) hoặc /login (partner).',
      needsAuth: true,
    }
  }

  let q = sb.from('library_documents').select(SELECT).order('updated_at', { ascending: false })

  if (!opts?.staffView) {
    q = q.eq('status', 'published')
  } else if (filters.status) {
    q = q.eq('status', filters.status)
  } else if (!filters.includeArchived) {
    q = q.neq('status', 'archived')
  }

  if (filters.layer) q = q.eq('ecosystem_layer', filters.layer)
  if (filters.service) q = q.eq('service_line', filters.service)
  if (filters.access) q = q.eq('access_level', filters.access)
  if (filters.tag) q = q.contains('tags', [filters.tag])
  if (filters.q?.trim()) q = q.ilike('title', `%${filters.q.trim()}%`)

  const { data, error } = await q
  if (error) return { docs: [], error: error.message }
  return { docs: ((data ?? []) as Row[]).map(mapRow), error: null }
}

export async function logLibraryActivity(
  documentId: string | null,
  action: string,
  meta: Record<string, unknown> = {},
) {
  const sb = getSupabase()
  if (!sb) return
  const {
    data: { user },
  } = await sb.auth.getUser()
  await sb.from('library_activity').insert({
    document_id: documentId,
    actor_id: user?.id ?? null,
    actor_email: user?.email ?? null,
    action,
    meta,
  })
}

export async function getDocumentSignedUrl(storagePath: string) {
  const sb = getSupabase()
  if (!sb) return { url: null as string | null, error: 'No client' }
  const { data, error } = await sb.storage
    .from('partner-library')
    .createSignedUrl(storagePath, 3600)
  if (error) return { url: null, error: error.message }
  return { url: data.signedUrl, error: null }
}

export async function trackDownload(doc: ProductionDocument) {
  const sb = getSupabase()
  if (!sb) return
  await sb
    .from('library_documents')
    .update({ download_count: (doc.downloadCount || 0) + 1 })
    .eq('id', doc.id)
  await logLibraryActivity(doc.id, 'download', { title: doc.title, version: doc.version })
}

export type UploadMeta = {
  title: string
  docType?: string
  ecosystemLayer?: string
  serviceLine?: string
  tags?: string[]
  version?: string
  status?: DocStatus
  accessLevel?: DocAccess
  summary?: string
  replaceDocumentId?: string
}

export async function uploadProductionDocument(
  file: File,
  meta: UploadMeta,
): Promise<{ doc: ProductionDocument | null; error: string | null }> {
  const sb = getSupabase()
  if (!sb) return { doc: null, error: 'No Supabase client' }
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { doc: null, error: 'Not authenticated' }

  const {
    data: profile,
  } = await sb.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle()

  const profileRow = profile as { full_name?: string; role?: string } | null
  const ownerName = profileRow?.full_name || user.email || 'Staff'

  if (meta.replaceDocumentId) {
    return replaceDocumentVersion(file, meta.replaceDocumentId, meta, user.id, ownerName)
  }

  const base = slugifyFilename(meta.title || file.name.replace(/\.pdf$/i, ''))
  const path = `docs/${base}-${Date.now().toString(36)}.pdf`
  const { error: upErr } = await sb.storage.from('partner-library').upload(path, file, {
    contentType: file.type || 'application/pdf',
    upsert: false,
  })
  if (upErr) return { doc: null, error: upErr.message }

  const version = meta.version || '1.0'
  const row = {
    title: meta.title.trim(),
    doc_type: meta.docType || 'PDF',
    file_type: meta.docType || 'PDF',
    ecosystem_layer: meta.ecosystemLayer || null,
    service_line: meta.serviceLine || null,
    tags: meta.tags || [],
    version,
    version_number: 1,
    status: meta.status || 'draft',
    access_level: meta.accessLevel || 'partner',
    published: (meta.status || 'draft') === 'published',
    owner_id: user.id,
    owner_name: ownerName,
    storage_path: path,
    file_size: file.size,
    summary: meta.summary || null,
    created_by: user.id,
  }

  const { data, error } = await sb.from('library_documents').insert(row).select(SELECT).single()
  if (error) {
    await sb.storage.from('partner-library').remove([path])
    return { doc: null, error: error.message }
  }

  const doc = mapRow(data as Row)
  await sb.from('library_document_versions').insert({
    document_id: doc.id,
    version: doc.version,
    version_number: 1,
    storage_path: path,
    file_size: file.size,
    notes: 'Initial upload',
    created_by: user.id,
  })
  await logLibraryActivity(doc.id, 'upload', { version: doc.version })
  await sb.from('audit_logs').insert({
    actor_id: user.id,
    actor_email: user.email,
    action: 'document.upload',
    entity_type: 'document',
    entity_id: doc.id,
    meta: { title: doc.title, version: doc.version },
  })

  return { doc, error: null }
}

async function replaceDocumentVersion(
  file: File,
  documentId: string,
  meta: UploadMeta,
  userId: string,
  ownerName: string,
): Promise<{ doc: ProductionDocument | null; error: string | null }> {
  const sb = getSupabase()
  if (!sb) return { doc: null, error: 'No client' }

  const { data: existing, error: exErr } = await sb
    .from('library_documents')
    .select(SELECT)
    .eq('id', documentId)
    .single()
  if (exErr || !existing) return { doc: null, error: exErr?.message || 'Not found' }
  const prev = mapRow(existing as Row)

  const nextNum = prev.versionNumber + 1
  const version = meta.version || `${nextNum}.0`
  const path = `docs/${slugifyFilename(prev.title)}-v${nextNum}-${Date.now().toString(36)}.pdf`

  const { error: upErr } = await sb.storage.from('partner-library').upload(path, file, {
    contentType: file.type || 'application/pdf',
    upsert: false,
  })
  if (upErr) return { doc: null, error: upErr.message }

  const { data, error } = await sb
    .from('library_documents')
    .update({
      storage_path: path,
      file_size: file.size,
      version,
      version_number: nextNum,
      title: meta.title?.trim() || prev.title,
      ecosystem_layer: meta.ecosystemLayer ?? prev.ecosystemLayer,
      service_line: meta.serviceLine ?? prev.serviceLine,
      tags: meta.tags ?? prev.tags,
      status: meta.status ?? prev.status,
      access_level: meta.accessLevel ?? prev.accessLevel,
      published: (meta.status ?? prev.status) === 'published',
      summary: meta.summary ?? prev.summary,
      owner_name: ownerName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)
    .select(SELECT)
    .single()

  if (error) return { doc: null, error: error.message }

  await sb.from('library_document_versions').insert({
    document_id: documentId,
    version,
    version_number: nextNum,
    storage_path: path,
    file_size: file.size,
    notes: 'Replaced file',
    created_by: userId,
  })
  await logLibraryActivity(documentId, 'replace', { version, previous: prev.version })
  return { doc: mapRow(data as Row), error: null }
}

export async function setDocumentStatus(id: string, status: DocStatus) {
  const sb = getSupabase()
  if (!sb) return 'No client'
  const { error } = await sb
    .from('library_documents')
    .update({
      status,
      published: status === 'published',
      archived_at: status === 'archived' ? new Date().toISOString() : null,
    })
    .eq('id', id)
  if (!error) await logLibraryActivity(id, `status.${status}`, {})
  return error?.message ?? null
}

export async function deleteDocument(id: string, storagePath: string) {
  const sb = getSupabase()
  if (!sb) return 'No client'
  const { error } = await sb.from('library_documents').delete().eq('id', id)
  if (error) return error.message
  await sb.storage.from('partner-library').remove([storagePath])
  await logLibraryActivity(null, 'delete', { id, storagePath })
  return null
}

export async function listDocumentVersions(documentId: string) {
  const sb = getSupabase()
  if (!sb) return []
  const { data } = await sb
    .from('library_document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })
  return data ?? []
}

export const ECOSYSTEM_LAYERS = [
  'T1 Corporate Strategy',
  'T2 Corporate Governance',
  'T3 Capability / FMFT',
  'T4 Execution / SKALE',
  'T5 AI Strategy / ISAGC',
  'T6 Business Succession',
  'T7 Family Governance',
]

export const SERVICE_LINES = [
  'Corporate Strategy',
  'Governance',
  'Capability Building',
  'Performance & Execution',
  'AI Strategy',
  'Succession Advisory',
  'Family Governance',
]
