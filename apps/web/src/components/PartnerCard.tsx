import { ArrowUpRight, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Partner } from '@/data/seed'
import { Badge, ButtonLink, Card } from '@/components/ui'
import { cn } from '@/lib/cn'

export function PartnerCard({ partner, className }: { partner: Partner; className?: string }) {
  return (
    <Card className={cn('flex h-full flex-col p-6 transition hover:shadow-card', className)}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-espresso-800 font-medium text-cream-50">
          {partner.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/partners/${partner.slug}`}
              className="truncate font-semibold text-espresso-900 hover:text-terracotta-600"
            >
              {partner.name}
            </Link>
            {partner.verified ? (
              <Badge tone="verified">
                <BadgeCheck className="h-3.5 w-3.5" />
                Đã xác minh
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-espresso-600">{partner.title}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-espresso-600">{partner.headline}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {partner.expertise.slice(0, 3).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="text-xs text-espresso-500">{partner.industry}</span>
        <ButtonLink to={`/partners/${partner.slug}`} variant="outline" size="sm">
          Xem hồ sơ
          <ArrowUpRight className="h-3.5 w-3.5" />
        </ButtonLink>
      </div>
    </Card>
  )
}
