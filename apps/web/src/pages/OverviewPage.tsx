import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Lead,
  PageTitle,
  Section,
  SectionTitle,
} from '@/components/ui'
import { useSiteContent } from '@/content/ContentContext'

export function OverviewPage() {
  const { home } = useSiteContent()
  // Guard against partial CMS state (never crash homepage)
  const h = home
  const partnerTypes = Array.isArray(h.partnerTypes) ? h.partnerTypes : []
  const benefits = Array.isArray(h.benefits) ? h.benefits : []
  const roles = Array.isArray(h.roles) ? h.roles : []
  const supportItems = Array.isArray(h.supportItems) ? h.supportItems : []
  const trustBadges = Array.isArray(h.trustBadges) ? h.trustBadges : []
  const heroCtas = Array.isArray(h.heroCtas) ? h.heroCtas : []

  return (
    <>
      {/* Hero — Mạng lưới đối tác */}
      <Section className="relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(196,92,38,0.07),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(36,48,68,0.05),transparent_45%)]" />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <Eyebrow>{h.eyebrow}</Eyebrow>
              <PageTitle className="mt-4 text-balance">{h.heroTitle}</PageTitle>
              <Lead className="mt-5">{h.heroBody}</Lead>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-espresso-600">{h.heroSupport}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {heroCtas.map((cta) =>
                  cta.variant === 'primary' ? (
                    <ButtonLink key={cta.href} to={cta.href} size="lg">
                      {cta.label}
                      <ArrowRight className="h-4 w-4" />
                    </ButtonLink>
                  ) : cta.variant === 'outline' ? (
                    <ButtonLink key={cta.href} to={cta.href} variant="outline" size="lg">
                      {cta.label}
                    </ButtonLink>
                  ) : (
                    <ButtonLink key={cta.href} to={cta.href} variant="ghost" size="lg">
                      {cta.label}
                    </ButtonLink>
                  ),
                )}
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-[1.5rem] border border-cream-300/80 shadow-card">
                <img
                  src={h.heroImage?.src ?? ''}
                  alt={h.heroImage?.alt ?? ''}
                  className="aspect-[4/3] w-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Đang tìm đối tác */}
      <Section className="border-t border-cream-300/60 bg-cream-50/60">
        <Container>
          <div className="max-w-2xl">
            <SectionTitle>{h.seekingTitle}</SectionTitle>
            <Lead className="mt-3">{h.seekingIntro}</Lead>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {partnerTypes.map((p) => (
              <Card key={p.title} className="overflow-hidden p-0">
                <img src={p.image} alt={p.title} className="aspect-[16/10] w-full object-cover" loading="lazy" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-espresso-900">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-espresso-600">{p.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Lợi ích */}
      <Section>
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <SectionTitle>{h.benefitsTitle}</SectionTitle>
              <Lead className="mt-3">{h.benefitsIntro}</Lead>
              <div className="mt-8 space-y-4">
                {benefits.map((b) => (
                  <Card key={b.n} className="p-5">
                    <p className="text-xs font-semibold tracking-[0.16em] text-terracotta-500">{b.n}</p>
                    <h3 className="mt-2 font-semibold text-espresso-900">{b.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-espresso-600">{b.body}</p>
                  </Card>
                ))}
              </div>
            </div>
            <div className="lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-[1.5rem] border border-cream-300/80 shadow-card">
                <img
                  src={h.benefitsImage?.src ?? ''}
                  alt={h.benefitsImage?.alt ?? ''}
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Vai trò */}
      <Section className="border-t border-cream-300/60 bg-espresso-900 text-cream-100">
        <Container>
          <h2 className="font-display text-3xl text-cream-50 sm:text-4xl">{h.roleTitle}</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {roles.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <h3 className="font-semibold text-cream-50">{r.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream-300">{r.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Đồng hành */}
      <Section>
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[1.5rem] border border-cream-300/80 shadow-card">
              <img
                src={h.supportImage?.src ?? ''}
                alt={h.supportImage?.alt ?? ''}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <SectionTitle>{h.supportTitle}</SectionTitle>
              <Lead className="mt-3">{h.supportIntro}</Lead>
              <ul className="mt-8 space-y-5">
                {supportItems.map((s) => (
                  <li key={s.title}>
                    <h3 className="font-semibold text-espresso-900">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-espresso-600">{s.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Cầu nối problem-first */}
      <Section className="border-t border-cream-300/60 bg-cream-50/70">
        <Container>
          <Card className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="max-w-xl">
              <Eyebrow>Dành cho doanh nghiệp</Eyebrow>
              <h2 className="mt-2 font-display text-2xl text-espresso-900 sm:text-3xl">
                {h.networkBridge?.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-espresso-600">{h.networkBridge?.body}</p>
            </div>
            <ButtonLink to={h.networkBridge?.cta?.href ?? '/problems'} size="lg" className="shrink-0">
              {h.networkBridge?.cta?.label ?? 'Tiếp tục'}
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </Card>
        </Container>
      </Section>

      {/* Closing CTA */}
      <Section>
        <Container>
          <div className="rounded-[1.5rem] bg-gradient-to-br from-portal-800 to-portal-violet px-8 py-12 text-center text-white sm:px-12">
            <h2 className="font-display text-3xl text-balance sm:text-4xl">{h.closingTitle}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/85">{h.closingBody}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={h.closingCta?.href ?? 'https://3horizons.vn/contact'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-portal-800 shadow-md transition hover:bg-cream-100"
              >
                {h.closingCta?.label ?? 'Liên hệ'}
              </a>
              <Link
                to="/join"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Trở thành đối tác
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 opacity-90">
              {trustBadges.map((b) => (
                <img key={b.alt} src={b.src} alt={b.alt} className="h-10 w-auto object-contain sm:h-12" />
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
