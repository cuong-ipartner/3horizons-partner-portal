/**
 * Runtime config for localhost demo → Supabase → Cloudflare Pages.
 * Never put service-role keys in the frontend.
 *
 * On Cloudflare: set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY at build time.
 * If those are present, Supabase is used even when VITE_DATA_MODE is omitted.
 */

export type DataMode = 'seed' | 'supabase' | 'auto'

function readMode(): DataMode {
  const raw = (import.meta.env.VITE_DATA_MODE as string | undefined)?.toLowerCase()
  if (raw === 'supabase') return 'supabase'
  if (raw === 'seed') return 'seed'
  return 'auto'
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

/**
 * True when UI should prefer pure seed/localStorage (no Supabase client).
 * If URL + anon key are baked into the build, always use Supabase
 * (avoids CF mis-set VITE_DATA_MODE=seed blocking library/auth).
 */
export function useSeedData(): boolean {
  if (isSupabaseConfigured()) return false
  return true
}
