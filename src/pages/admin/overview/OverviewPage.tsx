import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import {
  CalendarIcon,
  ChartIcon,
  CheckIcon,
  ChevronRightIcon,
  FileIcon,
  InfoCircleIcon,
  InfoTriangleIcon,
  PlusIcon,
  UserGroupIcon,
} from '@/components/ui/icons'
import { Metrics } from '@/components/ui/Metrics'
import { Badge, EmptyState, FilterChips, PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { Cell, Row, Stacked, Table, type Column } from '@/components/ui/Table'
import { api } from '@/lib/api'
import { formatDate, formatDay, formatTime, localDate, plural, relativeDay } from '@/lib/format'
import { initials } from '@/lib/people'
import { describeFlag, followUpLine, rulesSentence, signalOf, useAttention, type Signal } from '@/pages/admin/attention/data'
import { useCohorts, type CohortSummary } from '@/pages/admin/programmes/data'
import { useSessions, whereLabel } from '@/pages/admin/sessions/data'
import { SessionRow } from '@/pages/admin/sessions/SessionRow'
import { todayLong } from '@/pages/participant/data'
import { addDays } from '@/lib/schedule'
import { daysAgo, todayIn } from './time'

interface Overview {
  organisation: string
  timeZone: string
  programmes: number
  cohorts: { active: number; upcoming: number }
  participants: number
  attendance: { rate: number | null; present: number; recorded: number; previous: number | null }
  needsAttention: { people: number; cohorts: number }
  activity: { weekOf: string; present: number; excused: number; absent: number; rate: number | null }[]
  nextSessions: Record<string, { startsAt: string; mode: string; location: string | null; joinUrl: string | null }>
  setup: {
    organisation: boolean
    programme: boolean
    cohort: boolean
    trainers: boolean
    participants: boolean
    courses: boolean
    session: boolean
    admins: number
  }
}

const useOverview = () => useQuery({ queryKey: ['overview'], queryFn: ({ signal }) => api<Overview>('/v1/overview', { signal }) })

/** /admin — O1.01 Programme overview, O1.01e empty, O1.01l loading, O1.01x partial error. */
export function OverviewPage() {
  const navigate = useNavigate()
  const { state } = useAuth()
  const query = useOverview()
  const cohorts = useCohorts()
  const timeZone = query.data?.timeZone ?? (state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined)
  const data = query.data
  const empty = data && !data.setup.cohort

  const header = (
    <PageHeader
      eyebrow={todayLong(timeZone)}
      title={empty ? 'Welcome to Synqop' : 'Programme overview'}
      description={
        !data
          ? ' '
          : empty
            ? `${data.organisation} has ${plural(data.programmes, 'programme')} and no cohorts yet. Finish setup to start tracking delivery.`
            : `Delivery, attendance and follow-up across ${data.organisation}’s ${plural(data.programmes, 'programme')}.`
      }
      actions={
        <>
          <Button variant="secondary" icon={<FileIcon size={16} />} disabled={!data || empty} onClick={() => navigate('/admin/reports?generate=1')}>
            Generate report
          </Button>
          <Button icon={<PlusIcon size={16} />} onClick={() => navigate('/admin/cohorts/new')}>
            New cohort
          </Button>
        </>
      }
    />
  )

  if (query.isPending) {
    return (
      <>
        {header}
        <div aria-busy="true" aria-label="Loading overview" className="flex flex-col gap-4">
          <div className="h-[104px] animate-pulse rounded-lg bg-skeleton" />
          <div className="grid grid-cols-[minmax(0,1fr)_344px] gap-4 max-xl:grid-cols-1">
            <div className="h-[280px] animate-pulse rounded-lg bg-skeleton" />
            <div className="h-[280px] animate-pulse rounded-lg bg-skeleton" />
          </div>
        </div>
      </>
    )
  }
  if (query.isError) {
    return (
      <>
        {header}
        <Panel>
          <StatePanel
            kind="error"
            title="Couldn’t load the overview"
            description="Check your connection and try again."
            action={{ label: 'Try again', onClick: () => void query.refetch() }}
          />
        </Panel>
      </>
    )
  }
  const d = query.data
  if (empty) return <SetupView data={d} header={header} />

  const change = d.attendance.rate !== null && d.attendance.previous !== null ? d.attendance.rate - d.attendance.previous : null
  return (
    <>
      {header}
      <Metrics
        items={[
          {
            label: 'Active cohorts',
            icon: <CalendarIcon size={18} />,
            value: d.cohorts.active,
            context: `${plural(d.programmes, 'programme')} · ${d.cohorts.upcoming} upcoming`,
          },
          { label: 'Participants', icon: <UserGroupIcon size={18} />, value: d.participants, context: 'Enrolled in active cohorts' },
          {
            label: 'Attendance, last 4 weeks',
            icon: <ChartIcon size={18} />,
            value:
              d.attendance.rate === null ? (
                '—'
              ) : (
                <span className="inline-flex items-center gap-2">
                  {d.attendance.rate}%
                  {change !== null && change !== 0 && (
                    <span
                      className={clsx('rounded-sm px-1.5 text-caption-strong', change < 0 ? 'bg-warning-bg text-warning-fg' : 'bg-success-bg text-success-fg')}
                    >
                      {change < 0 ? '↓' : '↑'} {Math.abs(change)} pts
                    </span>
                  )}
                </span>
              ),
            context:
              d.attendance.rate === null
                ? 'Nothing recorded yet'
                : `${d.attendance.present.toLocaleString()} of ${d.attendance.recorded.toLocaleString()}${d.attendance.previous !== null ? ` · prev. ${d.attendance.previous}%` : ''}`,
          },
          {
            label: 'Needs attention',
            icon: <InfoTriangleIcon size={18} />,
            value: d.needsAttention.people,
            context: d.needsAttention.people ? `Participants across ${plural(d.needsAttention.cohorts, 'cohort')}` : 'No one flagged',
          },
        ]}
      />
      <div className="grid grid-cols-[minmax(0,1fr)_344px] items-start gap-4 max-xl:grid-cols-1">
        <AttentionPanel timeZone={d.timeZone} />
        <ActivityPanel data={d} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_344px] items-start gap-4 max-xl:grid-cols-1">
        <CohortsPanel cohorts={cohorts.data ?? []} loading={cohorts.isPending} data={d} />
        <UpcomingPanel timeZone={d.timeZone} />
      </div>
    </>
  )
}

