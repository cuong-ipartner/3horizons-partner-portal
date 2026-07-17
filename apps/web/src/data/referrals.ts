/**
 * Referral Lead module — Partner submit + Admin pipeline.
 */

import { getSupabase, isSupabaseAuthEnabled } from '@/lib/supabase'

export type ReceivingEntity = '3hvn' | 'wamexm'
export type CustomerType = 'individual' | 'business'
export type Readiness = 'exploring' | 'considering' | 'ready_to_meet'
export type ReferralStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'contacted'
  | 'qualified'
  | 'converted'
  | 'closed'

export type Referral = {
  id: string
  referralCode: string
  referrerUserId: string
  referrerOrganization: string | null
  receivingEntity: ReceivingEntity
  customerType: CustomerType
  customerName: string
  contactName: string
  contactTitle: string | null
  contactEmail: string | null
  contactPhone: string
  location: string | null
  industry: string | null
  estimatedSize: string | null
  serviceNeed: string
  readiness: Readiness
  preferredContactTime: string | null
  notes: string | null
  customerConsent: boolean
  status: ReferralStatus
  rejectionReason: string | null
  assignedTo: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  /** Joined from profiles when available */
  referrerName?: string | null
  referrerEmail?: string | null
  assignedName?: string | null
}

export type ReferralEvent = {
  id: string
  referralId: string
  actorId: string | null
  actorEmail: string | null
  eventType: string
  fromStatus: string | null
  toStatus: string | null
  meta: Record<string, unknown>
  createdAt: string
}

type DbRow = {
  id: string
  referral_code: string
  referrer_user_id: string
  referrer_organization: string | null
  receiving_entity: ReceivingEntity
  customer_type: CustomerType
  customer_name: string
  contact_name: string
  contact_title: string | null
  contact_email: string | null
  contact_phone: string
  location: string | null
  industry: string | null
  estimated_size: string | null
  service_need: string
  readiness: Readiness
  preferred_contact_time: string | null
  notes: string | null
  customer_consent: boolean
  status: ReferralStatus
  rejection_reason: string | null
  assigned_to: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

const SELECT = `
  id, referral_code, referrer_user_id, referrer_organization, receiving_entity,
  customer_type, customer_name, contact_name, contact_title, contact_email, contact_phone,
  location, industry, estimated_size, service_need, readiness, preferred_contact_time,
  notes, customer_consent, status, rejection_reason, assigned_to, reviewed_by, reviewed_at,
  created_at, updated_at
`.replace(/\s+/g, ' ')

export const ENTITY_LABELS: Record<ReceivingEntity, string> = {
  '3hvn': '3HORIZONS Vietnam',
  wamexm: 'WAMEXM',
}

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  individual: 'Cá nhân / Gia đình',
  business: 'Doanh nghiệp',
}

export const READINESS_LABELS: Record<Readiness, string> = {
  exploring: 'Đang tìm hiểu',
  considering: 'Đang cân nhắc',
  ready_to_meet: 'Sẵn sàng gặp / nhận tư vấn',
}

export const STATUS_LABELS: Record<ReferralStatus, string> = {
  pending: 'Chờ xử lý',
  accepted: 'Đã nhận',
  rejected: 'Từ chối',
  contacted: 'Đã liên hệ',
  qualified: 'Qualified',
  converted: 'Converted',
  closed: 'Đóng',
}

