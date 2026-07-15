import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Link2,
  Loader2,
  Shield,
  Sparkles,
} from 'lucide-react'
import {
  applyEnrichmentToForm,
  enrichFromSocialUrl,
} from '@/onboarding/enrichment'
import { loadDraft, saveDraft, submitApplication } from '@/onboarding/storage'
import {
  emptyApplication,
  ENGAGEMENT_OPTIONS,
  EXPERTISE_OPTIONS,
  INDUSTRY_OPTIONS,
  LAYER_OPTIONS,
  SERVICE_OPTIONS,
  type PartnerApplication,
} from '@/onboarding/types'
import {
  Button,
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Input,
  Label,
  Lead,
  PageTitle,
  Section,
  Select,
  Textarea,
} from '@/components/ui'
import { cn } from '@/lib/cn'

const STEPS = [
  { id: 1, label: 'Đăng ký' },
  { id: 2, label: 'Vai trò & chuyên môn' },
  { id: 3, label: 'Social profile' },
  { id: 4, label: 'Rà soát & chỉnh sửa' },
  { id: 5, label: 'Xác nhận & gửi' },
  { id: 6, label: 'Chờ xác minh' },
] as const

function toggleInList(list: string[], value: string) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
}

function ChipMulti({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(toggleInList(value, o.value))}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition',
              on
                ? 'border-portal-700 bg-portal-800 text-white'
                : 'border-cream-300 bg-cream-50 text-espresso-700 hover:bg-cream-200',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function PartnerOnboardingPage() {
  const [step, setStep] = useState(1)
  const [app, setApp] = useState<PartnerApplication>(() => {
    try {
      return loadDraft() ?? emptyApplication()
    } catch {
      return emptyApplication()
    }
  })
  const [password, setPassword] = useState('')
  const [enriching, setEnriching] = useState(false)
  const [enrichError, setEnrichError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!done && app.status === 'draft') saveDraft(app)
  }, [app, done])

  const progress = useMemo(() => Math.min(100, Math.round((step / 5) * 100)), [step])

  function patch(p: Partial<PartnerApplication>) {
    setApp((a) => ({ ...a, ...p, updatedAt: new Date().toISOString() }))
  }

  function canNext(): boolean {
    if (step === 1) return Boolean(app.email.trim() && password.length >= 6 && app.fullName.trim())
    if (step === 2)
      return Boolean(
        app.title.trim() &&
          app.company.trim() &&
          app.industry &&
          app.expertiseTags.length > 0 &&
          app.ecosystemLayers.length > 0,
      )
    if (step === 3) return Boolean(app.linkedinUrl.trim())
    if (step === 4) return Boolean(app.fullName.trim() && app.title.trim() && app.bio.trim())
    if (step === 5) return app.enrichmentReviewed && app.confirmPublish
    return true
  }

  async function runEnrich(source: 'linkedin' | 'facebook') {
    setEnrichError('')
    const url = source === 'linkedin' ? app.linkedinUrl : app.facebookUrl
    if (!url.trim()) {
      setEnrichError(source === 'linkedin' ? 'Nhập URL LinkedIn trước.' : 'Nhập URL Facebook trước.')
      return
    }
    setEnriching(true)
    try {
      const en = await enrichFromSocialUrl(url, source)
      const merged = applyEnrichmentToForm(app, en, source === 'linkedin')
      patch({
        ...merged,
        enrichment: en,
        enrichmentReviewed: false,
        linkedinUrl: source === 'linkedin' ? url : app.linkedinUrl,
        facebookUrl: source === 'facebook' ? url : app.facebookUrl,
      })
      setStep(4)
    } catch (e) {
      setEnrichError(e instanceof Error ? e.message : 'Không import được dữ liệu công khai.')
    } finally {
      setEnriching(false)
    }
  }

  function finish() {
    const submitted = submitApplication({ ...app, passwordSet: true })
    setApp(submitted)
    setDone(true)
    setStep(6)
  }

  if (done || step === 6) {
    return (
      <Section className="pt-12 sm:pt-16">
        <Container className="max-w-xl">
          <Card className="p-8 text-center sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-portal-100 text-portal-700">
              <Shield className="h-7 w-7" />
            </div>
            <Eyebrow className="mt-6">Bước 7–8 · Xác minh 3HORIZONS</Eyebrow>
            <PageTitle className="mt-3 text-3xl">Hồ sơ đã gửi — chờ verified</PageTitle>
            <Lead className="mx-auto mt-3">
              Cảm ơn bạn. Hồ sơ đã được gửi ở trạng thái submitted. 3HORIZONS sẽ rà soát proof points,
              expertise và fit. Badge verified chỉ xuất hiện sau khi được duyệt. Profile chưa tự publish.
            </Lead>
            <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-espresso-600">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Dữ liệu social đã qua bước review của bạn
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Admin có thể ghi notes / chỉnh trước khi publish
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Sau verified + publish mới hiện trong directory
              </li>
            </ul>
            <p className="mt-4 text-xs text-espresso-500">Mã hồ sơ: {app.id}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/login">Đăng nhập workspace</ButtonLink>
              <ButtonLink to="/" variant="outline">
                Về trang chủ
              </ButtonLink>
            </div>
          </Card>
        </Container>
      </Section>
    )
  }

  return (
    <Section className="pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <Eyebrow>Partner onboarding</Eyebrow>
        <PageTitle className="mt-3 text-balance">Tham gia mạng lưới chuyên gia chọn lọc</PageTitle>
        <Lead className="mt-3">
          Nhanh hơn nhờ LinkedIn (chính) hoặc Facebook (phụ). Dữ liệu import luôn qua màn rà soát —
          không tự publish.
        </Lead>

        {/* Progress */}
        <div className="mt-8">
          <div className="mb-2 flex justify-between text-[11px] font-medium text-espresso-500">
            <span>
              Bước {step}/5 · {STEPS[step - 1]?.label}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-portal-700 to-portal-violet transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
            {STEPS.slice(0, 5).map((s) => (
              <span
                key={s.id}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[10px] font-medium',
                  s.id === step
                    ? 'bg-portal-800 text-white'
                    : s.id < step
                      ? 'bg-portal-100 text-portal-700'
                      : 'bg-cream-200 text-espresso-500',
                )}
              >
                {s.id}. {s.label}
              </span>
            ))}
          </div>
        </div>

        <Card className="mt-8 p-6 sm:p-8">
          {/* Step 1 — Sign up */}
          {step === 1 ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-espresso-900">1. Đăng ký tài khoản</h2>
                <p className="mt-1 text-sm text-espresso-500">
                  Bắt đầu hồ sơ partner. Đây là mạng lưới curated — không phải form generic.
                </p>
              </div>
              <div>
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={app.fullName}
                  onChange={(e) => patch({ fullName: e.target.value })}
                  placeholder="Họ tên đầy đủ"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email công việc</Label>
                <Input
                  id="email"
                  type="email"
                  value={app.email}
                  onChange={(e) => patch({ email: e.target.value })}
                  placeholder="ban@congty.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Mật khẩu (tối thiểu 6 ký tự)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    patch({ passwordSet: e.target.value.length >= 6 })
                  }}
                  placeholder="Tạo mật khẩu"
                  required
                />
              </div>
            </div>
          ) : null}

          {/* Step 2 — Role & expertise */}
          {step === 2 ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-espresso-900">
                  2. Vai trò & chuyên môn
                </h2>
                <p className="mt-1 text-sm text-espresso-500">
                  Xác định fit với hệ sinh thái 3HORIZONS trước khi import social.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Chức danh / role</Label>
                  <Input
                    value={app.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    placeholder="vd. Board & Governance Advisor"
                  />
                </div>
                <div>
                  <Label>Công ty</Label>
                  <Input
                    value={app.company}
                    onChange={(e) => patch({ company: e.target.value })}
                    placeholder="Tổ chức hoặc Independent"
                  />
                </div>
              </div>
              <div>
                <Label>Ngành</Label>
                <Select
                  value={app.industry}
                  onChange={(e) => patch({ industry: e.target.value })}
                >
                  <option value="">Chọn ngành…</option>
                  {INDUSTRY_OPTIONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Expertise tags</Label>
                <ChipMulti
                  options={EXPERTISE_OPTIONS.map((e) => ({ value: e, label: e }))}
                  value={app.expertiseTags}
                  onChange={(expertiseTags) => patch({ expertiseTags })}
                />
              </div>
              <div>
                <Label>Ecosystem layers</Label>
                <ChipMulti
                  options={LAYER_OPTIONS.map((l) => ({ value: l.slug, label: l.label }))}
                  value={app.ecosystemLayers}
                  onChange={(ecosystemLayers) => patch({ ecosystemLayers })}
                />
              </div>
              <div>
                <Label>Services offered</Label>
                <ChipMulti
                  options={SERVICE_OPTIONS.map((s) => ({ value: s.slug, label: s.label }))}
                  value={app.servicesOffered}
                  onChange={(servicesOffered) => patch({ servicesOffered })}
                />
              </div>
              <div>
                <Label>Engagement type</Label>
                <ChipMulti
                  options={ENGAGEMENT_OPTIONS.map((e) => ({ value: e, label: e }))}
                  value={app.engagementTypes}
                  onChange={(engagementTypes) => patch({ engagementTypes })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Ngôn ngữ ưu tiên</Label>
                  <Select
                    value={app.preferredLanguage}
                    onChange={(e) =>
                      patch({ preferredLanguage: e.target.value as PartnerApplication['preferredLanguage'] })
                    }
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                    <option value="bilingual">Song ngữ VI/EN</option>
                  </Select>
                </div>
                <div>
                  <Label>Availability</Label>
                  <Select
                    value={app.availability}
                    onChange={(e) =>
                      patch({ availability: e.target.value as PartnerApplication['availability'] })
                    }
                  >
                    <option value="available">Available</option>
                    <option value="limited">Limited</option>
                    <option value="waitlist">Waitlist</option>
                  </Select>
                </div>
              </div>
            </div>
          ) : null}

          {/* Step 3 — Social URLs */}
          {step === 3 ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-espresso-900">
                  3. Social profile enrichment
                </h2>
                <p className="mt-1 text-sm text-espresso-500">
                  LinkedIn là nguồn chính cho identity chuyên môn. Facebook là nguồn phụ cho identity /
                  social proof. Chỉ dùng thông tin công khai.
                </p>
              </div>

              <div className="rounded-2xl border border-portal-200 bg-portal-50/60 p-4 text-sm text-espresso-600">
                <p className="font-medium text-portal-800">Cách hoạt động</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                  <li>Prefill: tên, title, company, industry, bio, experience, certifications, signals</li>
                  <li>Bạn sẽ rà soát & chỉnh sửa trước khi lưu</li>
                  <li>Không auto-publish — 3HORIZONS verify sau khi bạn gửi</li>
                </ul>
              </div>

              <div>
                <Label htmlFor="li">
                  <span className="inline-flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" />
                    LinkedIn URL (bắt buộc)
                  </span>
                </Label>
                <Input
                  id="li"
                  value={app.linkedinUrl}
                  onChange={(e) => patch({ linkedinUrl: e.target.value })}
                  placeholder="https://www.linkedin.com/in/ten-ban"
                />
                <Button
                  type="button"
                  className="mt-2"
                  disabled={enriching}
                  onClick={() => void runEnrich('linkedin')}
                >
                  {enriching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang import dữ liệu công khai…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Import từ LinkedIn
                    </>
                  )}
                </Button>
              </div>

              <div>
                <Label htmlFor="fb">Facebook URL (tuỳ chọn)</Label>
                <Input
                  id="fb"
                  value={app.facebookUrl}
                  onChange={(e) => patch({ facebookUrl: e.target.value })}
                  placeholder="https://www.facebook.com/…"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  disabled={enriching || !app.facebookUrl.trim()}
                  onClick={() => void runEnrich('facebook')}
                >
                  Import tín hiệu Facebook (phụ)
                </Button>
              </div>

              {enrichError ? (
                <p className="text-sm text-terracotta-600">{enrichError}</p>
              ) : null}

              <p className="text-xs text-espresso-500">
                LinkedIn không cho scrape tự do. Import đúng hồ sơ cần PROXYCURL_API_KEY (server).
                Không có key: chỉ lấy handle + ảnh public nếu có — không bịa title/company.
              </p>

              <Button type="button" variant="ghost" onClick={() => setStep(4)}>
                Bỏ qua import — nhập tay ở bước rà soát
              </Button>
            </div>
          ) : null}

          {/* Step 4 — Review & edit */}
          {step === 4 ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-espresso-900">
                  4. Rà soát dữ liệu import
                </h2>
                <p className="mt-1 text-sm text-espresso-500">
                  Chỉnh sửa trước khi lưu. Mọi field từ social phải được bạn xác nhận.
                </p>
              </div>

              {app.enrichment ? (
                <div
                  className={cn(
                    'rounded-2xl border p-4 text-xs',
                    app.enrichment.isSimulated
                      ? 'border-warning/40 bg-warning/10 text-espresso-700'
                      : 'border-success/30 bg-success/10 text-espresso-700',
                  )}
                >
                  <p className="font-semibold text-espresso-900">
                    Nguồn:{' '}
                    {app.enrichment.source === 'linkedin' ? 'LinkedIn (chính)' : 'Facebook (phụ)'}
                    {' · '}
                    {app.enrichment.isSimulated
                      ? 'Chỉ parse URL / dữ liệu một phần'
                      : 'Dữ liệu public API'}
                    {' · '}độ tin cậy {app.enrichment.confidence}
                    {app.enrichment.provider ? ` · ${app.enrichment.provider}` : ''}
                  </p>
                  <p className="mt-1 break-all text-espresso-500">{app.enrichment.sourceUrl}</p>
                  {app.enrichment.warning ? (
                    <p className="mt-2 text-terracotta-600">{app.enrichment.warning}</p>
                  ) : null}
                  {app.enrichment.isSimulated ? (
                    <p className="mt-2">
                      LinkedIn chặn scrape tự do. Để lấy đúng title/company/experience, cấu hình
                      PROXYCURL_API_KEY trong .env rồi restart server. Các field trống cần bạn điền
                      tay trên form bên dưới.
                    </p>
                  ) : (
                    <p className="mt-2 text-success">
                      Đã import field công khai. Vẫn phải rà soát trước khi gửi duyệt.
                    </p>
                  )}
                  {app.profileImageUrl ? (
                    <img
                      src={app.profileImageUrl}
                      alt="Profile"
                      className="mt-3 h-16 w-16 rounded-xl object-cover border border-cream-300"
                    />
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-cream-300 bg-cream-100/80 p-4 text-xs text-espresso-600">
                  Không có enrichment — bạn đang nhập thủ công.
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Họ và tên</Label>
                  <Input value={app.fullName} onChange={(e) => patch({ fullName: e.target.value })} />
                </div>
                <div>
                  <Label>Title / role</Label>
                  <Input value={app.title} onChange={(e) => patch({ title: e.target.value })} />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input value={app.company} onChange={(e) => patch({ company: e.target.value })} />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Select value={app.industry} onChange={(e) => patch({ industry: e.target.value })}>
                    {INDUSTRY_OPTIONS.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label>Bio / headline</Label>
                <Textarea
                  value={app.bio}
                  onChange={(e) => patch({ bio: e.target.value })}
                  rows={4}
                  placeholder="Tóm tắt chuyên môn và cách bạn tạo giá trị…"
                />
              </div>

              <div>
                <Label>Experience (mỗi dòng một mục)</Label>
                <Textarea
                  value={app.experience.join('\n')}
                  onChange={(e) =>
                    patch({
                      experience: e.target.value
                        .split('\n')
                        .map((x) => x.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={4}
                />
              </div>

              <div>
                <Label>Certifications (mỗi dòng một mục)</Label>
                <Textarea
                  value={app.certifications.join('\n')}
                  onChange={(e) =>
                    patch({
                      certifications: e.target.value
                        .split('\n')
                        .map((x) => x.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label>Public activity signals</Label>
                <Textarea
                  value={app.publicSignals.join('\n')}
                  onChange={(e) =>
                    patch({
                      publicSignals: e.target.value
                        .split('\n')
                        .map((x) => x.trim())
                        .filter(Boolean),
                    })
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Case studies</Label>
                <Textarea
                  value={app.caseStudies}
                  onChange={(e) => patch({ caseStudies: e.target.value })}
                  placeholder="Tóm tắt 1–3 case có thể chia sẻ công khai…"
                  rows={3}
                />
              </div>

              <div>
                <Label>Testimonials</Label>
                <Textarea
                  value={app.testimonials}
                  onChange={(e) => patch({ testimonials: e.target.value })}
                  placeholder="Trích dẫn ngắn (có quyền dùng)…"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={app.linkedinUrl}
                    onChange={(e) => patch({ linkedinUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Facebook URL</Label>
                  <Input
                    value={app.facebookUrl}
                    onChange={(e) => patch({ facebookUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Profile image URL (nếu có từ public source)</Label>
                <Input
                  value={app.profileImageUrl}
                  onChange={(e) => patch({ profileImageUrl: e.target.value })}
                  placeholder="https://…"
                />
              </div>

              <label className="flex items-start gap-2 rounded-xl border border-portal-200 bg-portal-50/50 p-3 text-sm text-espresso-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={app.enrichmentReviewed}
                  onChange={(e) => patch({ enrichmentReviewed: e.target.checked })}
                />
                <span>
                  Tôi đã rà soát toàn bộ dữ liệu import / nhập tay. Thông tin phản ánh đúng chuyên môn
                  công khai của tôi.
                </span>
              </label>
            </div>
          ) : null}

          {/* Step 5 — Confirm */}
          {step === 5 ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-espresso-900">
                  5. Xác nhận & gửi duyệt
                </h2>
                <p className="mt-1 text-sm text-espresso-500">
                  Gửi cho 3HORIZONS verification. Profile chưa hiển thị directory cho đến khi verified +
                  published.
                </p>
              </div>

              <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5 text-sm">
                <p className="font-semibold text-espresso-900">{app.fullName}</p>
                <p className="text-espresso-600">
                  {app.title} · {app.company}
                </p>
                <p className="mt-2 text-xs text-espresso-500">
                  {app.industry} · {app.expertiseTags.slice(0, 4).join(', ')}
                </p>
                <p className="mt-3 text-espresso-700">{app.bio.slice(0, 220)}
                  {app.bio.length > 220 ? '…' : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-portal-100 px-2 py-0.5 text-portal-800">
                    Layers: {app.ecosystemLayers.length}
                  </span>
                  <span className="rounded-full bg-portal-100 px-2 py-0.5 text-portal-800">
                    Services: {app.servicesOffered.length}
                  </span>
                  <span className="rounded-full bg-portal-100 px-2 py-0.5 text-portal-800">
                    {app.availability}
                  </span>
                  {!app.enrichmentReviewed ? (
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-warning">
                      Chưa tick rà soát
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success">
                      <BadgeCheck className="h-3 w-3" />
                      Đã review import
                    </span>
                  )}
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm text-espresso-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={app.confirmPublish}
                  onChange={(e) => patch({ confirmPublish: e.target.checked })}
                />
                <span>
                  Tôi xác nhận gửi hồ sơ để 3HORIZONS xác minh. Tôi hiểu dữ liệu import không được
                  auto-publish và badge verified chỉ sau khi được duyệt.
                </span>
              </label>
            </div>
          ) : null}

          {/* Nav buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 pt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={step <= 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>

            {step < 5 ? (
              <Button type="button" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
                Tiếp tục
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" disabled={!canNext()} onClick={finish}>
                Gửi để 3HORIZONS verify
              </Button>
            )}
          </div>
        </Card>

        <p className="mt-6 text-center text-xs text-espresso-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-portal-700 hover:underline">
            Đăng nhập workspace
          </Link>
        </p>
      </Container>
    </Section>
  )
}
