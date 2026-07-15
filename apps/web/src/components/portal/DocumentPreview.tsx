import { useEffect } from 'react'
import { Download, ExternalLink, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export type PreviewDoc = {
  title: string
  type: string
  tag: string
  /** Editorial fallback when no PDF URL */
  body?: string[]
  /** Supabase signed URL for real PDF */
  pdfUrl?: string | null
  loading?: boolean
  error?: string | null
}

type Props = {
  doc: PreviewDoc | null
  onClose: () => void
}

/** PDF iframe when signed URL present; else editorial text preview. */
export function DocumentPreview({ doc, onClose }: Props) {
  useEffect(() => {
    if (!doc) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [doc, onClose])

  if (!doc) return null

  const wide = Boolean(doc.pdfUrl) || doc.loading

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal
      aria-label={doc.title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-espresso-900/50 backdrop-blur-[2px] animate-portal-fade"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 flex max-h-[min(92vh,880px)] w-full flex-col overflow-hidden',
          'rounded-[1.25rem] border border-espresso-900/10 bg-cream-50 shadow-[0_24px_64px_rgba(28,22,16,0.25)]',
          'animate-portal-rise',
          wide ? 'max-w-4xl' : 'max-w-lg',
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-espresso-900/8 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-600">
              {doc.tag} · {doc.type}
            </p>
            <h2 className="mt-1 font-display text-base font-semibold text-espresso-900">{doc.title}</h2>
            <p className="mt-1 text-[11px] text-espresso-500">
              {doc.pdfUrl
                ? 'PDF từ Supabase Storage · signed URL (1h)'
                : doc.loading
                  ? 'Đang lấy signed URL…'
                  : 'Bản xem editorial (chưa có file storage)'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {doc.pdfUrl ? (
              <>
                <a
                  href={doc.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-1.5 text-espresso-500 transition hover:bg-cream-100 hover:text-espresso-900"
                  title="Mở tab mới"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href={doc.pdfUrl}
                  download
                  className="rounded-lg p-1.5 text-espresso-500 transition hover:bg-cream-100 hover:text-espresso-900"
                  title="Tải PDF"
                >
                  <Download className="h-4 w-4" />
                </a>
              </>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-espresso-500 transition hover:bg-cream-100 hover:text-espresso-900"
              aria-label="Đóng preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {doc.loading ? (
          <div className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-espresso-500">
            Đang mở PDF từ storage…
          </div>
        ) : doc.error ? (
          <div className="flex flex-1 items-center justify-center px-6 py-16 text-center text-sm text-terracotta-600">
            {doc.error}
          </div>
        ) : doc.pdfUrl ? (
          <iframe
            title={doc.title}
            src={doc.pdfUrl}
            className="min-h-[70vh] w-full flex-1 bg-espresso-900/5"
          />
        ) : (
          <div className="paper-texture flex-1 overflow-y-auto px-6 py-6 sm:px-8">
            <article className="mx-auto max-w-prose">
              <div className="mb-6 h-px w-12 bg-gold-600/60" />
              {(doc.body ?? []).map((p) => (
                <p key={p.slice(0, 24)} className="mb-4 text-sm leading-relaxed text-espresso-700">
                  {p}
                </p>
              ))}
              <p className="mt-8 text-[11px] tracking-wide text-espresso-500">
                3HORIZONS · Private partner library · Confidential
              </p>
            </article>
          </div>
        )}
      </div>
    </div>
  )
}
