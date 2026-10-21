import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ChevronRightIcon, PlusIcon, UserGroupIcon } from '@/components/ui/icons'
import { EmptyState, FilterChips, Panel } from '@/components/ui/Page'
import { SearchField } from '@/components/ui/SearchField'
import { Cell, Row, Stacked, Table, TableFooter, type Column } from '@/components/ui/Table'
import { plural, relativeDay } from '@/lib/format'
import { paginate } from '@/lib/paginate'
import { initials } from '@/lib/people'
import type { CohortSummary } from '@/pages/admin/programmes/data'
import { AddParticipantDialog } from './AddParticipantDialog'
import { useParticipants, type EnrolmentStatus } from './data'
import { ParticipantBadge } from './ParticipantBadge'

type Filter = 'all' | 'active' | 'deferred' | 'withdrawn'
const inFilter = (status: EnrolmentStatus, filter: Filter) =>
  filter === 'all' || (filter === 'withdrawn' ? status === 'withdrawn' || status === 'transferred' : status === filter)

const columns: Column[] = [
  { label: 'Participant' },
  { label: 'Status', width: 130 },
  { label: 'Attendance', width: 110, align: 'right', hideBelow: 'xl' },
  { label: 'Assignments', width: 140, hideBelow: 'xl' },
  { label: 'Last signed in', width: 140, hideBelow: 'lg' },
  { label: '', width: 70 },
]

/** A3.03 Cohort · Participants. */
export function CohortParticipantsList({ cohort }: { cohort: CohortSummary }) {
  const navigate = useNavigate()
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const query = useParticipants(cohort.id)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [adding, setAdding] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const open = cohort.status === 'active' || cohort.status === 'upcoming' || cohort.status === 'draft'

  const all = query.data?.participants ?? []
  const term = search.trim().toLowerCase()
  const visible = all.filter(
    (p) => p.enrolment && inFilter(p.enrolment.status, filter) && (!term || `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) || p.email.includes(term)),
  )
  const paged = paginate(visible, page)
  const count = (f: Filter) => all.filter((p) => p.enrolment && inFilter(p.enrolment.status, f)).length

  const actions = open && (
    <>
      <Button variant="secondary" onClick={() => navigate(`/admin/participants/import?cohort=${cohort.id}`)}>
        Import participants
      </Button>
      <Button icon={<PlusIcon size={16} />} onClick={() => setAdding(true)}>
        Add participant
      </Button>
    </>
  )

  if (query.isPending) return <Panel aria-busy="true" aria-label="Loading participants" className="h-[200px]"><span className="sr-only">Loading</span></Panel>
  if (query.isError) {
    return (
      <Panel>
        <StatePanel kind="error" title="Couldn’t load participants" action={{ label: 'Try again', onClick: () => void query.refetch() }} />
      </Panel>
    )
  }

  return (
    <>
      {notice && <AlertBanner tone="success" title={notice} />}
      {all.length === 0 ? (
        <Panel className="py-12">
          <EmptyState
            icon={<UserGroupIcon size={24} />}
            title="No participants in this cohort yet"
            body={
              open
                ? 'Add people one by one or import a CSV. Each person gets an email invitation to set a password.'
                : `${cohort.name} has ${cohort.status === 'archived' ? 'been archived' : 'ended'}, so no one can be added.`
            }
            actions={actions}
          />
        </Panel>
      ) : (
        <>
          <div className="flex items-center gap-3 max-lg:flex-wrap max-md:flex-col max-md:items-stretch">
            <SearchField aria-label="Search participants in this cohort" placeholder="Search participants in this cohort" width={300} value={search} onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }} />
            <FilterChips
              label="Enrolment"
              value={filter}
              onChange={(value) => {
                setFilter(value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'All', count: all.length },
                { value: 'active', label: 'Active', count: count('active') },
                { value: 'deferred', label: 'Deferred', count: count('deferred') },
                { value: 'withdrawn', label: 'Withdrawn', count: count('withdrawn') },
              ]}
            />
            <div className="flex-1" />
            <div className="flex gap-2 max-md:[&>*]:h-11 max-md:[&>*]:flex-1">{actions}</div>
          </div>
          <Panel className="gap-0 max-md:py-2">
            {visible.length === 0 ? (
              <StatePanel kind="no-results" title="No participants match" description="Try another name, or clear the filter." />
            ) : (
              <>
                <div className="max-md:hidden">
                  <Table columns={columns}>
                    {paged.rows.map((p) => (
                      <Row key={p.id} to={`/admin/participants/${p.id}`}>
                        <Cell>
                          <span className="flex min-w-0 items-center gap-3">
                            <Avatar initials={initials(p.firstName, p.lastName)} seed={p.id} />
                            <Stacked primary={`${p.firstName} ${p.lastName}`} secondary={p.email} />
                          </span>
                        </Cell>
                        <Cell>
                          <ParticipantBadge memberStatus={p.status} invitationExpiresAt={p.invitationExpiresAt} enrolmentStatus={p.enrolment?.status} />
                        </Cell>
                        <Cell align="right" hideBelow="xl" className="text-muted">
                          —
                        </Cell>
                        <Cell hideBelow="xl" className="text-muted">
                          —
                        </Cell>
                        <Cell hideBelow="lg" className={p.lastSignInAt ? undefined : 'text-muted'}>
                          {p.lastSignInAt ? relativeDay(p.lastSignInAt, timeZone) : 'Never'}
                        </Cell>
                        <Cell>
                          <Link to={`/admin/participants/${p.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-caption-strong text-brand-text">
                            View
                            <ChevronRightIcon size={14} />
                          </Link>
                        </Cell>
                      </Row>
                    ))}
                  </Table>
                </div>
                <ul className="md:hidden">
                  {paged.rows.map((p) => (
                    <li key={p.id} className="border-b border-default last:border-b-0">
                      <Link to={`/admin/participants/${p.id}`} className="flex items-center gap-3 py-3">
                        <Avatar size={32} initials={initials(p.firstName, p.lastName)} seed={p.id} />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-body-strong text-primary">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="truncate text-caption text-secondary">{p.email}</span>
                        </span>
                        <ParticipantBadge memberStatus={p.status} invitationExpiresAt={p.invitationExpiresAt} enrolmentStatus={p.enrolment?.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <TableFooter summary={plural(visible.length, 'participant')} page={paged.page} pageCount={paged.pageCount} onPage={setPage} />
          </Panel>
        </>
      )}
      {open && (
        <AddParticipantDialog
          open={adding}
          onClose={() => setAdding(false)}
          cohorts={[cohort]}
          defaultCohortId={cohort.id}
          onAdded={(result) => {
            setAdding(false)
            setNotice(result.invited ? `Invitation sent to ${result.email}` : `${result.name} was added to ${cohort.name}`)
          }}
        />
      )}
    </>
  )
}
