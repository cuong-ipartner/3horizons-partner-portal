/**
 * Supabase browser client.
 * Localhost default: seed / localStorage (see useSeedData()).
 * When VITE_DATA_MODE=supabase + URL/key set, createClient is available.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config, isSupabaseConfigured, useSeedData } from '@/lib/config'

/** Untyped client until schema is generated via `supabase gen types`. */
export type AppSupabase = SupabaseClient

let client: AppSupabase | null = null

export function getSupabase(): AppSupabase | null {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return client
}

export type SupabaseReady = {
  ready: true
  url: string
  usingSeedFallback: boolean
  client: AppSupabase
}

export type SupabaseNotReady = {
  ready: false
  reason: string
  usingSeedFallback: true
}

export function getSupabaseStatus(): SupabaseReady | SupabaseNotReady {
  if (!isSupabaseConfigured()) {
    return {
      ready: false,
      reason: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — using seed / localStorage demo.',
      usingSeedFallback: true,
    }
  }
  const c = getSupabase()
  if (!c) {
    return {
      ready: false,
      reason: 'Client failed to initialize.',
      usingSeedFallback: true,
    }
  }
  return {
    ready: true,
    url: config.supabaseUrl,
    usingSeedFallback: useSeedData(),
    client: c,
  }
}

/** Human-readable summary for admin/debug banners */
export function supabaseBackendLabel(): string {
  const st = getSupabaseStatus()
  if (!st.ready) return 'Seed + localStorage (chưa gắn Supabase)'
  if (st.usingSeedFallback) return `Supabase env OK nhưng VITE_DATA_MODE=seed — ${st.url}`
  return `Supabase — ${st.url}`
}

/** True when app should use Auth + remote tables (not seed fallback). */
export function isSupabaseAuthEnabled(): boolean {
  return isSupabaseConfigured() && !useSeedData()
}

export { isSupabaseConfigured, useSeedData }
