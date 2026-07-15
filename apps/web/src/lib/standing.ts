/**
 * Partner standing — Supabase profiles + partners directory, with local defaults.
 */

import { useEffect, useState } from 'react'
import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'
import type { DemoSession } from '@/lib/session'

export type PartnerStanding = {
  name: string
  email: string
  initials: string
  partnerId: string
  region: string
  focusLayers: string
  verified: boolean
  statusLabel: string
  memberSince: string
  source: 'supabase' | 'local'
}

/** No hard-coded demo partner standing — profile fields come from Supabase. */
const STANDING_DEFAULTS: Record<
  string,
  Pick<PartnerStanding, 'region' | 'focusLayers' | 'statusLabel' | 'memberSince' | 'verified'>
> = {}

function formatMemberSince(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
}

function statusFromDb(status?: string | null, verified?: boolean | null) {
  const v = verified !== false
  if (status === 'onboarding') return v ? 'Verified · Onboarding' : 'Onboarding'
  if (status === 'paused') return v ? 'Verified · Tạm dừng' : 'Tạm dừng'
  return v ? 'Verified · Đang triển khai' : 'Partner'
}

export function standingFromSession(session: DemoSession): PartnerStanding {
  const d = STANDING_DEFAULTS[session.partnerId] ?? {
    region: '—',
    focusLayers: '—',
    statusLabel: 'Partner',
    memberSince: '—',
    verified: false,
  }
  return {
    name: session.name,
    email: session.email,
    initials: session.initials,
    partnerId: session.partnerId,
    region: d.region,
    focusLayers: d.focusLayers,
    verified: d.verified,
    statusLabel: d.statusLabel,
    memberSince: d.memberSince,
    source: 'local',
  }
}

export async function fetchPartnerStanding(session: DemoSession): Promise<PartnerStanding> {
  const base = standingFromSession(session)
  if (!isSupabaseAuthEnabled()) return base

  const sb = getSupabase()
  if (!sb) return base

  try {
    const {
      data: { user },
    } = await sb.auth.getUser()

    type ProfileStandingRow = {
      full_name: string | null
      email: string | null
      initials: string | null
      partner_slug: string | null
      region: string | null
      focus_layers: string | null
      verified: boolean | null
      standing_status: string | null
      created_at: string | null
    }
    type PartnerRow = {
      name: string | null
      email: string | null
      region: string | null
      verified: boolean | null
      status: string | null
      created_at: string | null
    }

    let profile: ProfileStandingRow | null = null

    if (user?.id) {
      const { data } = await sb
        .from('profiles')
        .select(
          'full_name, email, initials, partner_slug, region, focus_layers, verified, standing_status, created_at',
        )
        .eq('id', user.id)
        .maybeSingle()
      profile = (data as ProfileStandingRow | null) ?? null
    }

    // Fallback: partners directory by slug
    const slug = profile?.partner_slug || session.partnerId
    const { data: partnerRaw } = await sb
      .from('partners')
      .select('name, email, region, verified, status, created_at')
      .eq('slug', slug)
      .maybeSingle()

    const p = (partnerRaw as PartnerRow | null) ?? null

    return {
      name: profile?.full_name || p?.name || base.name,
      email: profile?.email || p?.email || base.email,
      initials: profile?.initials || base.initials,
      partnerId: slug,
      region: profile?.region || p?.region || base.region,
      focusLayers: profile?.focus_layers || base.focusLayers,
      verified: profile?.verified ?? p?.verified ?? base.verified,
      statusLabel: statusFromDb(
        profile?.standing_status || p?.status,
        profile?.verified ?? p?.verified,
      ),
      memberSince: formatMemberSince(profile?.created_at || p?.created_at) || base.memberSince,
      source: profile || p ? 'supabase' : 'local',
    }
  } catch {
    return base
  }
}

export function usePartnerStanding(session: DemoSession) {
  const [standing, setStanding] = useState<PartnerStanding>(() => standingFromSession(session))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setStanding(standingFromSession(session))
    setLoading(true)
    void fetchPartnerStanding(session).then((s) => {
      if (!cancelled) {
        setStanding(s)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [session.partnerId, session.name, session.email, session.initials])

  return { standing, loading }
}
