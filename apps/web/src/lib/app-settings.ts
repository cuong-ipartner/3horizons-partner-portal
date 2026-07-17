/**
 * App settings stored in Supabase (admin-writable, all authenticated can read).
 */

import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'

export const NEXUS_GROK_KEY = 'nexus_grok_enabled'

let cache: { enabled: boolean; at: number } | null = null
const CACHE_MS = 15_000

export async function getNexusGrokEnabled(): Promise<boolean> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.enabled

  // Default ON if we cannot read settings
  let enabled = true

  if (!isSupabaseAuthEnabled()) {
    cache = { enabled, at: Date.now() }
    return enabled
  }
  const sb = getSupabase()
  if (!sb) {
    cache = { enabled, at: Date.now() }
    return enabled
  }

  const { data, error } = await sb
    .from('app_settings')
    .select('value')
    .eq('key', NEXUS_GROK_KEY)
    .maybeSingle()

  if (!error && data) {
    const v = (data as { value: unknown }).value
    if (v === false || v === 'false' || v === 0) enabled = false
    else if (v === true || v === 'true' || v === 1) enabled = true
    else if (typeof v === 'object' && v !== null && 'enabled' in (v as object)) {
      enabled = Boolean((v as { enabled: unknown }).enabled)
    }
  }

  cache = { enabled, at: Date.now() }
  return enabled
}

export function clearSettingsCache() {
  cache = null
}

export async function setNexusGrokEnabled(
  enabled: boolean,
): Promise<string | null> {
  if (!isSupabaseAuthEnabled()) return 'Supabase chưa cấu hình'
  const sb = getSupabase()
  if (!sb) return 'No client'

  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return 'Not authenticated'

  const { error } = await sb.from('app_settings').upsert(
    {
      key: NEXUS_GROK_KEY,
      value: enabled,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    },
    { onConflict: 'key' },
  )

  if (error) return error.message
  cache = { enabled, at: Date.now() }
  return null
}
