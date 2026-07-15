/**
 * Vite dev API routes:
 * - POST /api/nexus → xAI Grok
 * - POST /api/social-enrich → LinkedIn/Facebook public enrichment
 *
 * Env (server only, never VITE_*):
 * - XAI_API_KEY
 * - PROXYCURL_API_KEY (recommended for real LinkedIn person data)
 */

/** @returns {import('vite').Plugin} */
export function apiPlugin() {
  return {
    name: '3h-api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && req.url?.startsWith('/api/nexus')) {
          return handleNexus(req, res)
        }
        if (req.method === 'POST' && req.url?.startsWith('/api/social-enrich')) {
          return handleSocialEnrich(req, res)
        }
        next()
      })
    },
  }
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

function json(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

async function handleNexus(req, res) {
  try {
    const body = await readBody(req)
    const apiKey = process.env.XAI_API_KEY
    if (!apiKey) {
      return json(res, 503, { demo: true, error: 'XAI_API_KEY not set' })
    }
    const model = body.model || 'grok-4.5'
    const messages = body.messages || []
    const xaiRes = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature: 0.4 }),
    })
    if (!xaiRes.ok) {
      return json(res, xaiRes.status, { error: await xaiRes.text() })
    }
    const data = await xaiRes.json()
    return json(res, 200, {
      content: data.choices?.[0]?.message?.content ?? '',
      model: data.model || model,
    })
  } catch (e) {
    return json(res, 500, { error: e instanceof Error ? e.message : 'Nexus proxy error' })
  }
}

