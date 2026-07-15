import {
  Compass,
  Gauge,
  GitBranch,
  Landmark,
  Layers,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { Problem } from '@/data/seed'

const map: Record<Problem['icon'], LucideIcon> = {
  compass: Compass,
  landmark: Landmark,
  layers: Layers,
  gauge: Gauge,
  sparkles: Sparkles,
  'git-branch': GitBranch,
  users: Users,
}

export function ProblemIcon({
  name,
  className,
}: {
  name: Problem['icon']
  className?: string
}) {
  const Icon = map[name]
  return <Icon className={className} strokeWidth={1.6} />
}
