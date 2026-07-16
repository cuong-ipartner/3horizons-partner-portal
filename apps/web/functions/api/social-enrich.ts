/**
 * Cloudflare Pages Function — POST /api/social-enrich
 * Secrets: PROXYCURL_API_KEY (LinkedIn person API)
 */

type Env = { PROXYCURL_API_KEY?: string }

function parseLinkedInHandle(url: string) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    const m = u.pathname.match(/\/in\/([^/?#]+)/i)
    return m ? decodeURIComponent(m[1]).replace(/\/+$/, '') : null
  } catch {
    return null
  }
}

function nameFromHandle(handle: string) {
  return handle
    .replace(/[-_]+/g, ' ')
    .replace(/\d+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

async function enrichViaProxycurl(linkedinUrl: string, key: string) {
  const endpoint = new URL('https://nubela.co/proxycurl/api/v2/linkedin')
  endpoint.searchParams.set('url', linkedinUrl)
  endpoint.searchParams.set('fallback_to_cache', 'on-error')
  endpoint.searchParams.set('use_cache', 'if-present')
  endpoint.searchParams.set('skills', 'include')

  const res = await fetch(endpoint.toString(), {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!res.ok) throw new Error(`Proxycurl ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const p = await res.json()

  const fullName =
    p.full_name || [p.first_name, p.last_name].filter(Boolean).join(' ') || ''
  const experience = Array.isArray(p.experiences)
    ? p.experiences.slice(0, 8).map((ex: { title?: string; company?: string }) =>
        [ex.title, ex.company].filter(Boolean).join(' · '),
      )
    : []
  const certifications = Array.isArray(p.certifications)
    ? p.certifications
        .slice(0, 10)
        .map((c: { name?: string }) => c.name || '')
        .filter(Boolean)
    : []
  const current = Array.isArray(p.experiences) ? p.experiences[0] : null

  return {
    fullName,
    title: p.occupation || current?.title || '',
    company: current?.company || '',
    industry: p.industry || '',
    headline: p.headline || '',
    bio: p.summary || p.headline || '',
    experience,
    certifications,
    publicSignals: p.follower_count ? [`Followers: ${p.follower_count}`] : [],
    profileImageUrl: p.profile_pic_url || '',
    source: 'linkedin',
    sourceUrl: linkedinUrl,
    enrichedAt: new Date().toISOString(),
    isSimulated: false,
    confidence: fullName || p.headline ? 'high' : 'medium',
    provider: 'proxycurl',
  }
}

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders })
}

export async function onRequestGet(context: { env: Env }) {
  const hasKey = Boolean((context.env.PROXYCURL_API_KEY || '').trim())
  return json({
    ok: true,
    service: 'social-enrich',
    methods: ['POST'],
    has_PROXYCURL_API_KEY: hasKey,
    linkedin_import: hasKey ? 'live_proxycurl' : 'handle_only_no_title_company',
    hint: hasKey
      ? 'POST { url: "https://www.linkedin.com/in/..." } for real LinkedIn person fields.'
      : 'Set secret PROXYCURL_API_KEY (Pages Production) or apps/web/.env for local, then redeploy/restart.',
  })
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders })
}

export async function onRequestPost(context: {
  request: Request
  env: Env
}): Promise<Response> {
  const body = (await context.request.json().catch(() => ({}))) as {
    url?: string
    source?: string
  }
  const rawUrl = String(body.url || '').trim()
  if (!rawUrl) return json({ error: 'Missing url' }, 400)
  const normalized = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  if (/linkedin\.com/i.test(normalized)) {
    const handle = parseLinkedInHandle(normalized)
    if (!handle) {
      return json(
        { error: 'URL LinkedIn không hợp lệ. Dùng: https://www.linkedin.com/in/ten-ban' },
        400,
      )
    }
    if (context.env.PROXYCURL_API_KEY) {
      try {
        const data = await enrichViaProxycurl(normalized, context.env.PROXYCURL_API_KEY)
        return json(data)
      } catch (e) {
        return json({
          fullName: nameFromHandle(handle),
          title: '',
          company: '',
          industry: '',
          bio: '',
          experience: [],
          certifications: [],
          publicSignals: [`LinkedIn handle: ${handle}`],
          profileImageUrl: '',
          source: 'linkedin',
          sourceUrl: normalized,
          enrichedAt: new Date().toISOString(),
          isSimulated: true,
          confidence: 'low',
          warning: e instanceof Error ? e.message : 'Proxycurl failed',
        })
      }
    }
    return json({
      fullName: nameFromHandle(handle),
      title: '',
      company: '',
      industry: '',
      bio: '',
      experience: [],
      certifications: [],
      publicSignals: [
        `LinkedIn handle: ${handle}`,
        'Chưa có PROXYCURL_API_KEY — không đọc được headline/experience thật',
      ],
      profileImageUrl: '',
      source: 'linkedin',
      sourceUrl: normalized,
      enrichedAt: new Date().toISOString(),
      isSimulated: true,
      confidence: 'low',
      warning: 'Thêm PROXYCURL_API_KEY để import hồ sơ LinkedIn thật.',
    })
  }

  return json({ error: 'Chỉ hỗ trợ LinkedIn/Facebook URL công khai.' }, 400)
}
