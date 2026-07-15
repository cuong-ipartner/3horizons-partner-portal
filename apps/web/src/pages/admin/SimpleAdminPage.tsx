import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Eye, Lock, RotateCcw, Save } from 'lucide-react'
import { useSiteContent } from '@/content/ContentContext'
import type { HomePageContent } from '@/content/site-vi'
import { Button, ButtonLink, Card, Input, Label, Textarea } from '@/components/ui'
import { cn } from '@/lib/cn'

/** Homepage content editor — staff admin only (under /admin/content/homepage) */

const sections = [
  { id: 'hero', label: 'Hero' },
  { id: 'seeking', label: 'Tìm đối tác' },
  { id: 'benefits', label: 'Lợi ích' },
  { id: 'roles', label: 'Vai trò' },
  { id: 'support', label: 'Đồng hành' },
  { id: 'bridge', label: 'Cầu nối DN' },
  { id: 'closing', label: 'CTA cuối' },
] as const

export function SimpleAdminPage() {
  const { home, setHome, resetHome, isDirty, isAdminUnlocked, unlockAdmin, lockAdmin } =
    useSiteContent()
  const [draft, setDraft] = useState<HomePageContent>(home)
  const [active, setActive] = useState<(typeof sections)[number]['id']>('hero')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    setDraft(home)
  }, [home])

  function save() {
    setHome(draft)
    setSavedAt(new Date().toLocaleTimeString('vi-VN'))
  }

  function reset() {
    if (!confirm('Khôi phục nội dung mặc định? Mọi chỉnh sửa local sẽ mất.')) return
    resetHome()
    setSavedAt(null)
  }

  if (!isAdminUnlocked) {
    return (
      <div className="mx-auto max-w-md py-8">
        <Card className="p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-portal-100 text-portal-700">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-center font-display text-2xl font-semibold text-espresso-900">
            Admin nội dung
          </h1>
          <p className="mt-2 text-center text-sm text-espresso-500">
            Demo: mật khẩu <code className="rounded bg-cream-200 px-1.5 py-0.5 text-xs">3horizons</code>
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!unlockAdmin(password)) setError('Sai mật khẩu')
              else setError('')
            }}
          >
            <div>
              <Label htmlFor="pw">Mật khẩu</Label>
              <Input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu admin"
                autoFocus
              />
            </div>
            {error ? <p className="text-sm text-terracotta-600">{error}</p> : null}
            <Button type="submit" className="w-full">
              Vào admin
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-espresso-500">
            <Link to="/admin/content" className="text-portal-700 hover:underline">
              ← Về quản lý nội dung
            </Link>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-portal-600">
            Admin
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-espresso-900 sm:text-3xl">
            Quản lý nội dung trang chủ
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-espresso-500">
            Sửa chữ & URL ảnh · lưu trên trình duyệt (localStorage) · xem ngay trang chủ.
            Production sẽ chuyển sang Supabase.
          </p>
          {isDirty || savedAt ? (
            <p className="mt-2 text-xs text-portal-600">
              {savedAt ? `Đã lưu lúc ${savedAt}` : 'Có bản ghi local'}
              {' · '}
              Font: Inter (body) · Be Vietnam Pro (heading)
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/" variant="outline" size="sm" target="_blank" rel="noreferrer">
            <Eye className="h-3.5 w-3.5" />
            Xem trang chủ
            <ExternalLink className="h-3 w-3" />
          </ButtonLink>
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Mặc định
          </Button>
          <Button type="button" size="sm" onClick={save}>
            <Save className="h-3.5 w-3.5" />
            Lưu
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={lockAdmin}>
            Khóa admin
          </Button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-1.5">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition',
              active === s.id
                ? 'bg-portal-800 text-white'
                : 'bg-white text-espresso-600 ring-1 ring-portal-200 hover:bg-portal-50',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Card className="p-5 sm:p-6">
        {active === 'hero' ? (
          <div className="space-y-4">
            <Field label="Eyebrow" value={draft.eyebrow} onChange={(v) => setDraft({ ...draft, eyebrow: v })} />
            <Field label="Tiêu đề (H1)" value={draft.heroTitle} onChange={(v) => setDraft({ ...draft, heroTitle: v })} />
            <Area label="Mô tả chính" value={draft.heroBody} onChange={(v) => setDraft({ ...draft, heroBody: v })} />
            <Area label="Đoạn hỗ trợ" value={draft.heroSupport} onChange={(v) => setDraft({ ...draft, heroSupport: v })} />
            <Field
              label="URL ảnh hero"
              value={draft.heroImage.src}
              onChange={(v) => setDraft({ ...draft, heroImage: { ...draft.heroImage, src: v } })}
            />
            <Field
              label="Alt ảnh hero"
              value={draft.heroImage.alt}
              onChange={(v) => setDraft({ ...draft, heroImage: { ...draft.heroImage, alt: v } })}
            />
            <ImagePreview src={draft.heroImage.src} />
            <div className="grid gap-3 sm:grid-cols-3">
              {draft.heroCtas.map((cta, i) => (
                <div key={i} className="rounded-xl border border-portal-100 bg-portal-50/50 p-3">
                  <p className="text-xs font-medium text-espresso-500">CTA {i + 1}</p>
                  <Input
                    className="mt-2"
                    value={cta.label}
                    onChange={(e) => {
                      const heroCtas = [...draft.heroCtas]
                      heroCtas[i] = { ...heroCtas[i], label: e.target.value }
                      setDraft({ ...draft, heroCtas })
                    }}
                  />
                  <Input
                    className="mt-2"
                    value={cta.href}
                    onChange={(e) => {
                      const heroCtas = [...draft.heroCtas]
                      heroCtas[i] = { ...heroCtas[i], href: e.target.value }
                      setDraft({ ...draft, heroCtas })
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {active === 'seeking' ? (
          <div className="space-y-4">
            <Field
              label="Tiêu đề section"
              value={draft.seekingTitle}
              onChange={(v) => setDraft({ ...draft, seekingTitle: v })}
            />
            <Area
              label="Giới thiệu"
              value={draft.seekingIntro}
              onChange={(v) => setDraft({ ...draft, seekingIntro: v })}
            />
            {draft.partnerTypes.map((p, i) => (
              <div key={i} className="rounded-2xl border border-portal-200 p-4">
                <p className="text-xs font-semibold text-portal-700">Loại đối tác {i + 1}</p>
                <div className="mt-3 space-y-3">
                  <Field
                    label="Tiêu đề"
                    value={p.title}
                    onChange={(v) => {
                      const partnerTypes = [...draft.partnerTypes]
                      partnerTypes[i] = { ...partnerTypes[i], title: v }
                      setDraft({ ...draft, partnerTypes })
                    }}
                  />
                  <Area
                    label="Mô tả"
                    value={p.body}
                    onChange={(v) => {
                      const partnerTypes = [...draft.partnerTypes]
                      partnerTypes[i] = { ...partnerTypes[i], body: v }
                      setDraft({ ...draft, partnerTypes })
                    }}
                  />
                  <Field
                    label="URL ảnh"
                    value={p.image}
                    onChange={(v) => {
                      const partnerTypes = [...draft.partnerTypes]
                      partnerTypes[i] = { ...partnerTypes[i], image: v }
                      setDraft({ ...draft, partnerTypes })
                    }}
                  />
                  <ImagePreview src={p.image} small />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {active === 'benefits' ? (
          <div className="space-y-4">
            <Field
              label="Tiêu đề"
              value={draft.benefitsTitle}
              onChange={(v) => setDraft({ ...draft, benefitsTitle: v })}
            />
            <Area
              label="Giới thiệu"
              value={draft.benefitsIntro}
              onChange={(v) => setDraft({ ...draft, benefitsIntro: v })}
            />
            <Field
              label="URL ảnh bên"
              value={draft.benefitsImage.src}
              onChange={(v) =>
                setDraft({ ...draft, benefitsImage: { ...draft.benefitsImage, src: v } })
              }
            />
            <ImagePreview src={draft.benefitsImage.src} small />
            {draft.benefits.map((b, i) => (
              <div key={i} className="rounded-2xl border border-portal-200 p-4">
                <p className="text-xs font-semibold text-portal-700">Lợi ích {b.n}</p>
                <div className="mt-3 space-y-3">
                  <Field
                    label="Tiêu đề"
                    value={b.title}
                    onChange={(v) => {
                      const benefits = [...draft.benefits]
                      benefits[i] = { ...benefits[i], title: v }
                      setDraft({ ...draft, benefits })
                    }}
                  />
                  <Area
                    label="Nội dung"
                    value={b.body}
                    onChange={(v) => {
                      const benefits = [...draft.benefits]
                      benefits[i] = { ...benefits[i], body: v }
                      setDraft({ ...draft, benefits })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {active === 'roles' ? (
          <div className="space-y-4">
            <Field
              label="Tiêu đề section"
              value={draft.roleTitle}
              onChange={(v) => setDraft({ ...draft, roleTitle: v })}
            />
            {draft.roles.map((r, i) => (
              <div key={i} className="rounded-2xl border border-portal-200 p-4">
                <Field
                  label={`Vai trò ${i + 1} — tiêu đề`}
                  value={r.title}
                  onChange={(v) => {
                    const roles = [...draft.roles]
                    roles[i] = { ...roles[i], title: v }
                    setDraft({ ...draft, roles })
                  }}
                />
                <div className="mt-3">
                  <Area
                    label="Mô tả"
                    value={r.body}
                    onChange={(v) => {
                      const roles = [...draft.roles]
                      roles[i] = { ...roles[i], body: v }
                      setDraft({ ...draft, roles })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {active === 'support' ? (
          <div className="space-y-4">
            <Field
              label="Tiêu đề"
              value={draft.supportTitle}
              onChange={(v) => setDraft({ ...draft, supportTitle: v })}
            />
            <Area
              label="Giới thiệu"
              value={draft.supportIntro}
              onChange={(v) => setDraft({ ...draft, supportIntro: v })}
            />
            <Field
              label="URL ảnh"
              value={draft.supportImage.src}
              onChange={(v) =>
                setDraft({ ...draft, supportImage: { ...draft.supportImage, src: v } })
              }
            />
            <ImagePreview src={draft.supportImage.src} small />
            {draft.supportItems.map((s, i) => (
              <div key={i} className="rounded-2xl border border-portal-200 p-4">
                <Field
                  label={`Mục ${i + 1} — tiêu đề`}
                  value={s.title}
                  onChange={(v) => {
                    const supportItems = [...draft.supportItems]
                    supportItems[i] = { ...supportItems[i], title: v }
                    setDraft({ ...draft, supportItems })
                  }}
                />
                <div className="mt-3">
                  <Area
                    label="Mô tả"
                    value={s.body}
                    onChange={(v) => {
                      const supportItems = [...draft.supportItems]
                      supportItems[i] = { ...supportItems[i], body: v }
                      setDraft({ ...draft, supportItems })
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {active === 'bridge' ? (
          <div className="space-y-4">
            <Field
              label="Tiêu đề"
              value={draft.networkBridge.title}
              onChange={(v) =>
                setDraft({ ...draft, networkBridge: { ...draft.networkBridge, title: v } })
              }
            />
            <Area
              label="Nội dung"
              value={draft.networkBridge.body}
              onChange={(v) =>
                setDraft({ ...draft, networkBridge: { ...draft.networkBridge, body: v } })
              }
            />
            <Field
              label="Nhãn nút"
              value={draft.networkBridge.cta.label}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  networkBridge: {
                    ...draft.networkBridge,
                    cta: { ...draft.networkBridge.cta, label: v },
                  },
                })
              }
            />
            <Field
              label="Link nút"
              value={draft.networkBridge.cta.href}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  networkBridge: {
                    ...draft.networkBridge,
                    cta: { ...draft.networkBridge.cta, href: v },
                  },
                })
              }
            />
          </div>
        ) : null}

        {active === 'closing' ? (
          <div className="space-y-4">
            <Field
              label="Tiêu đề CTA"
              value={draft.closingTitle}
              onChange={(v) => setDraft({ ...draft, closingTitle: v })}
            />
            <Area
              label="Nội dung"
              value={draft.closingBody}
              onChange={(v) => setDraft({ ...draft, closingBody: v })}
            />
            <Field
              label="Nhãn nút"
              value={draft.closingCta.label}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  closingCta: { ...draft.closingCta, label: v },
                })
              }
            />
            <Field
              label="URL nút (external)"
              value={draft.closingCta.href}
              onChange={(v) =>
                setDraft({
                  ...draft,
                  closingCta: { ...draft.closingCta, href: v },
                })
              }
            />
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-end gap-2 border-t border-portal-100 pt-5">
          <Button type="button" variant="outline" onClick={() => setDraft(home)}>
            Hủy thay đổi form
          </Button>
          <Button type="button" onClick={save}>
            <Save className="h-4 w-4" />
            Lưu & áp dụng trang chủ
          </Button>
        </div>
      </Card>

      <p className="text-xs text-espresso-500">
        Ảnh: dán URL (CDN) hoặc path local <code className="rounded bg-cream-200 px-1">/images/...</code> sau khi
        thả file vào <code className="rounded bg-cream-200 px-1">public/images/</code>.
      </p>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} />
    </div>
  )
}

function ImagePreview({ src, small }: { src: string; small?: boolean }) {
  if (!src) return null
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-portal-200 bg-portal-50',
        small ? 'max-w-xs' : 'max-w-md',
      )}
    >
      <img
        src={src}
        alt="Preview"
        className={cn('w-full object-cover', small ? 'aspect-video' : 'aspect-[4/3]')}
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.opacity = '0.3'
        }}
      />
    </div>
  )
}
