/**
 * @deprecated Use `@/data/documents` — simplified documents module.
 * Kept as thin re-exports for any residual imports.
 */

export {
  listDocuments as listProductionDocuments,
  getSignedDownloadUrl as getDocumentSignedUrl,
  setDocumentStatus,
  deleteDocument,
  formatFileSize,
  type DocumentRow as ProductionDocument,
  type DocStatus,
} from '@/data/documents'

/** no-op legacy */
export async function trackDownload(_doc: unknown) {
  /* removed */
}

export const ECOSYSTEM_LAYERS: string[] = []
export const SERVICE_LINES: string[] = []
