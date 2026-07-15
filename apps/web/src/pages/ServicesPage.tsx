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
  partnersForService,
  serviceLines,
} from '@/data/seed'

export function ServicesIndexPage() {
  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Eyebrow>Dòng dịch vụ</Eyebrow>
        <PageTitle className="mt-3 max-w-2xl text-balance">
          Cách định hình giao hàng trên hệ sinh thái
        </PageTitle>
        <Lead className="mt-4">
          Each service line solves a defined problem class, covers specific layers, and points to the partner expertise you need.
        </Lead>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {serviceLines.map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`} className="group">
              <Card className="h-full p-6 transition group-hover:shadow-card">
                <h2 className="text-lg font-semibold text-espresso-900 group-hover:text-terracotta-600">
                  {s.name}
                </h2>
                <p className="mt-2 text-sm text-espresso-600">{s.solves}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.layers.map((slug) => {
                    const layer = getLayer(slug)
                    return layer ? (
                      <Badge key={slug}>
                        {layer.code} {layer.short}
                      </Badge>
                    ) : null
                  })}
                </div>
                <p className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-terracotta-600">
                  View service
                  <ArrowRight className="h-4 w-4" />
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}

export function ServiceDetailPage() {
  const { serviceSlug = '' } = useParams()
  const service = getService(serviceSlug)

  if (!service) {
    return (
      <Section>
        <Container>
          <EmptyState
            title="Không tìm thấy dòng dịch vụ"
            body="Browse service lines to continue."
            action={<ButtonLink to="/services">Về dòng dịch vụ</ButtonLink>}
          />
        </Container>
      </Section>
    )
  }

  const layerList = service.layers.map(getLayer).filter(Boolean)
  const recommended = partnersForService(service.slug)

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Eyebrow>Dòng dịch vụ</Eyebrow>
        <PageTitle className="mt-3">{service.name}</PageTitle>
        <Lead className="mt-3">
          <span className="font-medium text-espresso-800">Vấn đề giải quyết:</span> {service.solves}
        </Lead>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink
            to={`/match?service=${service.slug}&layer=${service.layers[0]}&source=service`}
            size="lg"
          >
            Yêu cầu kết nối
          </ButtonLink>
          <ButtonLink to="/problems" variant="outline" size="lg">
            Bắt đầu từ vấn đề
          </ButtonLink>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-espresso-900">Tầng hệ sinh thái covered</h3>
            <div className="mt-4 space-y-3">
              {layerList.map((layer) =>
                layer ? (
                  <Link
                    key={layer.slug}
                    to={`/layers/${layer.slug}`}
                    className="block rounded-xl border border-cream-300/80 bg-cream-100/50 px-4 py-3 text-sm transition hover:border-cream-300 hover:bg-white"
                  >
                    <span className="font-medium text-espresso-900">
                      {layer.code} · {layer.name}
                    </span>
                  </Link>
                ) : null,
              )}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-espresso-900">Loại đối tác cần</h3>
            <p className="mt-3 text-sm leading-relaxed text-espresso-600">{service.partnerNeeded}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-espresso-900">Sản phẩm bàn giao điển hình</h3>
            <ul className="mt-3 space-y-2 text-sm text-espresso-600">
              {service.deliverables.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terracotta-500" />
                  {d}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="mt-14">
          <SectionTitle className="text-2xl sm:text-3xl">Đối tác đề xuất</SectionTitle>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recommended.map((p) => (
              <PartnerCard key={p.id} partner={p} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
