import { ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PartnerCard } from '@/components/PartnerCard'
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  EmptyState,
  Eyebrow,
  Lead,
  PageTitle,
  Section,
  SectionTitle,
} from '@/components/ui'
import {
  getLayer,
  getService,
  insights,
  layers,
  partnersForLayer,
} from '@/data/seed'

export function LayersIndexPage() {
  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Eyebrow>Tầng hệ sinh thái</Eyebrow>
        <PageTitle className="mt-3 max-w-2xl text-balance">
          Seven strategic layers. One curated network.
        </PageTitle>
        <Lead className="mt-4">
          Explore how the ecosystem is structured — or start from a problem if you already know the pain.
        </Lead>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to="/problems">Tìm theo vấn đề</ButtonLink>
          <ButtonLink to="/match" variant="outline">
            Yêu cầu kết nối
          </ButtonLink>
        </div>

        <div className="mt-12 space-y-6">
          {layers.map((layer) => (
            <LayerBlock key={layer.slug} slug={layer.slug} compact />
          ))}
        </div>
      </Container>
    </Section>
  )
}

export function LayerDetailPage() {
  const { layerSlug = '' } = useParams()
  const layer = getLayer(layerSlug)

  if (!layer) {
    return (
      <Section>
        <Container>
          <EmptyState
            title="Không tìm thấy tầng"
            body="Quay lại bản đồ hệ sinh thái để chọn tầng."
            action={<ButtonLink to="/layers">Về tầng hệ sinh thái</ButtonLink>}
          />
        </Container>
      </Section>
    )
  }

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <LayerBlock slug={layer.slug} />
      </Container>
    </Section>
  )
}

function LayerBlock({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const layer = getLayer(slug)
  if (!layer) return null

  const services = layer.serviceSlugs.map(getService).filter(Boolean)
  const featured = partnersForLayer(layer.slug).slice(0, compact ? 2 : 3)
  const cases = insights.filter((i) => i.layerSlugs.includes(layer.slug)).slice(0, 2)

  return (
    <Card className={compact ? 'p-6 sm:p-8' : 'border-0 bg-transparent p-0 shadow-none'}>
      <div className={compact ? '' : ''}>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent" className="text-sm">
            {layer.code}
          </Badge>
          {!compact ? <Eyebrow>Tầng hệ sinh thái</Eyebrow> : null}
        </div>
        {compact ? (
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-espresso-900 sm:text-3xl">{layer.name}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-espresso-600">{layer.mandate}</p>
            </div>
            <ButtonLink to={`/layers/${layer.slug}`} variant="outline" size="sm">
              Mở layer
              <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </div>
        ) : (
          <>
            <PageTitle className="mt-3">{layer.name}</PageTitle>
            <Lead className="mt-3">{layer.mandate}</Lead>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                to={`/match?layer=${layer.slug}&service=${layer.serviceSlugs[0]}&source=layer`}
                size="lg"
              >
                Yêu cầu kết nối
              </ButtonLink>
              <ButtonLink to="/problems" variant="outline" size="lg">
                Bắt đầu từ vấn đề
              </ButtonLink>
            </div>
          </>
        )}

        <div className={`grid gap-6 ${compact ? 'mt-6 lg:grid-cols-3' : 'mt-12 lg:grid-cols-3'}`}>
          <div>
            <h3 className="text-sm font-semibold text-espresso-900">Vấn đề giải quyết</h3>
            <ul className="mt-3 space-y-2 text-sm text-espresso-600">
              {layer.solves.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terracotta-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-espresso-900">Sản phẩm bàn giao chính</h3>
            <ul className="mt-3 space-y-2 text-sm text-espresso-600">
              {layer.deliverables.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terracotta-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-espresso-900">Loại đối tác</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {layer.partnerTypes.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            <h3 className="mt-5 text-sm font-semibold text-espresso-900">Dòng dịch vụ liên quan</h3>
            <div className="mt-3 flex flex-col gap-2">
              {services.map((s) =>
                s ? (
                  <Link
                    key={s.slug}
                    to={`/services/${s.slug}`}
                    className="text-sm font-medium text-terracotta-600 hover:underline"
                  >
                    {s.name}
                  </Link>
                ) : null,
              )}
            </div>
          </div>
        </div>

        {!compact ? (
          <>
            <div className="mt-14">
              <SectionTitle className="text-2xl sm:text-3xl">Đối tác nổi bật</SectionTitle>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => (
                  <PartnerCard key={p.id} partner={p} />
                ))}
              </div>
            </div>
            {cases.length ? (
              <div className="mt-14">
                <SectionTitle className="text-2xl sm:text-3xl">Ví dụ case</SectionTitle>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {cases.map((c) => (
                    <Link key={c.slug} to={`/insights/${c.slug}`}>
                      <Card className="h-full p-5 transition hover:shadow-card">
                        <Badge>{c.industry}</Badge>
                        <h3 className="mt-3 font-semibold text-espresso-900">{c.title}</h3>
                        <p className="mt-2 text-sm text-espresso-600">{c.summary}</p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            <Card className="mt-12 flex flex-col gap-4 bg-cream-50 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-espresso-900">Cần hỗ trợ về {layer.short}?</p>
                <p className="mt-1 text-sm text-espresso-600">
                  Request a match — we recommend the right service line and partners.
                </p>
              </div>
              <ButtonLink to={`/match?layer=${layer.slug}&service=${layer.serviceSlugs[0]}&source=layer`}>
                Yêu cầu kết nối
              </ButtonLink>
            </Card>
          </>
        ) : null}
      </div>
    </Card>
  )
}
