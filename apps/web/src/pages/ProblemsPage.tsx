import { ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ProblemIcon } from '@/components/icons'
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
  getProblem,
  getService,
  partnersForProblem,
  problems,
} from '@/data/seed'

export function ProblemsIndexPage() {
  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Eyebrow>Tìm theo vấn đề</Eyebrow>
        <PageTitle className="mt-3 max-w-2xl text-balance">
          Bắt đầu từ vấn đề bạn cần giải quyết
        </PageTitle>
        <Lead className="mt-4">
          Choose a challenge. We route you to the correct ecosystem layer, service line, and curated partners — fast and simple.
        </Lead>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => {
            const layer = getLayer(p.primaryLayer)
            return (
              <Link key={p.slug} to={`/problems/${p.slug}`} className="group">
                <Card className="flex h-full flex-col p-6 transition group-hover:shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-200 text-espresso-800">
                      <ProblemIcon name={p.icon} className="h-5 w-5" />
                    </div>
                    {layer ? <Badge tone="accent">{layer.code}</Badge> : null}
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-espresso-900 group-hover:text-terracotta-600">
                    {p.name}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-espresso-600">{p.pain}</p>
                  <p className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-terracotta-600">
                    Tiếp tục
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </p>
                </Card>
              </Link>
            )
          })}
        </div>

        <Card className="mt-12 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-espresso-900">Chưa chắc vấn đề nào phù hợp?</p>
            <p className="mt-1 text-sm text-espresso-600">
              Mở a match request and describe your situation — 3HORIZONS will help frame it.
            </p>
          </div>
          <ButtonLink to="/match">Yêu cầu kết nối</ButtonLink>
        </Card>
      </Container>
    </Section>
  )
}

export function ProblemDetailPage() {
  const { problemSlug = '' } = useParams()
  const problem = getProblem(problemSlug)

  if (!problem) {
    return (
      <Section>
        <Container>
          <EmptyState
            title="Không tìm thấy vấn đề"
            body="Choose a problem from the list to continue."
            action={<ButtonLink to="/problems">Về danh sách vấn đề</ButtonLink>}
          />
        </Container>
      </Section>
    )
  }

  const primary = getLayer(problem.primaryLayer)
  const secondary = problem.secondaryLayers.map(getLayer).filter(Boolean)
  const services = problem.serviceSlugs.map(getService).filter(Boolean)
  const featured = partnersForProblem(problem.slug)

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Eyebrow>Tìm theo vấn đề</Eyebrow>
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-200 text-espresso-800">
            <ProblemIcon name={problem.icon} className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <PageTitle>{problem.name}</PageTitle>
            <Lead className="mt-3">{problem.pain}</Lead>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink
            to={`/match?problem=${problem.slug}&layer=${problem.primaryLayer}&service=${problem.serviceSlugs[0]}&source=problem`}
            size="lg"
          >
            Yêu cầu kết nối
          </ButtonLink>
          {primary ? (
            <ButtonLink to={`/layers/${primary.slug}`} variant="outline" size="lg">
              Explore {primary.code} layer
            </ButtonLink>
          ) : null}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <SectionTitle className="text-2xl sm:text-3xl">Tầng hệ sinh thái được ánh xạ</SectionTitle>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {primary ? (
                  <Link to={`/layers/${primary.slug}`}>
                    <Card className="h-full border-terracotta-500/25 p-5">
                      <Badge tone="accent">Primary · {primary.code}</Badge>
                      <h3 className="mt-3 font-semibold text-espresso-900">{primary.name}</h3>
                      <p className="mt-2 text-sm text-espresso-600">{primary.mandate}</p>
                    </Card>
                  </Link>
                ) : null}
                {secondary.map((layer) =>
                  layer ? (
                    <Link key={layer.slug} to={`/layers/${layer.slug}`}>
                      <Card className="h-full p-5">
                        <Badge>{layer.code}</Badge>
                        <h3 className="mt-3 font-semibold text-espresso-900">{layer.name}</h3>
                        <p className="mt-2 text-sm text-espresso-600">{layer.mandate}</p>
                      </Card>
                    </Link>
                  ) : null,
                )}
              </div>
            </div>

            <div>
              <SectionTitle className="text-2xl sm:text-3xl">Dòng dịch vụ đề xuất</SectionTitle>
              <div className="mt-4 space-y-3">
                {services.map((s) =>
                  s ? (
                    <Link key={s.slug} to={`/services/${s.slug}`}>
                      <Card className="flex items-center justify-between gap-4 p-5 transition hover:shadow-card">
                        <div>
                          <h3 className="font-semibold text-espresso-900">{s.name}</h3>
                          <p className="mt-1 text-sm text-espresso-600">{s.solves}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-espresso-500" />
                      </Card>
                    </Link>
                  ) : null,
                )}
              </div>
            </div>
          </div>

          <Card className="h-fit p-6">
            <p className="text-sm font-semibold text-espresso-900">What “good” looks like</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-espresso-600">
              <li>Clear framing of the business problem</li>
              <li>Right layer and service path identified</li>
              <li>Shortlist of verified partners — not a random dump</li>
              <li>Match request ready for 3HORIZONS review</li>
            </ul>
            <ButtonLink
              className="mt-6 w-full"
              to={`/match?problem=${problem.slug}&layer=${problem.primaryLayer}&service=${problem.serviceSlugs[0]}&source=problem`}
            >
              Tiếp tục to match
            </ButtonLink>
          </Card>
        </div>

        <div className="mt-14">
          <SectionTitle className="text-2xl sm:text-3xl">Đối tác nổi bật cho vấn đề này</SectionTitle>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PartnerCard key={p.id} partner={p} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
