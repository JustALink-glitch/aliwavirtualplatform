import { Badge } from '@/components/ui/Page'
import { linkExpired, type EnrolmentStatus, type MemberStatus } from './data'

/** One status for a participant: their invitation first, then their enrolment. */
export function ParticipantBadge({
  memberStatus,
  invitationExpiresAt,
  enrolmentStatus,
}: {
  memberStatus: MemberStatus
  invitationExpiresAt: string | null
  enrolmentStatus: EnrolmentStatus | null | undefined
}) {
  if (memberStatus === 'deactivated') return <Badge tone="neutral">Access ended</Badge>
  if (enrolmentStatus === 'withdrawn') return <Badge tone="neutral">Withdrawn</Badge>
  if (enrolmentStatus === 'deferred') return <Badge tone="warning">Deferred</Badge>
  if (enrolmentStatus === 'transferred') return <Badge tone="neutral">Transferred</Badge>
  if (memberStatus === 'invited') {
    return linkExpired(invitationExpiresAt) ? <Badge tone="warning">Link expired</Badge> : <Badge tone="neutral">Invited</Badge>
  }
  if (enrolmentStatus === 'completed') return <Badge tone="info">Completed</Badge>
  return <Badge tone="success">Active</Badge>
}
