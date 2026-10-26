import { Badge } from '@/components/ui/Page'
import { linkExpired, type EnrolmentStatus, type MemberStatus } from './data'

/** One status for a participant: their invitation first, then their enrolment. */
export function ParticipantBadge({
  memberStatus,
  invitationExpiresAt,
  enrolmentStatus,
  flags,
}: {
  memberStatus: MemberStatus
  invitationExpiresAt: string | null
  enrolmentStatus: EnrolmentStatus | null | undefined
  /** Open Needs attention flags; when given, active participants show On track or Needs attention (B1.01). */
  flags?: number
}) {
  if (memberStatus === 'deactivated') return <Badge tone="neutral">Access ended</Badge>
  if (enrolmentStatus === 'withdrawn') return <Badge tone="neutral">Withdrawn</Badge>
  if (enrolmentStatus === 'deferred') return <Badge tone="warning">Deferred</Badge>
  if (enrolmentStatus === 'transferred') return <Badge tone="neutral">Transferred</Badge>
  if (memberStatus === 'invited') {
    return linkExpired(invitationExpiresAt) ? <Badge tone="warning">Link expired</Badge> : <Badge tone="neutral">Invited</Badge>
  }
  if (enrolmentStatus === 'completed') return <Badge tone="info">Completed</Badge>
  if (flags !== undefined) return flags > 0 ? <Badge tone="warning">Needs attention</Badge> : <Badge tone="success">On track</Badge>
  return <Badge tone="success">Active</Badge>
}

/** B1.01 Assignments cell: "2 of 3 submitted" over "1 overdue" or "2 due this week". */
export function AssignmentsSummary({ value }: { value: { due: number; submitted: number; overdue: number; dueThisWeek: number } | undefined }) {
  if (!value || (value.due === 0 && value.dueThisWeek === 0)) return <span className="text-muted">—</span>
  const detail = value.overdue ? `${value.overdue} overdue` : value.dueThisWeek ? `${value.dueThisWeek} due this week` : '—'
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate text-body text-primary">{value.due ? `${value.submitted} of ${value.due} submitted` : 'None due yet'}</span>
      <span className={value.overdue ? 'truncate text-caption text-warning-fg' : 'truncate text-caption text-secondary'}>{detail}</span>
    </span>
  )
}
