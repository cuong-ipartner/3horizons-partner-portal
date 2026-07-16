import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { registerPartnerAndSubmit } from '@/onboarding/register'
import { loadDraft, saveDraft } from '@/onboarding/storage'
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

/** Manual join only — no LinkedIn/Facebook import. */
const STEPS = [
  { id: 1, label: 'Đăng ký' },
  { id: 2, label: 'Vai trò & chuyên môn' },
  { id: 3, label: 'Hồ sơ chuyên môn' },
  { id: 4, label: 'Xác nhận & gửi' },
  { id: 5, label: 'Chờ xác minh' },
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
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitNotice, setSubmitNotice] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    if (!done && app.status === 'draft') saveDraft(app)
  }, [app, done])

  const progress = useMemo(() => Math.min(100, Math.round((step / 4) * 100)), [step])

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
    if (step === 3)
      return Boolean(
        app.fullName.trim() && app.title.trim() && app.bio.trim() && app.enrichmentReviewed,
      )
    if (step === 4) return app.confirmPublish && !submitting
    return true
  }

  async function finish() {
    if (submitting) return
    setSubmitting(true)
    setSubmitError(null)
    setSubmitNotice(null)
    const res = await registerPartnerAndSubmit(
      {
        ...app,
        passwordSet: true,
        enrichment: null,
        enrichmentReviewed: true,
      },
      password,
    )
    setSubmitting(false)
    if (!res.ok) {
      setSubmitError(res.error)
      return
    }
    setApp(res.application)
    setSessionReady(res.sessionReady)
    setSubmitNotice(res.notice ?? null)
    setDone(true)
    setStep(5)
  }

  if (done || step === 5) {
    return (
      <Section className="pt-12 sm:pt-16">
        <Container className="max-w-xl">
          <Card className="p-8 text-center sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-portal-100 text-portal-700">
              <Shield className="h-7 w-7" />
            </div>
            <Eyebrow className="mt-6">Xác minh 3HORIZONS</Eyebrow>
            <PageTitle className="mt-3 text-3xl">Hồ sơ đã gửi — chờ admin Active</PageTitle>
            <Lead className="mx-auto mt-3">
              Email <strong className="text-espresso-800">{app.email}</strong> đã được tạo (email
              confirmed kỹ thuật). <strong>Chưa đăng nhập được</strong> cho đến khi admin bấm
              Activate / duyệt Active. Sau đó dùng /login với mật khẩu vừa tạo.
            </Lead>
            {submitNotice ? (
              <p className="mt-3 text-sm text-portal-800">{submitNotice}</p>
            ) : null}
            <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-espresso-600">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Status hiện tại: invited (chờ duyệt)
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Admin → Users → Activate (hoặc Partners → Duyệt)
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Sau Active: đăng nhập /login → /portal
              </li>
            </ul>
            <p className="mt-4 text-xs text-espresso-500">Mã hồ sơ: {app.id}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/login">Đăng nhập (sau khi được Active)</ButtonLink>
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
          Điền hồ sơ thủ công — 3HORIZONS rà soát trước khi verified / publish. Không auto-publish.
        </Lead>

        {/* Progress */}
        <div className="mt-8">
          <div className="mb-2 flex justify-between text-[11px] font-medium text-espresso-500">
            <span>
              Bước {step}/4 · {STEPS[step - 1]?.label}
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
            {STEPS.slice(0, 4).map((s) => (
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
                  Xác định fit với hệ sinh thái và dịch vụ 3HORIZONS.
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

          {/* Step 3 — Profile (manual) */}
          {step === 3 ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-espresso-900">
                  3. Hồ sơ chuyên môn
                </h2>
                <p className="mt-1 text-sm text-espresso-500">
                  Nhập bio, kinh nghiệm và liên kết (tuỳ chọn). Không import tự động từ LinkedIn.
                </p>
              </div>

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
                  <Label>LinkedIn URL (tuỳ chọn)</Label>
                  <Input
                    value={app.linkedinUrl}
                    onChange={(e) => patch({ linkedinUrl: e.target.value })}
                    placeholder="https://www.linkedin.com/in/…"
                  />
                </div>
                <div>
                  <Label>Facebook URL (tuỳ chọn)</Label>
                  <Input
                    value={app.facebookUrl}
                    onChange={(e) => patch({ facebookUrl: e.target.value })}
                    placeholder="https://www.facebook.com/…"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 rounded-xl border border-portal-200 bg-portal-50/50 p-3 text-sm text-espresso-700">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={app.enrichmentReviewed}
                  onChange={(e) => patch({ enrichmentReviewed: e.target.checked })}
                />
                <span>
                  Tôi xác nhận thông tin hồ sơ phản ánh đúng chuyên môn công khai của tôi.
                </span>
              </label>
            </div>
          ) : null}

          {/* Step 4 — Confirm */}
          {step === 4 ? (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-espresso-900">
                  4. Xác nhận & gửi duyệt
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
                <p className="mt-3 text-espresso-700">
                  {app.bio.slice(0, 220)}
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
                  {app.enrichmentReviewed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success">
                      <BadgeCheck className="h-3 w-3" />
                      Đã xác nhận hồ sơ
                    </span>
                  ) : null}
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
                  Tôi xác nhận gửi hồ sơ để 3HORIZONS xác minh. Badge verified chỉ sau khi được duyệt —
                  không auto-publish. Hệ thống sẽ tạo tài khoản login bằng email/mật khẩu bước 1.
                </span>
              </label>

              {submitError ? (
                <div className="rounded-xl border border-terracotta-500/30 bg-terracotta-500/5 px-4 py-3 text-sm text-terracotta-600">
                  {submitError}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Nav buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 pt-6">
            <Button
              type="button"
              variant="ghost"
              disabled={step <= 1 || submitting}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>

            {step < 4 ? (
              <Button type="button" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
                Tiếp tục
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!canNext()}
                onClick={() => void finish()}
              >
                {submitting ? 'Đang tạo tài khoản…' : 'Tạo tài khoản & gửi hồ sơ'}
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
