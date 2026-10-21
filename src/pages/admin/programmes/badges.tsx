import { Badge } from '@/components/ui/Page'
import type { CohortStatus, ProgrammeStatus } from './data'
import { cohortStatusLabel } from './labels'

export function ProgrammeStatusBadge({ status }: { status: ProgrammeStatus }) {
  if (status === 'active') return <Badge tone="success">Active</Badge>
  if (status === 'draft') return <Badge tone="neutral">Draft</Badge>
  return <Badge tone="neutral">Archived</Badge>
}

const cohortTone: Record<CohortStatus, 'success' | 'info' | 'neutral'> = {
  active: 'success',
  upcoming: 'info',
  completed: 'neutral',
  draft: 'neutral',
  archived: 'neutral',
}

export function CohortStatusBadge({ status }: { status: CohortStatus }) {
  return <Badge tone={cohortTone[status]}>{cohortStatusLabel[status]}</Badge>
}
