import { Badge } from '@/components/ui/Page'
import { invitationExpired, type Member } from './members'

/** Active · Invited · Link expired · Deactivated. */
export function StatusBadge({ member }: { member: Pick<Member, 'status' | 'invitationExpiresAt'> }) {
  if (member.status === 'active') return <Badge tone="success">Active</Badge>
  if (member.status === 'deactivated') return <Badge tone="neutral">Deactivated</Badge>
  if (invitationExpired(member)) return <Badge tone="warning">Link expired</Badge>
  return <Badge tone="neutral">Invited</Badge>
}
