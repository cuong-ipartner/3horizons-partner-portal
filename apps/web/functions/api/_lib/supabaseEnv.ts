/**
 * Resolve Supabase URL + service role from Pages Function env.
 * CF Dashboard / wrangler pages secret must expose these at runtime (not build-only).
 */

export type SupabaseEnv = {
  SUPABASE_SERVICE_ROLE_KEY?: string
  SUPABASE_URL?: string
  VITE_SUPABASE_URL?: string
  /** Some UIs label the secret differently */
  SUPABASE_SERVICE_KEY?: string
  SERVICE_ROLE_KEY?: string
}

/** Public project URL — safe fallback if only service role was set as secret. */
export const DEFAULT_SUPABASE_URL = 'https://twrtfsykittmfrhkjxkn.supabase.co'

export function resolveSupabaseUrl(env: SupabaseEnv): string {
  return (
    (env.SUPABASE_URL || env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL || '').trim()
  )
}

export function resolveServiceRole(env: SupabaseEnv): string {
  return (
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_KEY ||
    env.SERVICE_ROLE_KEY ||
    ''
  ).trim()
}

/** Diagnostic only — never returns secret values. */
export function envPresence(env: SupabaseEnv) {
  return {
    has_SUPABASE_URL: Boolean((env.SUPABASE_URL || '').trim()),
    has_VITE_SUPABASE_URL: Boolean((env.VITE_SUPABASE_URL || '').trim()),
    has_SUPABASE_SERVICE_ROLE_KEY: Boolean((env.SUPABASE_SERVICE_ROLE_KEY || '').trim()),
    has_SUPABASE_SERVICE_KEY: Boolean((env.SUPABASE_SERVICE_KEY || '').trim()),
    has_SERVICE_ROLE_KEY: Boolean((env.SERVICE_ROLE_KEY || '').trim()),
    resolved_url: resolveSupabaseUrl(env) ? true : false,
    resolved_service_role: Boolean(resolveServiceRole(env)),
    using_default_url:
      !((env.SUPABASE_URL || '').trim() || (env.VITE_SUPABASE_URL || '').trim()) &&
      Boolean(DEFAULT_SUPABASE_URL),
  }
}
