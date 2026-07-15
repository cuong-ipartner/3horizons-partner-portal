import { useMemo, useState, type FormEvent } from 'react'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Badge,
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
import {
  getLayer,
  getPartner,
  getProblem,
  getService,
  layers,
  partners,
  problems,
  serviceLines,
} from '@/data/seed'

const steps = ['Vấn đề', 'Ngữ cảnh', 'Dịch vụ', 'Đối tác', 'Xem lại']

export function MatchRequestPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const [problem, setProblem] = useState(params.get('problem') ?? '')
  const [layer, setLayer] = useState(params.get('layer') ?? '')
  const [service, setService] = useState(params.get('service') ?? '')
  const [partnerPref, setPartnerPref] = useState(params.get('partner') ?? '')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [industry, setIndustry] = useState('')
  const [region, setRegion] = useState('')
  const [urgency, setUrgency] = useState('standard')
  const [context, setContext] = useState('')
  const [email, setEmail] = useState('')

  const selectedProblem = getProblem(problem)
  const recommendedLayer = selectedProblem?.primaryLayer ?? layer
  const recommendedService = selectedProblem?.serviceSlugs[0] ?? service

  const fitPartners = useMemo(() => {
    return partners.filter((p) => {
      if (problem && p.problems.includes(problem)) return true
      if (layer && p.layers.includes(layer)) return true
      if (service && p.services.includes(service)) return true
      return false
    }).slice(0, 4)
  }, [problem, layer, service])

  function applyProblem(slug: string) {
    setProblem(slug)
    const p = getProblem(slug)
    if (p) {
      setLayer(p.primaryLayer)
      setService(p.serviceSlugs[0] ?? '')
    }
  }

  function next() {
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0))
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const id = `req-${Math.floor(1000 + Math.random() * 9000)}`
    navigate(`/match/confirmation?id=${id}`)
  }

  return (
    <Section className="pt-12 sm:pt-16">
      <Container className="max-w-3xl">
        <Eyebrow>Yêu cầu kết nối</Eyebrow>
        <PageTitle className="mt-3">Yêu cầu kết nối có kiểm soát</PageTitle>
        <Lead className="mt-3">
          Ít trường. Lộ trình rõ. 3HORIZONS rà soát mọi yêu cầu trước khi giới thiệu.
        </Lead>

        <div className="mt-8 flex flex-wrap gap-2">
          {steps.map((label, i) => (
            <div
              key={label}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                i === step
                  ? 'bg-espresso-800 text-cream-50'
                  : i < step
                    ? 'bg-terracotta-500/15 text-terracotta-600'
                    : 'bg-cream-200 text-espresso-500'
              }`}
            >
              {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
              {label}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit}>
          <Card className="mt-8 p-6 sm:p-8">
            {step === 0 ? (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="problem">Vấn đề kinh doanh</Label>
                  <Select
                    id="problem"
                    required
                    value={problem}
                    onChange={(e) => applyProblem(e.target.value)}
                  >
                    <option value="">Chọn vấn đề…</option>
                    {problems.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                </div>
                {selectedProblem ? (
                  <div className="rounded-2xl border border-cream-300 bg-cream-100/70 p-4 text-sm">
                    <p className="font-medium text-espresso-900">Ánh xạ hệ thống</p>
                    <p className="mt-2 text-espresso-600">{selectedProblem.pain}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="accent">
                        Tầng: {getLayer(recommendedLayer)?.code}{' '}
                        {getLayer(recommendedLayer)?.name}
                      </Badge>
                      <Badge>
                        Dịch vụ: {getService(recommendedService)?.name ?? recommendedService}
                      </Badge>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email công việc</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ban@congty.com"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Tổ chức</Label>
                  <Input
                    id="company"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Tên công ty"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Vai trò của bạn</Label>
                  <Input
                    id="role"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="CEO, Chủ tịch, Trưởng chiến lược…"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Ngành</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="vd. Sản xuất"
                  />
                </div>
                <div>
                  <Label htmlFor="region">Khu vực</Label>
                  <Input
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="vd. Việt Nam"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="urgency">Mức độ khẩn</Label>
                  <Select id="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                    <option value="standard">Tiêu chuẩn (2–3 tuần)</option>
                    <option value="priority">Ưu tiên (tháng này)</option>
                    <option value="urgent">Khẩn (tuần này)</option>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="context">Ngữ cảnh ngắn</Label>
                  <Textarea
                    id="context"
                    required
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Cần thay đổi điều gì? Ràng buộc nào cần biết?"
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="layer">Tầng hệ sinh thái</Label>
                  <Select
                    id="layer"
                    required
                    value={layer || recommendedLayer}
                    onChange={(e) => setLayer(e.target.value)}
                  >
                    <option value="">Chọn tầng…</option>
                    {layers.map((l) => (
                      <option key={l.slug} value={l.slug}>
                        {l.code} · {l.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="service">Dòng dịch vụ</Label>
                  <Select
                    id="service"
                    required
                    value={service || recommendedService}
                    onChange={(e) => setService(e.target.value)}
                  >
                    <option value="">Chọn dịch vụ…</option>
                    {serviceLines.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <p className="text-sm text-espresso-600">
                  Gợi ý được điền sẵn từ vấn đề. Chỉ chỉnh khi cần.
                </p>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5">
                <p className="text-sm text-espresso-600">
                  Tuỳ chọn. Để trống nếu muốn 3HORIZONS chọn hộ.
                </p>
                <div>
                  <Label htmlFor="partner">Đối tác ưu tiên</Label>
                  <Select
                    id="partner"
                    value={partnerPref}
                    onChange={(e) => setPartnerPref(e.target.value)}
                  >
                    <option value="">Để 3HORIZONS ghép nối</option>
                    {(fitPartners.length ? fitPartners : partners).map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} — {p.title}
                      </option>
                    ))}
                  </Select>
                </div>
                {fitPartners.length ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-espresso-900">Đối tác phù hợp nhất</p>
                    {fitPartners.map((p) => (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => setPartnerPref(p.slug)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          partnerPref === p.slug
                            ? 'border-terracotta-500/40 bg-terracotta-500/5'
                            : 'border-cream-300 bg-cream-50 hover:bg-white'
                        }`}
                      >
                        <span>
                          <span className="font-medium text-espresso-900">{p.name}</span>
                          <span className="mt-0.5 block text-espresso-500">{p.headline}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 text-espresso-400" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-4 text-sm">
                <p className="font-semibold text-espresso-900">Xem lại yêu cầu</p>
                <SummaryRow label="Vấn đề" value={getProblem(problem)?.name ?? '—'} />
                <SummaryRow
                  label="Layer"
                  value={
                    getLayer(layer || recommendedLayer)
                      ? `${getLayer(layer || recommendedLayer)!.code} · ${getLayer(layer || recommendedLayer)!.name}`
                      : '—'
                  }
                />
                <SummaryRow
                  label="Dịch vụ"
                  value={getService(service || recommendedService)?.name ?? '—'}
                />
                <SummaryRow
                  label="Ưu tiên đối tác"
                  value={getPartner(partnerPref)?.name ?? 'Để 3HORIZONS ghép nối'}
                />
                <SummaryRow label="Tổ chức" value={company || '—'} />
                <SummaryRow label="Liên hệ" value={email || '—'} />
                <div className="rounded-2xl border border-cream-300 bg-cream-100/70 p-4 text-espresso-600">
                  After you submit, 3HORIZONS reviews the brief, confirms fit, and opens a private
                  collaboration workspace when matched. You will not hire partners unilaterally.
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-cream-300/80 pt-6">
              <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
                Quay lại
              </Button>
              {step < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={next}
                  disabled={step === 0 && !problem}
                >
                  Tiếp tục
                </Button>
              ) : (
                <Button type="submit">Gửi yêu cầu kết nối</Button>
              )}
            </div>
          </Card>
        </form>
      </Container>
    </Section>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-cream-200 py-2">
      <span className="text-espresso-500">{label}</span>
      <span className="font-medium text-espresso-900">{value}</span>
    </div>
  )
}

export function MatchConfirmationPage() {
  const [params] = useSearchParams()
  const id = params.get('id') ?? 'req-new'

  return (
    <Section className="pt-12 sm:pt-16">
      <Container className="max-w-xl">
        <Card className="p-8 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <Eyebrow className="mt-6">Đã nhận yêu cầu</Eyebrow>
          <PageTitle className="mt-3 text-3xl sm:text-4xl">Cảm ơn bạn</PageTitle>
          <Lead className="mx-auto mt-3">
            Your match request <span className="font-medium text-espresso-800">{id}</span> is with the
            3HORIZONS matching desk.
          </Lead>
          <div className="mt-6 rounded-2xl bg-cream-100 px-5 py-4 text-left text-sm text-espresso-600">
            <p className="font-medium text-espresso-900">Bước tiếp theo</p>
            <ol className="mt-3 list-decimal space-y-2 pl-4">
              <li>We review problem, layer, and partner fit</li>
              <li>We may ask for a short clarification</li>
              <li>On confirmation, a private collaboration workspace opens</li>
            </ol>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/me/requests">Xem yêu cầu của tôi</ButtonLink>
            <ButtonLink to="/" variant="outline">
              Về trang chủ
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </Section>
  )
}
