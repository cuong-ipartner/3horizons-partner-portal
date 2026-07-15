import { useMemo, useState } from 'react'
import { BadgeCheck, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PartnerCard } from '@/components/PartnerCard'
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  EmptyState,
  Eyebrow,
  Input,
  Label,
  Lead,
  PageTitle,
  Section,
  SectionTitle,
  Select,
} from '@/components/ui'
import {
  getInsight,
  getLayer,
  getPartner,
  getService,
  layers,
  partners,
  problems,
  serviceLines,
} from '@/data/seed'

export function PartnersDirectoryPage() {
  const [q, setQ] = useState('')
  const [layer, setLayer] = useState('')
  const [service, setService] = useState('')
  const [problem, setProblem] = useState('')
  const [industry, setIndustry] = useState('')
  const [region, setRegion] = useState('')
  const [language, setLanguage] = useState('')
  const [engagement, setEngagement] = useState('')
  const [verified, setVerified] = useState('')
  const [availability, setAvailability] = useState('')

  const industries = useMemo(
    () => [...new Set(partners.map((p) => p.industry))].sort(),
    [],
  )
  const regions = useMemo(() => [...new Set(partners.map((p) => p.region))].sort(), [])

  const filtered = partners.filter((p) => {
    const text = `${p.name} ${p.title} ${p.headline} ${p.expertise.join(' ')}`.toLowerCase()
    if (q && !text.includes(q.toLowerCase())) return false
    if (layer && !p.layers.includes(layer)) return false
    if (service && !p.services.includes(service)) return false
    if (problem && !p.problems.includes(problem)) return false
    if (industry && p.industry !== industry) return false
    if (region && p.region !== region) return false
    if (language && !p.languages.includes(language)) return false
    if (engagement && !p.engagementTypes.includes(engagement)) return false
    if (verified === 'verified' && !p.verified) return false
    if (verified === 'pending' && p.verified) return false
    if (availability && p.availability !== availability) return false
    return true
  })

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Eyebrow>Partner Directory</Eyebrow>
        <PageTitle className="mt-3 max-w-2xl text-balance">
          Duyệt khi đã biết bộ lọc
        </PageTitle>
        <Lead className="mt-4">
          Prefer guided matching?{' '}
          <Link to="/problems" className="font-medium text-terracotta-600 hover:underline">
            Start with a problem
          </Link>{' '}
          — the directory is secondary to the problem-first path.
        </Lead>

        <Card className="mt-8 p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <Label htmlFor="search">Tìm kiếm</Label>
              <Input
                id="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tên, chuyên môn, chức danh…"
              />
            </div>
            <div>
              <Label htmlFor="layer">Tầng hệ sinh thái</Label>
              <Select id="layer" value={layer} onChange={(e) => setLayer(e.target.value)}>
                <option value="">Tất cả tầng</option>
                {layers.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.code} · {l.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="service">Dòng dịch vụ</Label>
              <Select id="service" value={service} onChange={(e) => setService(e.target.value)}>
                <option value="">Tất cả dịch vụ</option>
                {serviceLines.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="problem">Loại vấn đề</Label>
              <Select id="problem" value={problem} onChange={(e) => setProblem(e.target.value)}>
                <option value="">Tất cả vấn đề</option>
                {problems.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="industry">Ngành</Label>
              <Select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">Tất cả ngành</option>
                {industries.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="region">Khu vực</Label>
              <Select id="region" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">Tất cả khu vực</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="">Tất cả ngôn ngữ</option>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="engagement">Loại engagement</Label>
              <Select
                id="engagement"
                value={engagement}
                onChange={(e) => setEngagement(e.target.value)}
              >
                <option value="">Tất cả loại</option>
                <option value="advisory">Advisory</option>
                <option value="project">Project</option>
                <option value="workshop">Workshop</option>
                <option value="retain">Retain</option>
                <option value="board-role">Board role</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="verified">Đã xác minh status</Label>
              <Select id="verified" value={verified} onChange={(e) => setVerified(e.target.value)}>
                <option value="">Any</option>
                <option value="verified">Đã xác minh</option>
                <option value="pending">Chờ</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="availability">Tình trạng sẵn sàng</Label>
              <Select
                id="availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="">Any</option>
                <option value="available">Sẵn sàng</option>
                <option value="limited">Hạn chế</option>
                <option value="waitlist">Danh sách chờ</option>
              </Select>
            </div>
          </div>
        </Card>

        <p className="mt-6 text-sm text-espresso-500">
          Showing {filtered.length} of {partners.length} partners
        </p>

        {filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Không có đối tác khớp bộ lọc"
              body="Try clearing filters or start with a problem for guided matching."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink to="/problems">Tìm theo vấn đề</ButtonLink>
                  <ButtonLink to="/match" variant="outline">
                    Yêu cầu kết nối
                  </ButtonLink>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PartnerCard key={p.id} partner={p} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}

export function PartnerProfilePage() {
  const { partnerSlug = '' } = useParams()
  const partner = getPartner(partnerSlug)

  if (!partner) {
    return (
      <Section>
        <Container>
          <EmptyState
            title="Không tìm thấy đối tác"
            body="Return to the directory or start from a problem."
            action={<ButtonLink to="/partners">Về danh bạ</ButtonLink>}
          />
        </Container>
      </Section>
    )
  }

  const caseStudies = partner.caseStudySlugs.map(getInsight).filter(Boolean)
  const availLabel =
    partner.availability === 'available'
      ? 'Sẵn sàng'
      : partner.availability === 'limited'
        ? 'Sẵn sàng hạn chế'
        : 'Danh sách chờ'

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Card className="overflow-hidden p-0">
          <div className="border-b border-cream-300/80 bg-gradient-to-br from-cream-50 to-cream-200/50 px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-espresso-800 text-xl font-semibold text-cream-50">
                {partner.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <PageTitle className="text-3xl sm:text-4xl">{partner.name}</PageTitle>
                  {partner.verified ? (
                    <Badge tone="verified">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Đã xác minh
                    </Badge>
                  ) : null}
                  <Badge
                    tone={
                      partner.availability === 'available'
                        ? 'success'
                        : partner.availability === 'limited'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {availLabel}
                  </Badge>
                </div>
                <p className="mt-1 text-base text-espresso-600">{partner.title}</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-espresso-700 sm:text-base">
                  {partner.headline}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-espresso-500">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {partner.region}
                  </span>
                  <span>·</span>
                  <span>{partner.industry}</span>
                  <span>·</span>
                  <span>{partner.languages.join(' / ').toUpperCase()}</span>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink
                    to={`/match?partner=${partner.slug}&layer=${partner.layers[0]}&service=${partner.services[0]}&source=profile`}
                    size="lg"
                  >
                    Yêu cầu giới thiệu
                  </ButtonLink>
                  <ButtonLink to="/problems" variant="outline" size="lg">
                    Bắt đầu từ vấn đề
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-3">
            <div className="space-y-8 p-6 sm:p-10 lg:col-span-2">
              <div>
                <SectionTitle className="text-2xl">Tóm tắt uy tín</SectionTitle>
                <p className="mt-3 text-sm leading-relaxed text-espresso-600 sm:text-base">
                  {partner.bio}
                </p>
                <ul className="mt-4 space-y-2">
                  {partner.proofPoints.map((pp) => (
                    <li key={pp} className="flex gap-2 text-sm text-espresso-700">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terracotta-500" />
                      {pp}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <SectionTitle className="text-2xl">Chuyên môn</SectionTitle>
                <div className="mt-4 flex flex-wrap gap-2">
                  {partner.expertise.map((e) => (
                    <Badge key={e} tone="accent" className="px-3 py-1 text-sm">
                      {e}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <SectionTitle className="text-2xl">Phủ tầng hệ sinh thái</SectionTitle>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {partner.layers.map((slug) => {
                    const layer = getLayer(slug)
                    if (!layer) return null
                    return (
                      <Link key={slug} to={`/layers/${slug}`}>
                        <Card className="p-4 transition hover:shadow-card">
                          <Badge>{layer.code}</Badge>
                          <p className="mt-2 font-medium text-espresso-900">{layer.name}</p>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div>
                <SectionTitle className="text-2xl">Dịch vụ cung cấp</SectionTitle>
                <div className="mt-4 space-y-2">
                  {partner.services.map((slug) => {
                    const s = getService(slug)
                    if (!s) return null
                    return (
                      <Link
                        key={slug}
                        to={`/services/${slug}`}
                        className="block rounded-xl border border-cream-300/80 px-4 py-3 text-sm font-medium text-espresso-800 transition hover:bg-cream-100"
                      >
                        {s.name}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {caseStudies.length ? (
                <div>
                  <SectionTitle className="text-2xl">Case study</SectionTitle>
                  <div className="mt-4 space-y-3">
                    {caseStudies.map((c) =>
                      c ? (
                        <Link key={c.slug} to={`/insights/${c.slug}`}>
                          <Card className="p-5 transition hover:shadow-card">
                            <h3 className="font-semibold text-espresso-900">{c.title}</h3>
                            <p className="mt-2 text-sm text-espresso-600">{c.summary}</p>
                          </Card>
                        </Link>
                      ) : null,
                    )}
                  </div>
                </div>
              ) : null}

              {partner.testimonials.length ? (
                <div>
                  <SectionTitle className="text-2xl">Nhận xét</SectionTitle>
                  <div className="mt-4 space-y-4">
                    {partner.testimonials.map((t) => (
                      <Card key={t.quote} className="bg-cream-100/60 p-6">
                        <p className="font-display text-xl leading-snug text-espresso-800">
                          “{t.quote}”
                        </p>
                        <p className="mt-4 text-sm font-medium text-espresso-900">{t.author}</p>
                        <p className="text-sm text-espresso-500">{t.role}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="border-t border-cream-300/80 bg-cream-100/40 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <h3 className="text-sm font-semibold text-espresso-900">Chứng chỉ</h3>
              <ul className="mt-3 space-y-2 text-sm text-espresso-600">
                {partner.certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>

              <h3 className="mt-8 text-sm font-semibold text-espresso-900">Loại engagement</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {partner.engagementTypes.map((e) => (
                  <Badge key={e}>{e}</Badge>
                ))}
              </div>

              <h3 className="mt-8 text-sm font-semibold text-espresso-900">Tình trạng sẵn sàng</h3>
              <p className="mt-2 text-sm text-espresso-600">{availLabel}</p>

              <Card className="mt-8 border-terracotta-500/20 bg-cream-50 p-5">
                <p className="text-sm font-semibold text-espresso-900">Yêu cầu giới thiệu</p>
                <p className="mt-2 text-sm text-espresso-600">
                  Giới thiệu do 3HORIZONS rà soát. Không thuê đối tác trực tiếp qua mạng lưới này.
                </p>
                <ButtonLink
                  className="mt-4 w-full"
                  to={`/match?partner=${partner.slug}&layer=${partner.layers[0]}&service=${partner.services[0]}&source=profile`}
                >
                  Yêu cầu giới thiệu
                </ButtonLink>
              </Card>
            </aside>
          </div>
        </Card>
      </Container>
    </Section>
  )
}

