import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { CalendarIcon, ChevronRightIcon, PlusIcon } from '@/components/ui/icons'
import { Badge, EmptyState, FilterChips, Panel } from '@/components/ui/Page'
import { SearchField } from '@/components/ui/SearchField'
import { Cell, Row, Stacked, Table, TableFooter, type Column } from '@/components/ui/Table'
import { formatDay, formatTimeRange, plural } from '@/lib/format'
import { paginate } from '@/lib/paginate'
import { initials } from '@/lib/people'
import type { CohortSummary } from '@/pages/admin/programmes/data'
import { isPast, useSessions, whereLabel, type Session } from './data'
import { SessionStatusBadge } from './SessionRow'

type Filter = 'all' | 'upcoming' | 'held' | 'cancelled'
const inFilter = (s: Session, f: Filter) =>
  f === 'all' || (f === 'upcoming' ? s.status === 'scheduled' || s.status === 'in_progress' : s.status === f)

const columns: Column[] = [
  { label: 'Date and time', width: 150 },
  { label: 'Course' },
  { label: 'Trainer', width: 200, hideBelow: 'lg' },
  { label: 'Status', width: 120 },
  { label: 'Present', width: 100, align: 'right', hideBelow: 'xl' },
  { label: 'Report', width: 110, hideBelow: 'xl' },
  { label: '', width: 70 },
]

function ReportCell({ s }: { s: Session }) {
  if (s.status !== 'held') return <span className="text-muted">—</span>
  if (s.report.submittedAt) return <Badge tone="success">Submitted</Badge>
  return isPast(s.report.dueAt) ? <Badge tone="error">Overdue</Badge> : <Badge tone="warning">Due</Badge>
}

/** A3.04 Cohort · Sessions. Upcoming first, then past, newest first. */
export function CohortSessionsList({ cohort }: { cohort: CohortSummary }) {
  const navigate = useNavigate()
  const location = useLocation()
  const scheduled = (location.state as { scheduled?: number } | null)?.scheduled
  const { state } = useAuth()
  const query = useSessions({ cohortId: cohort.id })
  const timeZone = query.data?.timeZone ?? (state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const open = ['active', 'upcoming', 'draft'].includes(cohort.status)

  const all = query.data?.sessions ?? []
  const ordered = [
    ...all.filter((s) => s.status === 'scheduled' || s.status === 'in_progress'),
    ...all.filter((s) => s.status === 'held' || s.status === 'cancelled').reverse(),
  ]
  const term = search.trim().toLowerCase()
  const visible = ordered.filter((s) => inFilter(s, filter) && (!term || s.title.toLowerCase().includes(term) || (s.trainer?.name.toLowerCase().includes(term) ?? false)))
  const paged = paginate(visible, page)
  const count = (f: Filter) => all.filter((s) => inFilter(s, f)).length

  const scheduleButton = open && (
    <Button icon={<PlusIcon size={16} />} onClick={() => navigate(`/admin/courses/sessions/new?cohort=${cohort.id}`)}>
      Schedule session
    </Button>
  )

  if (query.isPending) {
    return (
      <Panel aria-busy="true" aria-label="Loading sessions" className="h-[200px]">
        <span className="sr-only">Loading</span>
      </Panel>
    )
  }
  if (query.isError) {
    return (
      <Panel>
        <StatePanel kind="error" title="Couldn’t load sessions" action={{ label: 'Try again', onClick: () => void query.refetch() }} />
      </Panel>
    )
  }

  return (
    <>
      {scheduled && <AlertBanner tone="success" title={`${plural(scheduled, 'session')} scheduled`} />}
      {all.length === 0 ? (
        <Panel className="py-12">
          <EmptyState
            icon={<CalendarIcon size={24} />}
            title="No sessions scheduled yet"
            body={
              open
                ? 'Each session belongs to one of this cohort’s courses. Repeating sessions are created in one go.'
                : `${cohort.name} has ${cohort.status === 'archived' ? 'been archived' : 'ended'}.`
            }
            actions={scheduleButton}
          />
        </Panel>
      ) : (
        <>
          <div className="flex items-center gap-3 max-lg:flex-wrap max-md:flex-col max-md:items-stretch">
            <SearchField aria-label="Search sessions" placeholder="Search sessions" value={search} onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }} />
            <FilterChips
              label="Status"
              value={filter}
              onChange={(value) => {
                setFilter(value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'All', count: all.length },
                { value: 'upcoming', label: 'Upcoming', count: count('upcoming') },
                { value: 'held', label: 'Held', count: count('held') },
                { value: 'cancelled', label: 'Cancelled', count: count('cancelled') },
              ]}
            />
          </div>
          <Panel className="gap-0 max-md:py-2">
            {visible.length === 0 ? (
              <StatePanel kind="no-results" title="No sessions match" description="Try another course or trainer, or clear the filter." />
            ) : (
              <>
                <div className="max-md:hidden">
                  <Table columns={columns}>
                    {paged.rows.map((s) => (
                      <Row key={s.id} to={`/admin/courses/sessions/${s.id}`}>
                        <Cell>
                          <Stacked primary={formatDay(s.startsAt, timeZone)} secondary={formatTimeRange(s.startsAt, s.endsAt, timeZone)} muted={Boolean(s.cancelled)} />
                        </Cell>
                        <Cell>
                          <Stacked
                            primary={s.title}
                            muted={Boolean(s.cancelled)}
                            secondary={s.cancelled ? `Cancelled${s.cancelled.by ? ` by ${s.cancelled.by}` : ''}` : [s.number && `Session ${s.number} of ${s.total}`, whereLabel(s)].filter(Boolean).join(' · ')}
                          />
                        </Cell>
                        <Cell hideBelow="lg">
                          {s.trainer ? (
                            <span className="flex min-w-0 items-center gap-2">
                              <Avatar initials={initials(s.trainer.name)} seed={s.trainer.id} />
                              <span className="truncate">{s.trainer.name}</span>
                            </span>
                          ) : (
                            <span className="text-muted">Not assigned</span>
                          )}
                        </Cell>
                        <Cell>
                          <SessionStatusBadge status={s.status} />
                        </Cell>
                        <Cell align="right" hideBelow="xl" className={s.attendance.recorded ? 'text-body-strong' : 'text-muted'}>
                          {s.status === 'held' || s.status === 'in_progress' ? (s.attendance.recorded ? `${s.attendance.present} of ${s.expected}` : 'Not recorded') : '—'}
                        </Cell>
                        <Cell hideBelow="xl">
                          <ReportCell s={s} />
                        </Cell>
                        <Cell>
                          <Link to={`/admin/courses/sessions/${s.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-caption-strong text-brand-text">
                            Open
                            <ChevronRightIcon size={14} />
                          </Link>
                        </Cell>
                      </Row>
                    ))}
                  </Table>
                </div>
                <ul className="md:hidden">
                  {paged.rows.map((s) => (
                    <li key={s.id} className="border-b border-default last:border-b-0">
                      <Link to={`/admin/courses/sessions/${s.id}`} className="flex items-center gap-3 py-3">
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-body-strong text-primary">{s.title}</span>
                          <span className="truncate text-caption text-secondary">
                            {formatDay(s.startsAt, timeZone)}, {formatTimeRange(s.startsAt, s.endsAt, timeZone)} · {whereLabel(s)}
                          </span>
                        </span>
                        <SessionStatusBadge status={s.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <TableFooter summary={plural(visible.length, 'session')} page={paged.page} pageCount={paged.pageCount} onPage={setPage} />
          </Panel>
        </>
      )}
    </>
  )
}
