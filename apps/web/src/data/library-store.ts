/**
 * Partner library documents — Supabase Storage (partner-library bucket) + metadata table.
 */

import { useCallback, useEffect, useState } from 'react'
import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'
import { buildSimplePdf, slugifyFilename } from '@/lib/pdf'

export const LIBRARY_BUCKET = 'partner-library'

export type LibraryDocument = {
  id: string
  title: string
  tag: string
  fileType: string
  storagePath: string
  fileSize: number | null
  summary: string | null
  published: boolean
  sortOrder: number
  updatedAt: string
  createdAt: string
}

type DocRow = {
  id: string
  title: string
  tag: string
  file_type: string
  storage_path: string
  file_size: number | null
  summary: string | null
  published: boolean
  sort_order: number
  updated_at: string
  created_at: string
}

function mapRow(r: DocRow): LibraryDocument {
  return {
    id: r.id,
    title: r.title,
    tag: r.tag,
    fileType: r.file_type,
    storagePath: r.storage_path,
    fileSize: r.file_size,
    summary: r.summary,
    published: r.published,
    sortOrder: r.sort_order,
    updatedAt: r.updated_at,
    createdAt: r.created_at,
  }
}

export async function listLibraryDocuments(opts?: {
  includeDrafts?: boolean
}): Promise<{ docs: LibraryDocument[]; error: string | null; needsAuth?: boolean }> {
  const sb = getSupabase()
  if (!sb || !isSupabaseAuthEnabled()) {
    return {
      docs: [],
      error:
        'Supabase chưa cấu hình trên bản build (thiếu VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Set env trên Cloudflare Pages rồi redeploy.',
      needsAuth: false,
    }
  }

  const {
    data: { session },
  } = await sb.auth.getSession()
  if (!session) {
    return {
      docs: [],
      error:
        'Cần đăng nhập bằng tài khoản Supabase Auth được cấp (staff/partner).',
      needsAuth: true,
    }
  }

  let q = sb
    .from('library_documents')
    .select(
      'id, title, tag, file_type, storage_path, file_size, summary, published, sort_order, updated_at, created_at',
    )
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })

  if (!opts?.includeDrafts) {
    q = q.eq('published', true)
  }

  const { data, error } = await q
  if (error) {
    return {
      docs: [],
      error: error.message,
      needsAuth: /JWT|auth|permission|RLS/i.test(error.message),
    }
  }
  return { docs: ((data ?? []) as DocRow[]).map(mapRow), error: null }
}

/** Signed URL for private PDF (default 1h). */
export async function getLibrarySignedUrl(
  storagePath: string,
  expiresSec = 3600,
): Promise<{ url: string | null; error: string | null }> {
  const sb = getSupabase()
  if (!sb) return { url: null, error: 'No Supabase client' }

  const { data, error } = await sb.storage
    .from(LIBRARY_BUCKET)
    .createSignedUrl(storagePath, expiresSec)

  if (error) return { url: null, error: error.message }
  return { url: data.signedUrl, error: null }
}

export async function uploadLibraryPdf(opts: {
  file: File | Blob
  title: string
  tag?: string
  summary?: string
  published?: boolean
  filenameHint?: string
}): Promise<{ doc: LibraryDocument | null; error: string | null }> {
  const sb = getSupabase()
  if (!sb) return { doc: null, error: 'No Supabase client' }

  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { doc: null, error: 'Cần đăng nhập staff để upload' }

  const base =
    opts.filenameHint ||
    (opts.file instanceof File ? opts.file.name.replace(/\.pdf$/i, '') : slugifyFilename(opts.title))
  const safe = slugifyFilename(base) || `doc-${Date.now().toString(36)}`
  const path = `docs/${safe}-${Date.now().toString(36)}.pdf`

  const { error: upErr } = await sb.storage.from(LIBRARY_BUCKET).upload(path, opts.file, {
    contentType: 'application/pdf',
    upsert: false,
  })
  if (upErr) return { doc: null, error: upErr.message }

  const size = opts.file.size
  const { data, error } = await sb
    .from('library_documents')
    .insert({
      title: opts.title.trim(),
      tag: opts.tag?.trim() || 'Nền tảng',
      file_type: 'PDF',
      storage_path: path,
      file_size: size,
      summary: opts.summary?.trim() || null,
      published: opts.published !== false,
      created_by: user.id,
    })
    .select(
      'id, title, tag, file_type, storage_path, file_size, summary, published, sort_order, updated_at, created_at',
    )
    .single()

  if (error) {
    // best-effort cleanup
    await sb.storage.from(LIBRARY_BUCKET).remove([path])
    return { doc: null, error: error.message }
  }

  return { doc: mapRow(data as DocRow), error: null }
}

