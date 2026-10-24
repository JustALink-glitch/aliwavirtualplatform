import { useState } from 'react'
import { Link, Outlet, useNavigate, useOutletContext, useParams } from 'react-router'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { BookOpenIcon, CalendarIcon, ChartIcon, ChevronRightIcon, InfoTriangleIcon, UserGroupIcon, UserIcon } from '@/components/ui/icons'
import { Metrics } from '@/components/ui/Metrics'
import { EmptyState, PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { Tabs } from '@/components/ui/Tabs'
import { Cell, Row, Stacked, Table, type Column } from '@/components/ui/Table'
import { ApiError } from '@/lib/api'
import { formatDate, formatDateRange, formatDay, plural } from '@/lib/format'
import { initials } from '@/lib/people'
import { CohortStatusBadge } from './badges'
import { ArchiveCohortDialog } from './CohortFormPage'
import { useCohort, useRestoreCohort, type CohortCourse, type CohortSummary } from './data'
import { deliveryLabel } from './labels'
import { CohortParticipantsList } from '@/pages/admin/participants/CohortParticipantsList'
import { CohortSessionsList } from '@/pages/admin/sessions/CohortSessionsList'
import { UpcomingSessions } from '@/pages/admin/sessions/UpcomingSessions'

interface CohortContext {
  cohort: CohortSummary
  courses: CohortCourse[]
}

/** One row per trainer across the cohort's courses (A3.05b). */
function trainersOf(courses: CohortCourse[]) {
  const byId = new Map<string, { id: string; name: string; status: string; lead: string[]; assistant: string[] }>()
  for (const course of courses) {
    for (const t of course.trainers) {
      const entry = byId.get(t.id) ?? { id: t.id, name: `${t.firstName} ${t.lastName}`, status: t.status, lead: [], assistant: [] }
      ;(t.isLead ? entry.lead : entry.assistant).push(course.name)
      byId.set(t.id, entry)
    }
  }
  return [...byId.values()].sort((a, b) => b.lead.length - a.lead.length || a.name.localeCompare(b.name))
}

/** /admin/cohorts/:id — A3.02 header and tabs; the tab content renders below. */
export function CohortLayout() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const query = useCohort(id)
  const restore = useRestoreCohort(id)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)

  if (query.isPending) return <div aria-busy="true" aria-label="Loading cohort" className="h-40" />
  if (query.isError) {
    const missing = query.error instanceof ApiError && query.error.status === 404
    return (
      <>
        <PageHeader title={missing ? 'Cohort not found' : 'Couldn’t load this cohort'} breadcrumb={[{ label: 'Cohorts', to: '/admin/cohorts' }]} />
        <Panel>
          <StatePanel kind={missing ? 'no-results' : 'error'} title={missing ? 'This cohort doesn’t exist' : 'Something went wrong'} />
        </Panel>
      </>
    )
  }

  const { cohort, courses } = query.data
  const archived = cohort.status === 'archived'
  const trainerCount = trainersOf(courses).length

  async function onRestore() {
    setRestoreError(null)
    try {
      await restore.mutateAsync()
    } catch (error) {
      setRestoreError(error instanceof ApiError && error.status < 500 ? error.message : 'It wasn’t restored. Try again.')
    }
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Cohorts', to: '/admin/cohorts' }, { label: cohort.name }]}
        title={cohort.name}
        badge={<CohortStatusBadge status={cohort.status} />}
        description={
          <>
            <Link to={`/admin/programmes/${cohort.programme.id}`} className="hover:text-primary hover:underline">
              {cohort.programme.name}
            </Link>
            {` · ${formatDateRange(cohort.startsOn, cohort.endsOn)} · ${deliveryLabel(cohort.deliveryMode, cohort.usualLocation)}`}
          </>
        }
        actions={
          archived ? (
            <Button onClick={onRestore} disabled={restore.isPending}>
              {restore.isPending ? 'Restoring…' : 'Restore cohort'}
            </Button>
          ) : (
            <>
              {cohort.status === 'completed' && (
                <Button variant="secondary" onClick={() => setArchiveOpen(true)}>
                  Archive cohort
                </Button>
              )}
              <Button variant={cohort.status === 'completed' ? 'primary' : 'secondary'} onClick={() => navigate(`/admin/cohorts/${cohort.id}/edit`)}>
                Edit cohort
              </Button>
              {cohort.status !== 'completed' && (
                <>
                  <Button variant="secondary" onClick={() => navigate(`/admin/participants/import?cohort=${cohort.id}`)}>
                    Import participants
                  </Button>
                  <Button onClick={() => navigate(`/admin/courses/sessions/new?cohort=${cohort.id}`)}>Schedule session</Button>
                </>
              )}
            </>
          )
        }
      />
      {archived && (
        <AlertBanner title="This cohort is archived">It’s read-only and hidden from lists. Restore it to make changes.</AlertBanner>
      )}
      {cohort.status === 'completed' && (
        <AlertBanner title={`This cohort ended on ${formatDate(cohort.endsOn, { year: true })}`}>
          Attendance, grades and session reports are locked once it ends.
        </AlertBanner>
      )}
      {restoreError && (
        <AlertBanner tone="error" title="Couldn’t restore">
          {restoreError}
        </AlertBanner>
      )}
      <Tabs
        label="Cohort sections"
        items={[
          { label: 'Overview', to: `/admin/cohorts/${cohort.id}`, end: true },
          { label: 'Participants', to: `/admin/cohorts/${cohort.id}/participants`, count: cohort.participants },
          { label: 'Sessions', to: `/admin/cohorts/${cohort.id}/sessions` },
          { label: 'Courses', to: `/admin/cohorts/${cohort.id}/courses`, count: courses.length },
          { label: 'Trainers', to: `/admin/cohorts/${cohort.id}/trainers`, count: trainerCount },
        ]}
      />
      <Outlet context={{ cohort, courses } satisfies CohortContext} />
      <ArchiveCohortDialog open={archiveOpen} onClose={() => setArchiveOpen(false)} cohort={cohort} />
    </>
  )
}

