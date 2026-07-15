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
  SectionTitle,
} from '@/components/ui'
import {
  collaborations,
  getPartner,
  matchRequests,
  statusLabels,
  type MatchRequest,
} from '@/data/seed'

function statusTone(status: MatchRequest['status']) {
  switch (status) {
    case 'in_review':
    case 'submitted':
      return 'info' as const
    case 'needs_info':
      return 'warning' as const
    case 'matched':
    case 'collaboration_active':
      return 'success' as const
    case 'closed':
      return 'neutral' as const
    default:
      return 'neutral' as const
  }
}

export function MyRequestsPage() {
  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Workspace</Eyebrow>
            <PageTitle className="mt-3">Yêu cầu của tôi</PageTitle>
            <Lead className="mt-3">Theo dõi trạng thái, phụ trách và hành động tiếp theo.</Lead>
          </div>
          <ButtonLink to="/match">Yêu cầu kết nối mới</ButtonLink>
        </div>

        <div className="mt-10 overflow-hidden rounded-[var(--radius-card)] border border-cream-300/80 bg-cream-50 shadow-soft">
          <div className="hidden grid-cols-12 gap-3 border-b border-cream-300/80 bg-cream-100/80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-espresso-500 lg:grid">
            <div className="col-span-4">Request</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-3">Hành động tiếp theo</div>
            <div className="col-span-1">Updated</div>
          </div>
          <div className="divide-y divide-cream-300/70">
            {matchRequests.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState
                  title="Chưa có yêu cầu"
                  body="Gửi yêu cầu kết nối mới để bắt đầu quy trình match."
                  action={<ButtonLink to="/match">Yêu cầu kết nối</ButtonLink>}
                />
              </div>
            ) : (
              matchRequests.map((req) => (
                <Link
                  key={req.id}
                  to={`/me/requests/${req.id}`}
                  className="grid gap-2 px-5 py-4 transition hover:bg-cream-100/60 lg:grid-cols-12 lg:items-center lg:gap-3"
                >
                  <div className="lg:col-span-4">
                    <p className="font-medium text-espresso-900">{req.title}</p>
                    <p className="mt-0.5 text-xs text-espresso-500">{req.id}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <Badge tone={statusTone(req.status)}>{statusLabels[req.status]}</Badge>
                  </div>
                  <div className="text-sm text-espresso-600 lg:col-span-2">{req.owner}</div>
                  <div className="text-sm text-espresso-600 lg:col-span-3">{req.nextAction}</div>
                  <div className="text-xs text-espresso-500 lg:col-span-1">{req.updatedAt}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}

export function RequestDetailPage() {
  const { requestId = '' } = useParams()
  const req = matchRequests.find((r) => r.id === requestId)

  if (!req) {
    return (
      <Section>
        <Container>
          <EmptyState
            title="Không tìm thấy yêu cầu"
            body="Quay lại danh sách yêu cầu."
            action={<ButtonLink to="/me/requests">Yêu cầu của tôi</ButtonLink>}
          />
        </Container>
      </Section>
    )
  }

  return (
    <Section className="pt-12 sm:pt-16">
      <Container className="max-w-3xl">
        <Eyebrow>{req.id}</Eyebrow>
        <PageTitle className="mt-3 text-3xl sm:text-4xl">{req.title}</PageTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone={statusTone(req.status)}>{statusLabels[req.status]}</Badge>
          <Badge>Phụ trách: {req.owner}</Badge>
        </div>

        <Card className="mt-8 p-6">
          <p className="text-sm font-semibold text-espresso-900">Hành động tiếp theo</p>
          <p className="mt-2 text-sm text-espresso-600">{req.nextAction}</p>
          {req.status === 'collaboration_active' ? (
            <ButtonLink className="mt-4" to="/me/collaborations/col-221">
              Mở collaboration
            </ButtonLink>
          ) : null}
          {req.status === 'needs_info' ? (
            <ButtonLink className="mt-4" to="/match">
              Bổ sung thông tin
            </ButtonLink>
          ) : null}
        </Card>

        <div className="mt-8">
          <SectionTitle className="text-2xl">Dòng thời gian</SectionTitle>
          <ol className="mt-5 space-y-4 border-l border-cream-300 pl-5">
            {req.timeline.map((t) => (
              <li key={t.date + t.label} className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full bg-terracotta-500" />
                <p className="text-xs text-espresso-500">{t.date}</p>
                <p className="text-sm font-medium text-espresso-800">{t.label}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  )
}

export function MyCollaborationsPage() {
  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Eyebrow>Workspace</Eyebrow>
        <PageTitle className="mt-3">Collaboration của tôi</PageTitle>
        <Lead className="mt-3">
          Workspace riêng mở sau khi 3HORIZONS xác nhận kết nối — theo trạng thái và hành động tiếp theo.
        </Lead>

        {collaborations.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="Chưa có collaboration"
              body="Workspace mở sau khi 3HORIZONS xác nhận match và gán engagement."
              action={<ButtonLink to="/login">Vào portal đối tác</ButtonLink>}
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {collaborations.map((col) => (
              <Link key={col.id} to={`/me/collaborations/${col.id}`}>
                <Card className="h-full p-6 transition hover:shadow-card">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        col.status === 'active'
                          ? 'success'
                          : col.status === 'paused'
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {col.status}
                    </Badge>
                    <span className="text-xs text-espresso-500">{col.updatedAt}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-espresso-900">{col.title}</h2>
                  <p className="mt-1 text-sm text-espresso-500">{col.owner}</p>
                  <p className="mt-4 text-sm text-espresso-600">
                    <span className="font-medium text-espresso-800">Next: </span>
                    {col.nextAction}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {col.partners.map((slug) => {
                      const p = getPartner(slug)
                      return p ? <Badge key={slug}>{p.name}</Badge> : null
                    })}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}

export function CollaborationDetailPage() {
  const { collabId = '' } = useParams()
  const col = collaborations.find((c) => c.id === collabId)

  if (!col) {
    return (
      <Section>
        <Container>
          <EmptyState
            title="Không tìm thấy collaboration"
            body="Quay lại danh sách collaboration."
            action={<ButtonLink to="/me/collaborations">Collaboration của tôi</ButtonLink>}
          />
        </Container>
      </Section>
    )
  }

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Eyebrow>{col.id}</Eyebrow>
        <PageTitle className="mt-3 text-3xl sm:text-4xl">{col.title}</PageTitle>
        <p className="mt-2 text-sm text-espresso-600">{col.owner}</p>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <SectionTitle className="text-2xl">Các mốc</SectionTitle>
            <ul className="mt-5 space-y-3">
              {col.milestones.map((m) => (
                <li
                  key={m.label}
                  className="flex items-center gap-3 rounded-xl border border-cream-300/80 px-4 py-3 text-sm"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      m.done ? 'bg-success text-white' : 'bg-cream-200 text-espresso-500'
                    }`}
                  >
                    {m.done ? '✓' : ''}
                  </span>
                  <span className={m.done ? 'text-espresso-500 line-through' : 'text-espresso-800'}>
                    {m.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="h-fit p-6">
            <p className="text-sm font-semibold text-espresso-900">Hành động tiếp theo</p>
            <p className="mt-2 text-sm text-espresso-600">{col.nextAction}</p>
            <p className="mt-6 text-sm font-semibold text-espresso-900">Đối tác</p>
            <div className="mt-2 space-y-2">
              {col.partners.map((slug) => {
                const p = getPartner(slug)
                return p ? (
                  <Link
                    key={slug}
                    to={`/partners/${slug}`}
                    className="block text-sm font-medium text-terracotta-600 hover:underline"
                  >
                    {p.name}
                  </Link>
                ) : null
              })}
            </div>
            <p className="mt-6 text-xs text-espresso-500">
              Tệp, ghi chú và tin nhắn facilitator sẽ bổ sung ở giai đoạn sau.
            </p>
          </Card>
        </div>
      </Container>
    </Section>
  )
}
