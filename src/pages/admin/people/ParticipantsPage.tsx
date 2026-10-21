import { StatePanel } from '@/components/StatePanel'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { PlusIcon, UserGroupIcon } from '@/components/ui/icons'
import { EmptyState, PageHeader, Panel } from '@/components/ui/Page'
import { initials } from '@/lib/people'
import { fullNameOf, useMembers } from './members'
import { StatusBadge } from './StatusBadge'

const NEEDS_COHORT = 'Add a cohort first — every participant joins one.'

/**
 * /admin/participants — B1.01e Participants · Empty.
 * Adding (B1.02) and importing need a cohort to enrol into, so both wait for cohorts (A3).
 * People invited before that are listed plainly until the full B1.01 table arrives with cohorts.
 */
export function ParticipantsPage() {
  const members = useMembers(['participant'])
  const actions = (
    <>
      <Button variant="secondary" disabled title={NEEDS_COHORT}>
        Import participants
      </Button>
      <Button icon={<PlusIcon size={16} />} disabled title={NEEDS_COHORT}>
        Add participant
      </Button>
    </>
  )
  const people = members.data ?? []

  return (
    <>
      <PageHeader title="Participants" description="People enrolled in your cohorts." actions={actions} />
      {members.isPending ? (
        <Panel aria-busy="true" aria-label="Loading participants" className="h-[240px]">
          <span className="sr-only">Loading participants</span>
        </Panel>
      ) : members.isError ? (
        <Panel>
          <StatePanel kind="error" title="Couldn’t load participants" description="Check your connection and try again." action={{ label: 'Try again', onClick: () => void members.refetch() }} />
        </Panel>
      ) : people.length === 0 ? (
        <Panel className="py-16">
          <EmptyState
            icon={<UserGroupIcon size={24} />}
            title="No participants yet"
            body={
              <>
                Add people one by one or import a CSV. Each person gets an email invitation to set a password.
                <span className="mt-1 block text-muted">{NEEDS_COHORT}</span>
              </>
            }
          />
        </Panel>
      ) : (
        <Panel className="gap-0">
          <ul>
            {people.map((member) => (
              <li key={member.id} className="flex items-center gap-3 border-b border-default py-2.5 last:border-b-0">
                <Avatar initials={initials(member.firstName, member.lastName)} seed={member.id} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body-strong text-primary">{fullNameOf(member)}</span>
                  <span className="truncate text-caption text-secondary">{member.email}</span>
                </span>
                <StatusBadge member={member} />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  )
}