/** A3.02 Overview tab. */
export function CohortOverview() {
  const { cohort, courses } = useOutletContext<CohortContext>()
  const trainers = trainersOf(courses)
  return (
    <>
      <Metrics
        items={[
          { label: 'Participants', icon: <UserGroupIcon size={18} />, value: cohort.participants, context: 'Enrolled in this cohort' },
          {
            label: 'Delivery',
            icon: <CalendarIcon size={18} />,
            value: cohort.plannedSessions ? `${cohort.heldSessions} of ${cohort.plannedSessions}` : '—',
            context: cohort.plannedSessions ? 'Sessions held so far' : 'No sessions planned yet',
          },
          { label: 'Attendance, last 4 weeks', icon: <ChartIcon size={18} />, value: '—', context: 'No sessions held yet' },
          { label: 'Needs attention', icon: <InfoTriangleIcon size={18} />, value: '—', context: 'Checked once sessions are held' },
        ]}
      />
      <div className="flex items-start gap-4 max-lg:flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-4 max-lg:w-full">
          <UpcomingSessions cohort={cohort} />
        </div>
        <div className="flex w-[356px] shrink-0 flex-col gap-4 max-lg:w-full">
          <Panel aria-labelledby="trainers-title">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <PanelHeader id="trainers-title" title="Trainers" />
              </div>
              <Link to="trainers" className="inline-flex items-center gap-1 text-caption-strong text-brand-text hover:underline">
                Manage
                <ChevronRightIcon size={14} />
              </Link>
            </div>
            {trainers.length === 0 ? (
              <p className="py-2 text-body text-secondary">
                No trainers yet. A course’s default lead trainer joins automatically when the course is added.
              </p>
            ) : (
              <ul>
                {trainers.map((t) => (
                  <li key={t.id} className="border-b border-default last:border-b-0">
                    <Link to={`/admin/trainers/${t.id}`} className="flex items-center gap-3 py-3">
                      <Avatar size={32} initials={initials(t.name)} seed={t.id} />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-body-strong text-primary">{t.name}</span>
                        <span className="truncate text-caption text-secondary">{[...t.lead, ...t.assistant].join(' · ')}</span>
                      </span>
                      <ChevronRightIcon size={16} className="shrink-0 text-icon-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel aria-labelledby="cohort-courses-title">
            <PanelHeader id="cohort-courses-title" title="Courses" description="Sessions held in this cohort." />
            {courses.length === 0 ? (
              <p className="py-2 text-body text-secondary">No courses yet. Add them from Edit cohort.</p>
            ) : (
              <ul>
                {courses.map((course) => {
                  const pct = course.plannedSessions ? Math.round((course.heldSessions / course.plannedSessions) * 100) : null
                  return (
                    <li key={course.id} className="flex items-center gap-3 border-b border-default py-3 last:border-b-0">
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-body-strong text-primary">{course.name}</span>
                        <span className="truncate text-caption text-secondary">
                          {course.plannedSessions ? `${course.heldSessions} of ${plural(course.plannedSessions, 'session')} held` : 'No sessions planned'}
                        </span>
                      </span>
                      {pct !== null && <span className="text-body-strong text-primary tabular-nums">{pct}%</span>}
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}

/** A3.03 Participants tab. */
export function CohortParticipants() {
  const { cohort } = useOutletContext<CohortContext>()
  return <CohortParticipantsList cohort={cohort} />
}

/** A3.04 Sessions tab — empty until sessions are scheduled. */
export function CohortSessions() {
  const { cohort } = useOutletContext<CohortContext>()
  return <CohortSessionsList cohort={cohort} />
}

const courseColumns: Column[] = [
  { label: 'Course' },
  { label: 'Lead trainer', width: 220 },
  { label: 'Assistant', width: 180, hideBelow: 'lg' },
  { label: 'Sessions held', width: 130, align: 'right' },
  { label: 'Assignments', width: 120, align: 'right', hideBelow: 'xl' },
]

/** A3.05 Courses tab. */
export function CohortCourses() {
  const { cohort, courses } = useOutletContext<CohortContext>()
  const navigate = useNavigate()
  return (
    <>
      <AlertBanner title="Trainers are assigned per course">
        Each course in this cohort has its own lead trainer and optional assistants. Change this in Settings › Programme setup.
      </AlertBanner>
      <Panel aria-labelledby="courses-tab-title">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <PanelHeader id="courses-tab-title" title="Courses in this cohort" description={`From the ${cohort.programme.name} course library.`} />
          </div>
          {cohort.status !== 'archived' && (
            <Button variant="secondary" onClick={() => navigate(`/admin/cohorts/${cohort.id}/edit`)}>
              Change courses
            </Button>
          )}
        </div>
        {courses.length === 0 ? (
          <EmptyState icon={<BookOpenIcon size={24} />} title="No courses in this cohort" body="Tick courses from the programme’s library in Edit cohort." />
        ) : (
          <Table columns={courseColumns}>
            {courses.map((course) => {
              const lead = course.trainers.find((t) => t.isLead)
              const assistants = course.trainers.filter((t) => !t.isLead)
              return (
                <Row key={course.id}>
                  <Cell>
                    <Stacked primary={course.name} secondary={course.firstSessionAt ? `Starts ${formatDay(course.firstSessionAt)}` : 'No sessions yet'} />
                  </Cell>
                  <Cell>
                    {lead ? (
                      <Link to={`/admin/trainers/${lead.id}`} className="flex min-w-0 items-center gap-2 hover:underline">
                        <Avatar initials={initials(lead.firstName, lead.lastName)} seed={lead.id} />
                        <span className="truncate text-body-strong">
                          {lead.firstName} {lead.lastName}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-muted">Not assigned</span>
                    )}
                  </Cell>
                  <Cell hideBelow="lg" className={assistants.length ? undefined : 'text-muted'}>
                    {assistants.length ? assistants.map((a) => `${a.firstName} ${a.lastName}`).join(', ') : '—'}
                  </Cell>
                  <Cell align="right" className="text-body-strong">
                    {course.plannedSessions ? `${course.heldSessions} of ${course.plannedSessions}` : course.heldSessions}
                  </Cell>
                  <Cell align="right" hideBelow="xl" className="text-muted">
                    —
                  </Cell>
                </Row>
              )
            })}
          </Table>
        )}
      </Panel>
    </>
  )
}

const trainerColumns: Column[] = [
  { label: 'Trainer' },
  { label: 'Role', width: 120 },
  { label: 'Courses', width: 300, hideBelow: 'lg' },
  { label: 'Sessions held', width: 120, align: 'right', hideBelow: 'xl' },
  { label: 'Reports submitted', width: 150, align: 'right', hideBelow: 'xl' },
]

/** A3.05b Trainers tab. */
export function CohortTrainers() {
  const { courses } = useOutletContext<CohortContext>()
  const trainers = trainersOf(courses)
  return (
    <Panel aria-labelledby="trainers-tab-title">
      <PanelHeader id="trainers-tab-title" title="Trainers in this cohort" description="Lead and assistant trainers across this cohort’s courses." />
      {trainers.length === 0 ? (
        <EmptyState
          icon={<UserIcon size={24} />}
          title="No trainers yet"
          body="Give each course a default lead trainer and they join every cohort that runs it."
        />
      ) : (
        <Table columns={trainerColumns}>
          {trainers.map((t) => (
            <Row key={t.id} to={`/admin/trainers/${t.id}`}>
              <Cell>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar initials={initials(t.name)} seed={t.id} />
                  <Stacked primary={t.name} secondary={t.status === 'invited' ? 'Invitation pending' : undefined} />
                </span>
              </Cell>
              <Cell>{t.lead.length ? 'Lead' : 'Assistant'}</Cell>
              <Cell hideBelow="lg">{[...t.lead, ...t.assistant].join(', ')}</Cell>
              <Cell align="right" hideBelow="xl" className="text-muted">
                —
              </Cell>
              <Cell align="right" hideBelow="xl" className="text-muted">
                —
              </Cell>
            </Row>
          ))}
        </Table>
      )}
    </Panel>
  )
}
