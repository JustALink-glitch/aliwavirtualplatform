import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { CalendarIcon, ChevronRightIcon } from '@/components/ui/icons'
import { Badge, EmptyState, FilterChips, PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { formatDate, formatDay, formatTime, localDate, plural } from '@/lib/format'
import { useSessions, whereLabel, type Session } from '@/pages/admin/sessions/data'
import { SessionStatusBadge } from '@/pages/admin/sessions/SessionRow'
import { reportState, weeks } from './data'

type Tab = 'this' | 'next' | 'past'

const reportBadge = {
  submitted: { tone: 'success' as const, label: 'Report submitted' },
  due: { tone: 'warning' as const, label: 'Report due' },
  overdue: { tone: 'error' as const, label: 'Report overdue' },
}

/** /trainer/sessions — T3.01 My sessions, T3.01e empty. */
export function MySessionsPage() {
  const navigate = useNavigate()
  const { state } = useAuth()
  const me = state.status === 'signed-in' ? state.me : null
  const assistant = me?.membership.role === 'assistant_trainer'
  const range = weeks(me?.organisation?.timeZone)
  const query = useSessions({ from: range.pastFrom, to: range.nextWeek.to })
  const [tab, setTab] = useState<Tab>('this')
  const timeZone = query.data?.timeZone ?? me?.organisation?.timeZone
  const all = query.data?.sessions ?? []
  const inWeek = (s: Session, w: { from: string; to: string }) => {
    const d = localDate(s.startsAt, timeZone)
    return d >= w.from && d <= w.to
  }
  const thisWeek = all.filter((s) => inWeek(s, range.thisWeek))
  const nextWeek = all.filter((s) => inWeek(s, range.nextWeek))
  const past = all.filter((s) => s.status === 'held').reverse()
  const overdue = past.filter((s) => reportState(s) === 'overdue')
  const due = past.filter((s) => reportState(s) === 'due')

  return (
    <>
      <PageHeader
        title="My sessions"
        description="Sessions you lead or assist in. Take the register from each session."
        actions={
          !assistant && (
            <Button icon={<CalendarIcon size={16} />} onClick={() => navigate('new')}>
              Schedule session
            </Button>
          )
        }
      />
      {query.isPending ? (
        <Panel aria-busy="true" aria-label="Loading sessions" className="h-[240px]">
          <span className="sr-only">Loading sessions</span>
        </Panel>
      ) : query.isError ? (
        <Panel>
          <StatePanel
            kind="error"
            title="Couldn’t load your sessions"
            description="Check your connection and try again."
            action={{ label: 'Try again', onClick: () => void query.refetch() }}
          />
        </Panel>
      ) : !query.data.hasAny ? (
        <Panel className="py-12">
          <EmptyState
            icon={<CalendarIcon size={24} />}
            title="No sessions yet"
            body={
              assistant
                ? 'When the lead trainer or an admin schedules sessions for your courses, they show here.'
                : 'Schedule the first session for a course you teach. Participants see it on their timetable straight away.'
            }
            actions={!assistant && <Button onClick={() => navigate('new')}>Schedule session</Button>}
          />
        </Panel>
      ) : (
        <>
          <FilterChips
            label="Sessions"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'this', label: 'This week', count: thisWeek.length },
              { value: 'next', label: 'Next week', count: nextWeek.length },
              { value: 'past', label: 'Past', count: past.length },
            ]}
          />
          <div className="grid grid-cols-[minmax(0,1fr)_296px] items-start gap-4 max-lg:grid-cols-1">
            <div className="flex min-w-0 flex-col gap-4">
              {tab === 'past' ? (
                <PastPanel sessions={past} timeZone={timeZone} title="Past sessions" description="Attendance and your session report for each." />
              ) : (
                <WeekPanel
                  title={`${tab === 'this' ? 'This week' : 'Next week'} · ${formatDate(tab === 'this' ? range.thisWeek.from : range.nextWeek.from).replace(/ \w+$/, '')} – ${formatDate(tab === 'this' ? range.thisWeek.to : range.nextWeek.to)}`}
                  sessions={tab === 'this' ? thisWeek : nextWeek}
                  empty={tab === 'this' ? 'No sessions this week.' : 'No sessions next week.'}
                  today={range.today}
                  timeZone={timeZone}
                />
              )}
              {tab !== 'past' && past.length > 0 && (
                <PastPanel
                  sessions={past.slice(0, 3)}
                  timeZone={timeZone}
                  title="Recent sessions"
                  description="Attendance and your session report for each."
                  onAll={() => setTab('past')}
                />
              )}
            </div>
            <div className="flex flex-col gap-4">
              {overdue.length > 0 && (
                <AlertBanner tone="error" title={`${plural(overdue.length, 'session report is', 'session reports are')} overdue`}>
                  {overdue[0]!.title}, {formatDay(overdue[0]!.startsAt, timeZone)}. It was due {formatDay(overdue[0]!.report.dueAt, timeZone)},{' '}
                  {formatTime(overdue[0]!.report.dueAt, timeZone)}.
                </AlertBanner>
              )}
              <Panel className="gap-0">
                <PanelHeader title="Reports due" description="Within 24 hours of each session." />
                {due.length === 0 ? (
                  <p className="py-3 text-body text-secondary">Nothing due right now.</p>
                ) : (
                  <ul className="mt-1">
                    {due.map((s) => (
                      <li key={s.id} className="border-b border-default last:border-b-0">
                        <Link to={`/trainer/reports/${s.id}`} className="flex items-center gap-3 py-2.5 hover:bg-surface-hover">
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-body-strong text-primary">
                              {formatDay(s.startsAt, timeZone)} · {s.course.name}
                            </span>
                            <span className="text-caption text-secondary">
                              Due {formatDay(s.report.dueAt, timeZone)}, {formatTime(s.report.dueAt, timeZone)}
                            </span>
                          </span>
                          <Badge tone="warning">Due</Badge>
                          <ChevronRightIcon size={16} className="shrink-0 text-icon-muted" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function WeekPanel({
  title,
  sessions,
  today,
  timeZone,
  empty,
}: {
  title: string
  sessions: Session[]
  today: string
  timeZone: string | undefined
  empty: string
}) {
  const days = [...new Set(sessions.map((s) => localDate(s.startsAt, timeZone)))]
  return (
    <Panel className="gap-0">
      <PanelHeader title={title} />
      {sessions.length === 0 ? (
        <p className="py-4 text-body text-secondary">{empty}</p>
      ) : (
        days.map((d) => (
          <section key={d} className="pt-3">
            <h3 className="text-caption text-secondary">{d === today ? `Today · ${formatDate(d)}` : formatDate(d)}</h3>
            <ul>
              {sessions
                .filter((s) => localDate(s.startsAt, timeZone) === d)
                .map((s) => (
                  <li key={s.id} className="border-b border-default last:border-b-0">
                    <Link
                      to={s.id}
                      className="flex items-center gap-3 py-2.5 hover:bg-surface-hover focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-body-strong text-primary">
                          {formatTime(s.startsAt, timeZone)} · {s.course.name}
                        </span>
                        <span className="truncate text-caption text-secondary">
                          {[s.cohort.name, s.number && `Session ${s.number} of ${s.total}`, whereLabel(s)].filter(Boolean).join(' · ')}
                        </span>
                      </span>
                      <SessionStatusBadge status={s.status} />
                      <ChevronRightIcon size={16} className="shrink-0 text-icon-muted" />
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))
      )}
    </Panel>
  )
}

function PastPanel({
  sessions,
  timeZone,
  title,
  description,
  onAll,
}: {
  sessions: Session[]
  timeZone: string | undefined
  title: string
  description: string
  onAll?: () => void
}) {
  return (
    <Panel className="gap-0">
      <div className="flex items-start justify-between gap-3">
        <PanelHeader title={title} description={description} />
        {onAll && (
          <button type="button" onClick={onAll} className="inline-flex h-7 shrink-0 items-center gap-1 text-caption-strong text-brand-text hover:underline">
            All past
            <ChevronRightIcon size={14} />
          </button>
        )}
      </div>
      {sessions.length === 0 ? (
        <p className="py-4 text-body text-secondary">No sessions held yet.</p>
      ) : (
        <ul className="mt-1">
          {sessions.map((s) => {
            const report = reportState(s)
            return (
              <li key={s.id} className="border-b border-default last:border-b-0">
                <Link
                  to={s.id}
                  className="flex items-center gap-3 py-2.5 hover:bg-surface-hover focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-body-strong text-primary">
                      {formatDay(s.startsAt, timeZone)} · {s.course.name}
                    </span>
                    <span className="truncate text-caption text-secondary">
                      {s.cohort.name} · {s.attendance.recorded ? `${s.attendance.present} of ${s.expected} present` : 'Attendance not recorded'}
                    </span>
                  </span>
                  {report && <Badge tone={reportBadge[report].tone}>{reportBadge[report].label}</Badge>}
                  <ChevronRightIcon size={16} className="shrink-0 text-icon-muted" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