/** O1.01 Needs attention: who, why, and what has been done. Loads on its own (O1.01x). */
function AttentionPanel({ timeZone }: { timeZone: string }) {
  const query = useAttention()
  const [signal, setSignal] = useState<'all' | Signal>('all')
  const rows = query.data?.participants ?? []
  const count = (s: Signal) => rows.filter((r) => r.flags.some((f) => signalOf[f.rule] === s)).length
  const visible = rows.filter((r) => signal === 'all' || r.flags.some((f) => signalOf[f.rule] === signal))
  return (
    <Panel className="gap-0">
      <div className="flex items-start justify-between gap-3 max-md:flex-col">
        <PanelHeader title="Needs attention" description="Who needs follow-up, why, and what has been done." />
        {rows.length > 0 && (
          <FilterChips
            label="Signal"
            value={signal}
            onChange={setSignal}
            options={[
              { value: 'all', label: 'All signals', count: rows.length },
              { value: 'attendance', label: 'Attendance', count: count('attendance') },
              { value: 'assignments', label: 'Assignments', count: count('assignments') },
              { value: 'activity', label: 'Activity', count: count('activity') },
            ]}
          />
        )}
      </div>
      {query.isPending ? (
        <div className="h-32" aria-busy="true" />
      ) : query.isError ? (
        <div className="py-3">
          <AlertBanner tone="error" title="Couldn’t load who needs attention">
            The rest of the overview is up to date.{' '}
            <button type="button" className="text-brand-text underline" onClick={() => void query.refetch()}>
              Try again
            </button>
          </AlertBanner>
        </div>
      ) : rows.length === 0 ? (
        <p className="py-4 text-body text-secondary">No one needs follow-up right now. People are flagged here when they match a follow-up rule.</p>
      ) : (
        <ul className="mt-2">
          {visible.slice(0, 3).map((r) => {
            const f = r.flags.find((x) => signal === 'all' || signalOf[x.rule] === signal) ?? r.flags[0]!
            const why = describeFlag(f, timeZone)
            return (
              <li key={r.enrolmentId} className="border-b border-default last:border-b-0">
                <Link
                  to={`/admin/participants/${r.participant.id}`}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)_auto] items-center gap-4 py-3 hover:bg-surface-hover max-lg:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar size={32} initials={initials(r.participant.name)} seed={r.participant.id} />
                    <Stacked primary={r.participant.name} secondary={r.cohort.name} />
                  </span>
                  <span className="min-w-0 max-lg:col-span-2 max-lg:row-start-2">
                    <Stacked primary={why.title} secondary={why.detail} />
                  </span>
                  <span className="min-w-0 max-lg:hidden">
                    <Stacked primary={followUpLine(r.lastIntervention, timeZone)} secondary={`Flagged ${daysAgo(f.raisedAt)}`} />
                  </span>
                  <span className="inline-flex items-center gap-1 text-caption-strong text-brand-text max-lg:col-start-2 max-lg:row-start-1">
                    Review
                    <ChevronRightIcon size={14} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {query.data && rows.length > 0 && (
        <p className="flex items-start gap-2 border-t border-default pt-3 text-caption text-secondary">
          <InfoCircleIcon size={14} className="mt-px shrink-0" />
          <span className="flex-1">
            Rules are provisional:{' '}
            {rulesSentence(query.data.rules)
              .replace(/^Flagged when /, '')
              .replace(/\.$/, '')}
            .
          </span>
          <Link to="/admin/needs-attention" className="inline-flex shrink-0 items-center gap-1 text-caption-strong text-brand-text hover:underline">
            View all {rows.length}
            <ChevronRightIcon size={14} />
          </Link>
        </p>
      )}
    </Panel>
  )
}

/** O1.01 Training activity: weekly check-ins as stacked bars; the label is present ÷ recorded. */
function ActivityPanel({ data: d }: { data: Overview }) {
  const weeks = d.activity
  const max = Math.max(1, ...weeks.map((w) => w.present + w.excused + w.absent))
  const any = weeks.some((w) => w.present + w.excused + w.absent > 0)
  return (
    <Panel className="gap-0">
      <PanelHeader title="Training activity" description="Weekly check-ins, all cohorts, last 8 weeks." />
      {!any ? (
        <div className="mt-3 rounded-md bg-canvas p-6 text-center">
          <p className="text-body-strong text-primary">No activity yet</p>
          <p className="text-caption text-secondary">Weekly attendance appears after the first register is saved.</p>
        </div>
      ) : (
        <>
          <ul className="mt-2 flex gap-3 text-caption text-secondary" aria-label="Legend">
            {(
              [
                ['bg-chart-present', 'Present'],
                ['bg-chart-excused', 'Excused'],
                ['bg-chart-absent', 'Absent'],
              ] as const
            ).map(([c, l]) => (
              <li key={l} className="inline-flex items-center gap-1.5">
                <span className={clsx('size-2 rounded-xs', c)} aria-hidden="true" />
                {l}
              </li>
            ))}
          </ul>
          <ol className="mt-3 grid h-[160px] grid-cols-8 items-end gap-2 border-b border-default" aria-label="Check-ins per week">
            {weeks.map((w) => {
              const total = w.present + w.excused + w.absent
              return (
                <li
                  key={w.weekOf}
                  className="flex h-full flex-col items-center justify-end gap-1"
                  aria-label={`Week of ${formatDate(w.weekOf)}: ${w.present} present, ${w.excused} excused, ${w.absent} absent${w.rate !== null ? `, ${w.rate}%` : ''}`}
                >
                  {w.rate !== null && <span className="text-chart-label text-secondary tabular-nums">{w.rate}%</span>}
                  <span className="flex w-full max-w-6 flex-col-reverse overflow-hidden rounded-t-xs" style={{ height: `${(total / max) * 120}px` }}>
                    <span className="bg-chart-present" style={{ height: `${total ? (w.present / total) * 100 : 0}%` }} />
                    <span className="bg-chart-excused" style={{ height: `${total ? (w.excused / total) * 100 : 0}%` }} />
                    <span className="bg-chart-absent" style={{ height: `${total ? (w.absent / total) * 100 : 0}%` }} />
                  </span>
                </li>
              )
            })}
          </ol>
          <div className="grid grid-cols-8 gap-2 pt-1 text-chart-label text-secondary">
            {weeks.map((w, i) => (
              <span key={w.weekOf} className="text-center whitespace-nowrap">
                {i % 2 === 0 ? formatDate(w.weekOf).replace(/^\w+ /, '') : ''}
              </span>
            ))}
          </div>
          <p className="pt-3 text-caption text-secondary">% = present ÷ recorded check-ins. Excused counts as not present.</p>
        </>
      )}
    </Panel>
  )
}

const cohortColumns: Column[] = [
  { label: 'Cohort' },
  { label: 'Status', width: 104 },
  { label: 'Participants', width: 96, align: 'right', hideBelow: 'lg' },
  { label: 'Delivery', width: 128, hideBelow: 'lg' },
  { label: 'Attendance', width: 92, align: 'right' },
  { label: 'Next session', width: 124, hideBelow: 'xl' },
]

const statusBadge: Record<string, { tone: 'success' | 'info' | 'neutral'; label: string }> = {
  active: { tone: 'success', label: 'Active' },
  upcoming: { tone: 'info', label: 'Upcoming' },
  draft: { tone: 'neutral', label: 'Draft' },
}

function CohortsPanel({ cohorts, loading, data: d }: { cohorts: CohortSummary[]; loading: boolean; data: Overview }) {
  const rows = cohorts.filter((c) => ['active', 'upcoming', 'draft'].includes(c.status))
  return (
    <Panel className="gap-0 max-md:py-2">
      <div className="flex items-start justify-between gap-3">
        <PanelHeader title="Cohorts" />
        <Link to="/admin/cohorts" className="inline-flex h-7 shrink-0 items-center gap-1 text-caption-strong text-brand-text hover:underline">
          All cohorts
          <ChevronRightIcon size={14} />
        </Link>
      </div>
      {loading ? (
        <div className="h-32" aria-busy="true" />
      ) : rows.length === 0 ? (
        <p className="py-4 text-body text-secondary">No active or upcoming cohorts. Completed ones are under Cohorts.</p>
      ) : (
        <div className="mt-2">
          <Table columns={cohortColumns}>
            {rows.map((c) => {
              const next = d.nextSessions[c.id]
              const badge = statusBadge[c.status] ?? statusBadge.draft!
              return (
                <Row key={c.id} to={`/admin/cohorts/${c.id}`}>
                  <Cell>
                    <Stacked primary={c.name} secondary={`${c.programme.name} · ${plural(c.courseNames.length, 'course')}`} />
                  </Cell>
                  <Cell>
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                  </Cell>
                  <Cell align="right" hideBelow="lg" className="tabular-nums">
                    {c.participants}
                  </Cell>
                  <Cell hideBelow="lg">
                    {c.status === 'upcoming' ? (
                      <span className="text-caption text-secondary">Starts {formatDate(c.startsOn)}</span>
                    ) : (
                      <span className="flex flex-col gap-1">
                        <span className="h-1.5 w-full rounded-full bg-chart-track">
                          <span
                            className="block h-full rounded-full bg-brand"
                            style={{ width: `${c.plannedSessions ? Math.min(100, Math.round((c.heldSessions / c.plannedSessions) * 100)) : 0}%` }}
                          />
                        </span>
                        <span className="text-caption text-secondary tabular-nums">
                          {c.plannedSessions ? `${c.heldSessions} of ${c.plannedSessions} sessions` : `${plural(c.heldSessions, 'session')} held`}
                        </span>
                      </span>
                    )}
                  </Cell>
                  <Cell align="right" className="tabular-nums">
                    {c.attendanceAll === null ? <span className="text-muted">—</span> : `${c.attendanceAll}%`}
                  </Cell>
                  <Cell hideBelow="xl">
                    {next ? (
                      <Stacked
                        primary={`${relativeDay(next.startsAt, d.timeZone)}, ${formatTime(next.startsAt, d.timeZone)}`}
                        secondary={whereLabel({
                          mode: next.mode as 'online' | 'in_person',
                          location: next.location,
                          joinUrl: next.joinUrl,
                          zoomMeetingId: null,
                        })}
                      />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </Cell>
                </Row>
              )
            })}
          </Table>
        </div>
      )}
    </Panel>
  )
}

function UpcomingPanel({ timeZone }: { timeZone: string }) {
  const today = todayIn(timeZone)
  const query = useSessions({ from: today, to: addDays(today, 13) })
  const upcoming = (query.data?.sessions ?? []).filter((s) => s.status === 'scheduled' || s.status === 'in_progress').slice(0, 4)
  const tomorrow = addDays(today, 1)
  return (
    <Panel className="gap-0">
      <div className="flex items-start justify-between gap-3">
        <PanelHeader title="Upcoming sessions" />
        <Link to="/admin/courses" className="inline-flex h-7 shrink-0 items-center gap-1 text-caption-strong text-brand-text hover:underline">
          All sessions
          <ChevronRightIcon size={14} />
        </Link>
      </div>
      {query.isPending ? (
        <div className="h-24" aria-busy="true" />
      ) : upcoming.length === 0 ? (
        <div className="mt-3 rounded-md bg-canvas p-6 text-center">
          <p className="text-body-strong text-primary">No sessions in the next two weeks</p>
          <p className="text-caption text-secondary">Schedule sessions from Courses & sessions.</p>
        </div>
      ) : (
        <ul>
          {upcoming.map((s, i) => {
            const dayOf = localDate(s.startsAt, timeZone)
            const showDay = i === 0 || localDate(upcoming[i - 1]!.startsAt, timeZone) !== dayOf
            return (
              <li key={s.id}>
                {showDay && (
                  <p className="pt-3 text-caption-strong text-secondary">
                    {dayOf === today ? 'Today · ' : dayOf === tomorrow ? 'Tomorrow · ' : ''}
                    {formatDay(s.startsAt, timeZone)}
                  </p>
                )}
                <ul>
                  <SessionRow session={s} timeZone={timeZone} />
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

/** O1.01e Welcome to Synqop: set-up checklist until the first cohort exists. */
function SetupView({ data: d, header }: { data: Overview; header: ReactNode }) {
  const navigate = useNavigate()
  const steps = [
    { done: true, title: 'Create organisation', detail: `${d.organisation} · ${plural(d.setup.admins, 'admin')}` },
    { done: d.setup.programme, title: 'Create a programme', detail: 'Programmes hold your cohorts, courses and outcomes.', to: '/admin/programmes/new' },
    { done: d.setup.cohort, title: 'Create a cohort', detail: 'Name, dates and programme. Needed before participants and sessions.', to: '/admin/cohorts/new' },
    { done: d.setup.trainers, title: 'Add trainers', detail: 'Invite trainers and assign them to the cohort.', to: '/admin/trainers' },
    { done: d.setup.participants, title: 'Import participants', detail: 'Upload a CSV or invite people one by one.', to: '/admin/participants/import' },
    { done: d.setup.courses, title: 'Add courses', detail: 'Reuse the programme’s courses or create new ones.', to: '/admin/courses/library' },
    { done: d.setup.session, title: 'Schedule the first session', detail: 'Sessions drive attendance and Needs attention.', to: '/admin/courses/sessions/new' },
  ]
  const done = steps.filter((s) => s.done).length
  const current = steps.findIndex((s) => !s.done)
  return (
    <>
      {header}
      <div className="grid grid-cols-[minmax(0,1fr)_344px] items-start gap-4 max-xl:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel className="gap-0">
            <div className="flex items-start justify-between gap-4">
              <PanelHeader title="Set up your first cohort" description={`${done} of ${steps.length} steps done. Each step can be done later.`} />
              <span
                className="mt-1 h-1.5 w-[120px] shrink-0 rounded-full bg-chart-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={steps.length}
                aria-valuenow={done}
                aria-label="Set-up progress"
              >
                <span className="block h-full rounded-full bg-brand" style={{ width: `${(done / steps.length) * 100}%` }} />
              </span>
            </div>
            <ol className="mt-2">
              {steps.map((s, i) => (
                <li key={s.title} className="flex items-center gap-3 border-b border-default py-3 last:border-b-0">
                  <span
                    className={clsx(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-caption-strong',
                      s.done ? 'bg-success-bg text-success-fg' : i === current ? 'bg-brand text-on-brand' : 'border border-strong text-secondary',
                    )}
                  >
                    {s.done ? <CheckIcon size={14} /> : i + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={clsx('text-body-strong', s.done ? 'text-secondary line-through' : 'text-primary')}>{s.title}</span>
                    <span className="text-caption text-secondary">{s.detail}</span>
                  </span>
                  {!s.done &&
                    s.to &&
                    (i === current ? (
                      <Button icon={<PlusIcon size={16} />} onClick={() => navigate(s.to!)}>
                        {s.title.replace(/^Create a /, 'New ').replace(/^Add /, 'Add ')}
                      </Button>
                    ) : (
                      <Link to={s.to} className="inline-flex items-center gap-1 text-caption-strong text-brand-text hover:underline">
                        Start
                        <ChevronRightIcon size={14} />
                      </Link>
                    ))}
                </li>
              ))}
            </ol>
          </Panel>
          <Panel className="py-10">
            <EmptyState
              icon={<CalendarIcon size={24} />}
              title="No cohorts yet"
              body="Create your first cohort to start scheduling sessions and tracking attendance."
              actions={
                <>
                  <Button icon={<PlusIcon size={16} />} onClick={() => navigate('/admin/cohorts/new')}>
                    New cohort
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/admin/participants/import')}>
                    Import participants
                  </Button>
                </>
              }
            />
          </Panel>
        </div>
        <div className="flex flex-col gap-4">
          <ActivityPanel data={d} />
          <Panel className="gap-0">
            <PanelHeader title="Upcoming sessions" />
            <div className="mt-3 rounded-md bg-canvas p-6 text-center">
              <p className="text-body-strong text-primary">No sessions scheduled</p>
              <p className="text-caption text-secondary">Schedule sessions once a cohort and its courses exist.</p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
