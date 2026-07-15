import { Link, useParams } from 'react-router-dom'
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
} from '@/components/ui'
import {
  getInsight,
  getLayer,
  getPartner,
  getProblem,
  insights,
} from '@/data/seed'

export function InsightsIndexPage() {
  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Eyebrow>Insights / Case Studies</Eyebrow>
        <PageTitle className="mt-3 max-w-2xl text-balance">
          Minh chứng từ hệ sinh thái
        </PageTitle>
        <Lead className="mt-4">
          Kết quảs framed by problem and layer — evidence for trust, not marketplace noise.
        </Lead>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((ins) => (
            <Link key={ins.slug} to={`/insights/${ins.slug}`} className="group">
              <Card className="flex h-full flex-col p-6 transition group-hover:shadow-card">
                <Badge>{ins.industry}</Badge>
                <h2 className="mt-4 font-semibold text-espresso-900 group-hover:text-terracotta-600">
                  {ins.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-espresso-600">
                  {ins.summary}
                </p>
                <p className="mt-4 text-sm font-medium text-espresso-800">{ins.outcome}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  )
}

export function InsightDetailPage() {
  const { insightSlug = '' } = useParams()
  const ins = getInsight(insightSlug)

  if (!ins) {
    return (
      <Section>
        <Container>
          <EmptyState
            title="Không tìm thấy insight"
            body="Xem case study từ danh sách insights."
            action={<ButtonLink to="/insights">Tất cả insights</ButtonLink>}
          />
        </Container>
      </Section>
    )
  }

  const problem = getProblem(ins.problemSlug)
  const layerList = ins.layerSlugs.map(getLayer).filter(Boolean)
  const partnerList = ins.partnerSlugs.map(getPartner).filter(Boolean)

  return (
    <Section className="pt-12 sm:pt-16">
      <Container className="max-w-3xl">
        <Badge>{ins.industry}</Badge>
        <PageTitle className="mt-4 text-3xl sm:text-4xl lg:text-5xl">{ins.title}</PageTitle>
        <Lead className="mt-4">{ins.summary}</Lead>

        <Card className="mt-8 space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-espresso-500">
              Thách thức
            </p>
            <p className="mt-1 text-sm text-espresso-700">{problem?.pain ?? ins.summary}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-espresso-500">
              Kết quả
            </p>
            <p className="mt-1 text-sm font-medium text-espresso-900">{ins.outcome}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-espresso-500">
              Tầng liên quan
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {layerList.map((l) =>
                l ? (
                  <Link key={l.slug} to={`/layers/${l.slug}`}>
                    <Badge tone="accent">
                      {l.code} · {l.name}
                    </Badge>
                  </Link>
                ) : null,
              )}
            </div>
          </div>
          {partnerList.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-espresso-500">
                Đối tác
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {partnerList.map((p) =>
                  p ? (
                    <Link key={p.slug} to={`/partners/${p.slug}`}>
                      <Badge>{p.name}</Badge>
                    </Link>
                  ) : null,
                )}
              </div>
            </div>
          ) : null}
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink
            to={`/match?problem=${ins.problemSlug}&layer=${ins.layerSlugs[0]}&source=insight`}
          >
            Yêu cầu kết nối
          </ButtonLink>
          {problem ? (
            <ButtonLink to={`/problems/${problem.slug}`} variant="outline">
              Xem lộ trình vấn đề
            </ButtonLink>
          ) : null}
        </div>
      </Container>
    </Section>
  )
}