function parseLinkedInHandle(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    if (!u.hostname.includes('linkedin.com')) return null
    // /in/username or /in/username/ or localized /mwlite/in/
    const m = u.pathname.match(/\/in\/([^/?#]+)/i)
    if (!m) return null
    return decodeURIComponent(m[1]).replace(/\/+$/, '')
  } catch {
    return null
  }
}

function parseFacebookHandle(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    if (!u.hostname.includes('facebook.com') && !u.hostname.includes('fb.com')) return null
    const parts = u.pathname.split('/').filter(Boolean)
    if (!parts.length) return null
    if (parts[0] === 'profile.php') {
      return u.searchParams.get('id') || 'profile'
    }
    return decodeURIComponent(parts[0])
  } catch {
    return null
  }
}

function nameFromHandle(handle) {
  return handle
    .replace(/[-_]+/g, ' ')
    .replace(/\d+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Proxycurl Person Profile API — real public LinkedIn fields when key is set.
 * https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint
 */
async function enrichViaProxycurl(linkedinUrl) {
  const key = process.env.PROXYCURL_API_KEY
  if (!key) return null

  const endpoint = new URL('https://nubela.co/proxycurl/api/v2/linkedin')
  endpoint.searchParams.set('url', linkedinUrl)
  endpoint.searchParams.set('fallback_to_cache', 'on-error')
  endpoint.searchParams.set('use_cache', 'if-present')
  endpoint.searchParams.set('skills', 'include')
  endpoint.searchParams.set('inferred_salary', 'exclude')
  endpoint.searchParams.set('personal_email', 'exclude')
  endpoint.searchParams.set('personal_contact_number', 'exclude')

  const res = await fetch(endpoint.toString(), {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Proxycurl ${res.status}: ${err.slice(0, 200)}`)
  }
  const p = await res.json()

  const fullName =
    p.full_name ||
    [p.first_name, p.last_name].filter(Boolean).join(' ') ||
    ''

  const experience = Array.isArray(p.experiences)
    ? p.experiences.slice(0, 8).map((ex) => {
        const title = ex.title || ''
        const company = ex.company || ex.company_linkedin_profile_url || ''
        const when = [ex.starts_at?.year, ex.ends_at?.year || (ex.starts_at ? 'present' : '')]
          .filter(Boolean)
          .join('–')
        return [title, company, when].filter(Boolean).join(' · ')
      })
    : []

  const certifications = Array.isArray(p.certifications)
    ? p.certifications.slice(0, 10).map((c) => c.name || c.authority || '').filter(Boolean)
    : []

  const education = Array.isArray(p.education)
    ? p.education.slice(0, 5).map((e) => {
        return [e.school, e.degree_name, e.field_of_study].filter(Boolean).join(' · ')
      })
    : []

  const publicSignals = []
  if (p.follower_count) publicSignals.push(`Followers (public estimate): ${p.follower_count}`)
  if (p.connections) publicSignals.push(`Connections band: ${p.connections}`)
  if (Array.isArray(p.accomplishment_organisations) && p.accomplishment_organisations.length) {
    publicSignals.push('Public organisations listed on profile')
  }
  if (education.length) publicSignals.push(...education.map((e) => `Education: ${e}`))

  const current =
    Array.isArray(p.experiences) && p.experiences[0]
      ? p.experiences[0]
      : null

  return {
    fullName,
    title: p.occupation || current?.title || '',
    company: current?.company || '',
    industry: p.industry || '',
    headline: p.headline || '',
    bio: p.summary || p.headline || '',
    experience,
    certifications,
    publicSignals,
    profileImageUrl: p.profile_pic_url || p.profile_pic_url_large || '',
    source: 'linkedin',
    sourceUrl: linkedinUrl,
    enrichedAt: new Date().toISOString(),
    isSimulated: false,
    confidence: fullName || p.headline ? 'high' : 'medium',
    provider: 'proxycurl',
  }
}

async function tryUnavatar(linkedinHandle) {
  // Public avatar resolver — may work without LinkedIn login
  const url = `https://unavatar.io/linkedin/${encodeURIComponent(linkedinHandle)}?fallback=false`
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    if (res.ok && !res.url.includes('fallback')) {
      return res.url || url
    }
    // Some CDNs don't support HEAD well
    const get = await fetch(url, { redirect: 'follow' })
    if (get.ok) return get.url || url
  } catch {
    /* ignore */
  }
  return ''
}

async function handleSocialEnrich(req, res) {
  try {
    const body = await readBody(req)
    const rawUrl = String(body.url || '').trim()
    const preferred = body.source === 'facebook' ? 'facebook' : 'linkedin'
    if (!rawUrl) return json(res, 400, { error: 'Missing url' })

    const normalized = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
    const isLinkedIn = /linkedin\.com/i.test(normalized)
    const isFacebook = /facebook\.com|fb\.com/i.test(normalized)

    if (preferred === 'linkedin' || isLinkedIn) {
      const handle = parseLinkedInHandle(normalized)
      if (!handle) {
        return json(res, 400, {
          error: 'URL LinkedIn không hợp lệ. Dùng: https://www.linkedin.com/in/ten-ban',
        })
      }

      // 1) Real enrichment via Proxycurl when key present
      if (process.env.PROXYCURL_API_KEY) {
        try {
          const data = await enrichViaProxycurl(normalized)
          return json(res, 200, data)
        } catch (e) {
          // fall through to partial parse with error note
          const msg = e instanceof Error ? e.message : 'Proxycurl failed'
          const image = await tryUnavatar(handle)
          return json(res, 200, {
            fullName: nameFromHandle(handle),
            title: '',
            company: '',
            industry: '',
            headline: '',
            bio: '',
            experience: [],
            certifications: [],
            publicSignals: [
              `LinkedIn handle: ${handle}`,
              `Proxycurl lỗi — chỉ parse URL/ảnh: ${msg.slice(0, 120)}`,
            ],
            profileImageUrl: image,
            source: 'linkedin',
            sourceUrl: normalized,
            enrichedAt: new Date().toISOString(),
            isSimulated: true,
            confidence: 'low',
            provider: 'url-parse+unavatar',
            warning: msg,
          })
        }
      }

      // 2) No Proxycurl — honest partial data only (no fake job titles)
      const image = await tryUnavatar(handle)
      const guessedName = nameFromHandle(handle)
      return json(res, 200, {
        fullName: guessedName,
        title: '',
        company: '',
        industry: '',
        headline: '',
        bio: '',
        experience: [],
        certifications: [],
        publicSignals: [
          `LinkedIn public URL hợp lệ: /in/${handle}`,
          image ? 'Đã thử lấy ảnh public (unavatar)' : 'Chưa lấy được ảnh public',
          'Chưa cấu hình PROXYCURL_API_KEY — không đọc được headline/experience thật từ LinkedIn',
          'Hãy hoàn thiện các field chuyên môn trên màn rà soát',
        ],
        profileImageUrl: image,
        source: 'linkedin',
        sourceUrl: normalized,
        enrichedAt: new Date().toISOString(),
        isSimulated: true,
        confidence: 'low',
        provider: 'url-parse+unavatar',
        warning:
          'Để import đúng hồ sơ LinkedIn, thêm PROXYCURL_API_KEY vào .env (server) rồi restart dev server.',
      })
    }

    if (preferred === 'facebook' || isFacebook) {
      const handle = parseFacebookHandle(normalized)
      if (!handle) {
        return json(res, 400, { error: 'URL Facebook không hợp lệ.' })
      }
      return json(res, 200, {
        fullName: nameFromHandle(handle) || '',
        title: '',
        company: '',
        industry: '',
        headline: '',
        bio: '',
        experience: [],
        certifications: [],
        publicSignals: [
          `Facebook handle/page: ${handle}`,
          'Facebook chỉ dùng làm tín hiệu identity phụ — không thay LinkedIn cho dữ liệu chuyên môn',
        ],
        profileImageUrl: '',
        source: 'facebook',
        sourceUrl: normalized,
        enrichedAt: new Date().toISOString(),
        isSimulated: true,
        confidence: 'low',
        provider: 'url-parse',
      })
    }

    return json(res, 400, { error: 'URL phải là LinkedIn hoặc Facebook công khai.' })
  } catch (e) {
    return json(res, 500, {
      error: e instanceof Error ? e.message : 'Social enrich error',
    })
  }
}
