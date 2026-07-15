/**
 * Runtime config for localhost demo → Supabase → Cloudflare Pages.
 * Never put service-role keys in the frontend.
 */

export type DataMode = 'seed' | 'supabase'

function readMode(): DataMode {
  const raw = (import.meta.env.VITE_DATA_MODE as string | undefined)?.toLowerCase()
  if (raw === 'supabase') return 'supabase'
  return 'seed'
}

export const config = {
  dataMode: readMode(),
  siteUrl: (import.meta.env.VITE_SITE_URL as string | undefined) || 'http://localhost:5173',
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '',
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '',
  targetDomain: 'partners.3horizons.vn',
} as const

export function isSupabaseConfigured(): boolean {
  return Boolean(config.supabaseUrl && config.supabaseAnonKey)
}

/** True when UI should use in-memory seed (localhost demo). */
export function useSeedData(): boolean {
  if (config.dataMode === 'seed') return true
  if (config.dataMode === 'supabase' && !isSupabaseConfigured()) return true
  return false
}
