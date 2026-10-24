import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { Button } from '@/components/ui/Button'
import { DetailList } from '@/components/ui/FormLayout'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@/components/ui/icons'
import { Badge, EmptyState, Panel, PanelHeader } from '@/components/ui/Page'
import { FilterSelect } from '@/components/ui/SearchField'
import { formatDate, formatDay, localDate, plural, todayIn } from '@/lib/format'
import { addDays, weekdayOf } from '@/lib/schedule'
import { useCohorts, useCourses } from '@/pages/admin/programmes/data'
import { CoursesHeader } from './CoursesHeader'
import { useSessions, type Session } from './data'
import { SessionRow } from './SessionRow'

const mondayOf = (date: string) => addDays(date, 1 - weekdayOf(date))

/** "Mon 19 – Sun 25 Oct" (months shown when they differ). */
function weekRange(start: string): string {
  const end = addDays(start, 6)
  const a = formatDate(start)
  const b = formatDate(end)
  return a.split(' ')[2] === b.split(' ')[2] ? `${a.split(' ').slice(0, 2).join(' ')} – ${b}` : `${a} – ${b}`
}

/** /admin/courses — C1.01 Sessions (week view), C1.01e empty. */
export function SessionsPage() {
  const navigate = useNavigate()
  const { state } = useAuth()
  const orgZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const today = todayIn(orgZone)
  const [week, setWeek] = useState(() => mondayOf(today))
  const [cohortId, setCohortId] = useState('')
  const cohorts = useCohorts()
  const courses = useCourses()
  const query = useSessions({ from: week, to: addDays(week, 6), cohortId: cohortId || undefined })
  const timeZone = query.data?.timeZone ?? orgZone

  const sessions = query.data?.sessions ?? []
  const byDay = new Map<string, Session[]>()
  for (const s of sessions) {
    const d = localDate(s.startsAt, timeZone)
    byDay.set(d, [...(byDay.get(d) ?? []), s])
  }
  const live = sessions.filter((s) => !s.cancelled)
  const thisWeek = week === mondayOf(today)
  const openCohorts = (cohorts.data ?? []).filter((c) => ['active', 'upcoming', 'draft'].includes(c.status))

  const scheduleButton = (
    <Button
      icon={<PlusIcon size={16} />}
      onClick={() => navigate(`sessions/new${cohortId ? `?cohort=${cohortId}` : ''}`)}
      disabled={!cohorts.isPending && openCohorts.length === 0}
      title={openCohorts.length === 0 ? 'Create a cohort first' : undefined}
    >
      Schedule session
    </Button>
  )

  return (
    <>
      <CoursesHeader tab="sessions" actions={scheduleButton} courseCount={courses.data?.length} />

      {query.isError ? (
        <Panel>
          <StatePanel
            kind="error"
            title="Couldn’t load sessions"
            description="Check your connection and try again."
            action={{ label: 'Try again', onClick: () => void query.refetch() }}
          />
        </Panel>
      ) : query.data && !query.data.hasAny && !cohortId ? (
        <Panel className="py-16">
          <EmptyState
            icon={<CalendarIcon size={24} />}
            title="No sessions scheduled yet"
            body={
              openCohorts.length === 0
                ? 'Sessions belong to a course in a cohort. Create a cohort and add its courses first.'
                : 'Sessions belong to a course in a cohort. Schedule the first one — repeating sessions are created in one go.'
            }
            actions={openCohorts.length > 0 && scheduleButton}
          />
        </Panel>
      ) : (
        <>
          <div className="flex items-center gap-2 max-md:flex-wrap">
            <button
              type="button"
              aria-label="Previous week"
              onClick={() => setWeek(addDays(week, -7))}
              className="inline-flex size-9 items-center justify-center rounded-md border border-default bg-surface text-icon hover:bg-surface-hover"
            >
              <ChevronLeftIcon size={18} />
            </button>
            <button
              type="button"
              aria-label="Next week"
              onClick={() => setWeek(addDays(week, 7))}
              className="inline-flex size-9 items-center justify-center rounded-md border border-default bg-surface text-icon hover:bg-surface-hover"
            >
              <ChevronRightIcon size={18} />
            </button>
            <h2 className="px-1 text-heading-section text-primary" aria-live="polite">
              {thisWeek ? 'This week · ' : ''}
              {weekRange(week)}
            </h2>
            <div className="flex-1" />
            <FilterSelect aria-label="Cohort" value={cohortId} onChange={(e) => setCohortId(e.target.value)} className="w-48">
              <option value="">All cohorts</option>
              {(cohorts.data ?? [])
                .filter((c) => c.status !== 'archived')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </FilterSelect>
            <Button variant="secondary" onClick={() => setWeek(mondayOf(today))} disabled={thisWeek}>
              Today
            </Button>
          </div>

          <div className="flex items-start gap-4 max-lg:flex-col">
            <Panel className="min-w-0 flex-1 gap-4 max-lg:w-full" aria-busy={query.isPending}>
              {query.isPending ? (
                <div className="h-40" />
              ) : sessions.length === 0 ? (
                <EmptyState icon={<CalendarIcon size={24} />} title="No sessions this week" body="Use the arrows to see other weeks, or schedule a session." />
              ) : (
                [...byDay.entries()].map(([date, items]) => (
                  <section key={date} aria-label={formatDate(date)}>
                    <h3 className={date === today ? 'text-caption-strong text-brand-text' : 'text-caption-strong text-secondary'}>
                      {date === today ? 'Today · ' : ''}
                      {formatDate(date)} · {plural(items.filter((s) => !s.cancelled).length, 'session')}
                    </h3>
                    <ul>
                      {items.map((s) => (
                        <SessionRow key={s.id} session={s} timeZone={timeZone} />
                      ))}
                    </ul>
                  </section>
                ))
              )}
            </Panel>

            <div className="flex w-[356px] shrink-0 flex-col gap-4 max-lg:w-full">
              <Panel aria-labelledby="confirm-title">
                <PanelHeader id="confirm-title" title="Attendance to confirm" description="Past sessions with no attendance recorded." />
                {(query.data?.attendanceToConfirm ?? []).length === 0 ? (
                  <p className="py-2 text-body text-secondary">Nothing to confirm.</p>
                ) : (
                  <ul>
                    {query.data!.attendanceToConfirm.map((s) => (
                      <li key={s.id} className="border-b border-default last:border-b-0">
                        <Link to={`sessions/${s.id}/attendance`} className="flex items-center gap-3 py-3 hover:bg-surface-hover">
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-body-strong text-primary">{s.title}</span>
                            <span className="text-caption text-secondary">
                              {formatDay(s.startsAt, timeZone)} · {s.cohort.name} · {s.trainer?.name ?? 'No trainer'}
                            </span>
                          </span>
                          <Badge tone="warning">Not recorded</Badge>
                          <ChevronRightIcon size={16} className="shrink-0 text-icon-muted" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-caption text-secondary">Attendance rates exclude sessions until they are recorded.</p>
              </Panel>
              <Panel aria-labelledby="week-title">
                <PanelHeader id="week-title" title={thisWeek ? 'This week' : 'Week summary'} />
                <DetailList
                  items={[
                    { label: 'Sessions', value: live.length },
                    { label: 'In person', value: live.filter((s) => s.mode === 'in_person').length },
                    { label: 'Online', value: live.filter((s) => s.mode === 'online').length },
                    ...(sessions.length > live.length ? [{ label: 'Cancelled', value: sessions.length - live.length }] : []),
                  ]}
                />
              </Panel>
            </div>
          </div>
        </>
      )}
    </>
  )
}