function mapRow(r: DbRow): Referral {
  return {
    id: r.id,
    referralCode: r.referral_code,
    referrerUserId: r.referrer_user_id,
    referrerOrganization: r.referrer_organization,
    receivingEntity: r.receiving_entity,
    customerType: r.customer_type,
    customerName: r.customer_name,
    contactName: r.contact_name,
    contactTitle: r.contact_title,
    contactEmail: r.contact_email,
    contactPhone: r.contact_phone,
    location: r.location,
    industry: r.industry,
    estimatedSize: r.estimated_size,
    serviceNeed: r.service_need,
    readiness: r.readiness,
    preferredContactTime: r.preferred_contact_time,
    notes: r.notes,
    customerConsent: r.customer_consent,
    status: r.status,
    rejectionReason: r.rejection_reason,
    assignedTo: r.assigned_to,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function client() {
  if (!isSupabaseAuthEnabled()) return null
  return getSupabase()
}

export type CreateReferralInput = {
  receivingEntity: ReceivingEntity
  customerType: CustomerType
  customerName: string
  contactName: string
  contactTitle?: string
  contactEmail?: string
  contactPhone: string
  location?: string
  industry?: string
  estimatedSize?: string
  serviceNeed: string
  readiness: Readiness
  preferredContactTime?: string
  notes?: string
  customerConsent: boolean
}

export function validateReferralForm(input: CreateReferralInput): string | null {
  if (!input.customerType) return 'Chọn loại khách hàng'
  if (!input.customerName.trim()) return 'Nhập tên khách hàng / doanh nghiệp'
  if (!input.contactName.trim()) return 'Nhập tên người liên hệ'
  if (!input.contactPhone.trim()) return 'Nhập số điện thoại'
  if (!input.serviceNeed.trim()) return 'Nhập nhu cầu dịch vụ / vấn đề'
  if (!input.readiness) return 'Chọn mức độ sẵn sàng'
  if (!input.customerConsent) return 'Cần xác nhận khách hàng đồng ý được liên hệ'
  if (input.contactEmail?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contactEmail.trim())) {
    return 'Email không hợp lệ'
  }
  if (!input.receivingEntity) return 'Chọn bên nhận (3HVN / WAMEXM)'
  return null
}

export async function createReferral(
  input: CreateReferralInput,
): Promise<{ referral: Referral | null; error: string | null }> {
  const sb = client()
  if (!sb) return { referral: null, error: 'Supabase chưa cấu hình' }

  const v = validateReferralForm(input)
  if (v) return { referral: null, error: v }

  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return { referral: null, error: 'Cần đăng nhập partner' }

  const { data: profile } = await sb
    .from('profiles')
    .select('full_name, partner_slug, email')
    .eq('id', user.id)
    .maybeSingle()

  const prof = profile as { full_name?: string; partner_slug?: string; email?: string } | null

  const row = {
    referrer_user_id: user.id,
    referrer_organization: prof?.partner_slug || null,
    receiving_entity: input.receivingEntity,
    customer_type: input.customerType,
    customer_name: input.customerName.trim(),
    contact_name: input.contactName.trim(),
    contact_title: input.contactTitle?.trim() || null,
    contact_email: input.contactEmail?.trim() || null,
    contact_phone: input.contactPhone.trim(),
    location: input.location?.trim() || null,
    industry: input.industry?.trim() || null,
    estimated_size: input.estimatedSize?.trim() || null,
    service_need: input.serviceNeed.trim(),
    readiness: input.readiness,
    preferred_contact_time: input.preferredContactTime?.trim() || null,
    notes: input.notes?.trim() || null,
    customer_consent: true,
    status: 'pending' as const,
  }

  const { data, error } = await sb.from('referrals').insert(row).select(SELECT).single()
  if (error) return { referral: null, error: error.message }

  const referral = mapRow(data as unknown as DbRow)

  // Partner-side event (allowed: actor_id = self)
  await sb.from('referral_events').insert({
    referral_id: referral.id,
    actor_id: user.id,
    actor_email: user.email,
    event_type: 'submitted',
    from_status: null,
    to_status: 'pending',
    meta: { referrer_name: prof?.full_name || null },
  })

  return { referral, error: null }
}

export type ListReferralFilters = {
  q?: string
  status?: ReferralStatus | ''
  receivingEntity?: ReceivingEntity | ''
  customerType?: CustomerType | ''
  readiness?: Readiness | ''
  staffView?: boolean
}

export async function listReferrals(
  filters: ListReferralFilters = {},
): Promise<{ items: Referral[]; error: string | null }> {
  const sb = client()
  if (!sb) return { items: [], error: 'Supabase chưa cấu hình' }

  let q = sb.from('referrals').select(SELECT).order('created_at', { ascending: false })

  if (filters.status) q = q.eq('status', filters.status)
  if (filters.receivingEntity) q = q.eq('receiving_entity', filters.receivingEntity)
  if (filters.customerType) q = q.eq('customer_type', filters.customerType)
  if (filters.readiness) q = q.eq('readiness', filters.readiness)

  const { data, error } = await q
  if (error) return { items: [], error: error.message }

  let items = ((data ?? []) as unknown as DbRow[]).map(mapRow)

  if (filters.q?.trim()) {
    const t = filters.q.trim().toLowerCase()
    items = items.filter(
      (r) =>
        r.referralCode.toLowerCase().includes(t) ||
        r.customerName.toLowerCase().includes(t) ||
        r.contactName.toLowerCase().includes(t) ||
        (r.contactPhone || '').includes(t) ||
        (r.referrerOrganization || '').toLowerCase().includes(t),
    )
  }

  // Enrich referrer names for staff list
  if (filters.staffView && items.length) {
    const ids = [...new Set(items.map((i) => i.referrerUserId))]
    const { data: profiles } = await sb
      .from('profiles')
      .select('id, full_name, email')
      .in('id', ids)
    const map = new Map(
      ((profiles ?? []) as { id: string; full_name: string | null; email: string | null }[]).map(
        (p) => [p.id, p],
      ),
    )
    items = items.map((i) => {
      const p = map.get(i.referrerUserId)
      return {
        ...i,
        referrerName: p?.full_name || null,
        referrerEmail: p?.email || null,
      }
    })
  }

  return { items, error: null }
}

export async function getReferral(
  id: string,
): Promise<{ referral: Referral | null; error: string | null }> {
  const sb = client()
  if (!sb) return { referral: null, error: 'Supabase chưa cấu hình' }

  const { data, error } = await sb.from('referrals').select(SELECT).eq('id', id).maybeSingle()
  if (error) return { referral: null, error: error.message }
  if (!data) return { referral: null, error: 'Không tìm thấy referral' }

  const referral = mapRow(data as unknown as DbRow)
  const { data: prof } = await sb
    .from('profiles')
    .select('full_name, email')
    .eq('id', referral.referrerUserId)
    .maybeSingle()
  const p = prof as { full_name?: string; email?: string } | null
  referral.referrerName = p?.full_name || null
  referral.referrerEmail = p?.email || null

  if (referral.assignedTo) {
    const { data: asg } = await sb
      .from('profiles')
      .select('full_name')
      .eq('id', referral.assignedTo)
      .maybeSingle()
    referral.assignedName = (asg as { full_name?: string } | null)?.full_name || null
  }

  return { referral, error: null }
}

export async function listReferralEvents(referralId: string): Promise<ReferralEvent[]> {
  const sb = client()
  if (!sb) return []
  const { data } = await sb
    .from('referral_events')
    .select('*')
    .eq('referral_id', referralId)
    .order('created_at', { ascending: false })
  return ((data ?? []) as {
    id: string
    referral_id: string
    actor_id: string | null
    actor_email: string | null
    event_type: string
    from_status: string | null
    to_status: string | null
    meta: Record<string, unknown>
    created_at: string
  }[]).map((e) => ({
    id: e.id,
    referralId: e.referral_id,
    actorId: e.actor_id,
    actorEmail: e.actor_email,
    eventType: e.event_type,
    fromStatus: e.from_status,
    toStatus: e.to_status,
    meta: e.meta || {},
    createdAt: e.created_at,
  }))
}

export type StaffUpdateInput = {
  status?: ReferralStatus
  assignedTo?: string | null
  rejectionReason?: string | null
  notes?: string | null
}

export async function updateReferralStaff(
  id: string,
  patch: StaffUpdateInput,
): Promise<string | null> {
  const sb = client()
  if (!sb) return 'No client'

  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return 'Not authenticated'

  const { data: current, error: cErr } = await sb
    .from('referrals')
    .select(SELECT)
    .eq('id', id)
    .single()
  if (cErr || !current) return cErr?.message || 'Not found'
  const prev = mapRow(current as unknown as DbRow)

  if (patch.status === 'rejected' && !patch.rejectionReason?.trim() && !prev.rejectionReason) {
    return 'Reject bắt buộc nhập lý do'
  }

  const body: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (patch.status) {
    body.status = patch.status
    body.reviewed_by = user.id
    body.reviewed_at = new Date().toISOString()
  }
  if (patch.assignedTo !== undefined) body.assigned_to = patch.assignedTo
  if (patch.rejectionReason !== undefined) {
    body.rejection_reason = patch.rejectionReason
  }
  if (patch.notes !== undefined) body.notes = patch.notes

  const { error } = await sb.from('referrals').update(body).eq('id', id)
  if (error) return error.message

  const eventType = patch.status
    ? `status.${patch.status}`
    : patch.assignedTo !== undefined
      ? 'assigned'
      : 'updated'

  await sb.from('referral_events').insert({
    referral_id: id,
    actor_id: user.id,
    actor_email: user.email,
    event_type: eventType,
    from_status: prev.status,
    to_status: patch.status || prev.status,
    meta: {
      assigned_to: patch.assignedTo ?? prev.assignedTo,
      rejection_reason: patch.rejectionReason ?? null,
    },
  })

  // Optional global audit
  await sb.from('audit_logs').insert({
    actor_id: user.id,
    actor_email: user.email,
    action: `referral.${eventType}`,
    entity_type: 'referral',
    entity_id: id,
    meta: { from: prev.status, to: patch.status || prev.status },
  })

  return null
}

export async function listStaffUsersForAssign(): Promise<
  { id: string; name: string; email: string }[]
> {
  const sb = client()
  if (!sb) return []
  const { data } = await sb
    .from('profiles')
    .select('id, full_name, email, role, status')
    .eq('status', 'active')
    .in('role', ['super_admin', 'partner_manager', 'project_operator', 'content_editor'])
  return ((data ?? []) as { id: string; full_name: string | null; email: string | null }[]).map(
    (p) => ({
      id: p.id,
      name: p.full_name || p.email || p.id.slice(0, 8),
      email: p.email || '',
    }),
  )
}

export function formatReferralDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('vi-VN')
  } catch {
    return iso
  }
}
