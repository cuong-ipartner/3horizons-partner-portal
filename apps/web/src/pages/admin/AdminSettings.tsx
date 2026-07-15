import { useState } from 'react'
import { ActionBtn, AdminPageHeader } from '@/components/admin/AdminUi'
import { adminApi } from '@/lib/production-auth'
import { isSupabaseAuthEnabled, supabaseBackendLabel } from '@/lib/supabase'

export function AdminSettings() {
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function cleanupDemoUsers() {
    setBusy(true)
    const res = await adminApi<{ archived_emails?: string[] }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'cleanup_demo' }),
    })
    setBusy(false)
    setToast(
      res.error ||
        `Archived demo emails: ${(res.data?.archived_emails || []).join(', ') || 'none'}`,
    )
  }

  async function purgeDemoFiles() {
    setBusy(true)
    const res = await adminApi<{ removed_paths?: string[] }>('/api/admin/documents', {
      method: 'POST',
      body: JSON.stringify({ action: 'purge_demo_files' }),
    })
    setBusy(false)
    setToast(res.error || `Removed storage paths: ${(res.data?.removed_paths || []).length}`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Settings & cleanup"
        description="Production hygiene — archive demo accounts and purge seed storage objects."
      />

      <div className="mb-4 rounded-2xl border border-portal-200 bg-white p-5 text-sm text-espresso-700 shadow-sm">
        <p className="font-medium text-espresso-900">Backend</p>
        <p className="mt-1 text-xs text-espresso-500">{supabaseBackendLabel()}</p>
        <p className="mt-2 text-xs">
          Supabase enabled: {isSupabaseAuthEnabled() ? 'yes' : 'no'}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-espresso-500">
          Required Pages secrets for admin APIs:{' '}
          <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>,{' '}
          <code className="font-mono">VITE_SUPABASE_URL</code> (or SUPABASE_URL).
        </p>
      </div>

      {toast ? (
        <div className="mb-4 rounded-xl border border-portal-200 bg-portal-50 px-4 py-2 text-sm text-portal-800">
          {toast}
        </div>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-portal-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-espresso-900">Demo data cleanup</p>
        <p className="text-xs text-espresso-500">
          Archives known demo persona emails and removes seed objects under storage path docs/seed-*.
          Irreversible for storage files.
        </p>
        <div className="flex flex-wrap gap-2">
          <ActionBtn variant="danger" onClick={() => void cleanupDemoUsers()} disabled={busy}>
            Archive demo users
          </ActionBtn>
          <ActionBtn variant="danger" onClick={() => void purgeDemoFiles()} disabled={busy}>
            Purge demo PDF files
          </ActionBtn>
        </div>
      </div>
    </div>
  )
}
