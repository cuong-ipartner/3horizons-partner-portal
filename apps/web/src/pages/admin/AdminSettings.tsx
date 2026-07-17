import { useEffect, useState } from 'react'
import { ActionBtn, AdminPageHeader } from '@/components/admin/AdminUi'
import { adminApi } from '@/lib/production-auth'
import {
  clearSettingsCache,
  getNexusGrokEnabled,
  setNexusGrokEnabled,
} from '@/lib/app-settings'
import { isSupabaseAuthEnabled, supabaseBackendLabel } from '@/lib/supabase'
import { cn } from '@/lib/cn'

export function AdminSettings() {
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [grokOn, setGrokOn] = useState(true)
  const [grokLoading, setGrokLoading] = useState(true)
  const [grokSaving, setGrokSaving] = useState(false)

  useEffect(() => {
    clearSettingsCache()
    void getNexusGrokEnabled().then((v) => {
      setGrokOn(v)
      setGrokLoading(false)
    })
  }, [])

  function flash(m: string) {
    setToast(m)
    window.setTimeout(() => setToast(null), 4000)
  }

  async function toggleGrok(next: boolean) {
    setGrokSaving(true)
    const err = await setNexusGrokEnabled(next)
    setGrokSaving(false)
    if (err) {
      flash(err)
      return
    }
    setGrokOn(next)
    flash(
      next
        ? 'Grok AI API: BẬT — Nexus chatbox dùng Live API (nếu XAI_API_KEY OK).'
        : 'Grok AI API: TẮT — Nexus chatbox dùng chế độ offline/demo, không gọi xAI.',
    )
  }

  async function cleanupDemoUsers() {
    setBusy(true)
    const res = await adminApi<{ archived_emails?: string[] }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ action: 'cleanup_demo' }),
    })
    setBusy(false)
    flash(
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
    flash(res.error || `Removed storage paths: ${(res.data?.removed_paths || []).length}`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Settings"
        description="Cấu hình runtime portal — AI, backend, cleanup."
      />

      {toast ? (
        <div className="mb-4 rounded-xl border border-portal-200 bg-portal-50 px-4 py-2 text-sm text-portal-800">
          {toast}
        </div>
      ) : null}

      {/* Grok AI toggle */}
      <div className="mb-4 rounded-2xl border border-portal-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-espresso-900">Grok AI API (Nexus)</p>
            <p className="mt-1 text-xs leading-relaxed text-espresso-500">
              Bật/tắt gọi API xAI cho chatbox Nexus (portal + admin). Khi tắt, Nexus trả lời offline
              (demo memory) — không tốn credit xAI. Secret Cloudflare{' '}
              <code className="font-mono text-[11px]">XAI_API_KEY</code> vẫn cần khi bật Live.
            </p>
            <p className="mt-2 text-[11px] text-espresso-500">
              Trạng thái:{' '}
              {grokLoading ? (
                '…'
              ) : (
                <span
                  className={cn(
                    'font-semibold',
                    grokOn ? 'text-success' : 'text-terracotta-600',
                  )}
                >
                  {grokOn ? 'ON — Live Grok' : 'OFF — Demo / offline'}
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={grokOn}
            disabled={grokLoading || grokSaving || !isSupabaseAuthEnabled()}
            onClick={() => void toggleGrok(!grokOn)}
            className={cn(
              'relative h-8 w-14 shrink-0 rounded-full transition disabled:opacity-50',
              grokOn ? 'bg-portal-800' : 'bg-cream-300',
            )}
          >
            <span
              className={cn(
                'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition',
                grokOn ? 'left-7' : 'left-1',
              )}
            />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionBtn
            variant={grokOn ? 'ghost' : 'primary'}
            onClick={() => void toggleGrok(true)}
            disabled={grokLoading || grokSaving || grokOn}
          >
            Bật Grok API
          </ActionBtn>
          <ActionBtn
            variant={!grokOn ? 'ghost' : 'danger'}
            onClick={() => void toggleGrok(false)}
            disabled={grokLoading || grokSaving || !grokOn}
          >
            Tắt Grok API
          </ActionBtn>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-portal-200 bg-white p-5 text-sm text-espresso-700 shadow-sm">
        <p className="font-medium text-espresso-900">Backend</p>
        <p className="mt-1 text-xs text-espresso-500">{supabaseBackendLabel()}</p>
        <p className="mt-2 text-xs">
          Supabase enabled: {isSupabaseAuthEnabled() ? 'yes' : 'no'}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-espresso-500">
          Pages secrets: <code className="font-mono">XAI_API_KEY</code>,{' '}
          <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>,{' '}
          <code className="font-mono">VITE_SUPABASE_*</code> (build).
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-portal-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-espresso-900">Demo data cleanup</p>
        <p className="text-xs text-espresso-500">
          Archives known demo persona emails and removes seed objects under storage path docs/seed-*.
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