export async function deleteLibraryDocument(
  id: string,
  storagePath: string,
): Promise<string | null> {
  const sb = getSupabase()
  if (!sb) return 'No Supabase client'

  const { error: dErr } = await sb.from('library_documents').delete().eq('id', id)
  if (dErr) return dErr.message

  const { error: sErr } = await sb.storage.from(LIBRARY_BUCKET).remove([storagePath])
  if (sErr) return `Metadata đã xóa; storage: ${sErr.message}`
  return null
}

export async function setLibraryPublished(
  id: string,
  published: boolean,
): Promise<string | null> {
  const sb = getSupabase()
  if (!sb) return 'No Supabase client'
  const { error } = await sb.from('library_documents').update({ published }).eq('id', id)
  return error?.message ?? null
}

/** Seed 3 demo PDFs into storage + metadata (staff only). */
export async function seedDemoLibraryPdfs(): Promise<{
  created: number
  error: string | null
}> {
  const sb = getSupabase()
  if (!sb) return { created: 0, error: 'No Supabase client' }

  const seeds = [
    {
      title: 'Bộ tài liệu nền — Mạng lưới đối tác',
      tag: 'Nền tảng',
      summary: 'Định vị problem-first, verified partner, collaboration có kiểm soát.',
      lines: [
        '3HORIZONS Partner Network — curated, not marketplace.',
        'Private workspace: engagement, library, standing.',
        'Matching is desk-coordinated. Partners do not self-match.',
      ],
    },
    {
      title: 'SOP: Điều phối workshop chiến lược',
      tag: 'Chuẩn mực',
      summary: 'Chuẩn bị — trong phòng — bàn giao 48h.',
      lines: [
        'Prep: one-page intent, decision list, roles.',
        'In-room: timebox, capture decisions, protect scope.',
        'Handoff in 48h: decisions, owners, due dates.',
      ],
    },
    {
      title: 'Brief chiến lược AI cho HĐQT',
      tag: 'Insight',
      summary: 'Ba câu hỏi board: value, risk, capability.',
      lines: [
        'Where does AI create measurable value?',
        'How is risk governed?',
        'What capability is needed in 12 months?',
      ],
    },
  ]

  let created = 0
  for (const s of seeds) {
    // skip if title already exists
    const { data: existing } = await sb
      .from('library_documents')
      .select('id')
      .eq('title', s.title)
      .maybeSingle()
    if (existing) continue

    const blob = buildSimplePdf({
      title: s.title,
      lines: s.lines,
      footer: '3HORIZONS · Partner library · Confidential',
    })
    const res = await uploadLibraryPdf({
      file: blob,
      title: s.title,
      tag: s.tag,
      summary: s.summary,
      published: true,
      filenameHint: slugifyFilename(s.title),
    })
    if (res.error) return { created, error: res.error }
    created += 1
  }

  return { created, error: null }
}

export function formatFileSize(bytes: number | null) {
  if (bytes == null || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function useLibraryDocuments(includeDrafts = false) {
  const [docs, setDocs] = useState<LibraryDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { docs: list, error: err } = await listLibraryDocuments({ includeDrafts })
    setDocs(list)
    setError(err)
    setLoading(false)
  }, [includeDrafts])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { docs, loading, error, refresh }
}
