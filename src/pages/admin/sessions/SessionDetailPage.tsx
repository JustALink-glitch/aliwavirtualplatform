import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Choice'
import { Dialog } from '@/components/ui/Dialog'
import { DetailList } from '@/components/ui/FormLayout'
import { Badge, PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/api'
import { formatDay, formatDayWithYear, formatTime, formatTimeRange, plural, weekdayList } from '@/lib/format'
import { isPast, useCancelSession, useSession, whereLabel, type Session } from './data'
import { SessionStatusBadge } from './SessionRow'

/** /admin/courses/sessions/:id — C1.03 Session detail, C1.03b held, cancelled. */
export function SessionDetailPage() {
  const { id = '' } = useParams()
  const query = useSession(id)
  if (query.isPending) return <div aria-busy="true" aria-label="Loading session" className="h-40" />
  if (query.isError) {
    const missing = query.error instanceof ApiError && query.error.status === 404
    return (
      <>
        <PageHeader title={missing ? 'Session not found' : 'Couldn’t load this session'} breadcrumb={[{ label: 'Courses & sessions', to: '/admin/courses' }]} />
        <Panel>
          <StatePanel kind={missing ? 'no-results' : 'error'} title={missing ? 'This session doesn’t exist' : 'Something went wrong'} />
        </Panel>
      </>
    )
  }
  return <SessionView session={query.data.session} />
}

function SessionView({ session: s }: { session: Session }) {
  const { state } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const [cancelling, setCancelling] = useState(false)
  const [copied, setCopied] = useState(false)
  const notice = (location.state as { notice?: string } | null)?.notice

  const day = formatDay(s.startsAt, timeZone)
  const when = `${formatDayWithYear(s.startsAt, timeZone)}, ${formatTimeRange(s.startsAt, s.endsAt, timeZone)}${s.series ? ` · repeats ${weekdayList(s.series.weekdays)}` : ''}`
  const scheduled = s.status === 'scheduled'
  const past = s.status === 'held' || s.status === 'in_progress'
  const reportOverdue = s.status === 'held' && !s.report.submittedAt && isPast(s.report.dueAt)

  async function copy() {
    if (!s.joinUrl) return
    await navigator.clipboard.writeText(s.joinUrl).catch(() => undefined)
    setCopied(true)
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Courses & sessions', to: '/admin/courses' }, { label: `${s.title} · ${day}` }]}
        title={s.title}
        badge={<SessionStatusBadge status={s.status} />}
        description={[
          s.cohort.name,
          s.number && `Session ${s.number} of ${s.total}`,
          `${day}, ${formatTimeRange(s.startsAt, s.endsAt, timeZone)}`,
          s.trainer?.name,
        ]
          .filter(Boolean)
          .join(' · ')}
        actions={
          scheduled && (
            <>
              <Button variant="secondary" onClick={() => setCancelling(true)}>
                Cancel session
              </Button>
              <Button onClick={() => navigate('edit')}>Edit session</Button>
            </>
          )
        }
      />
      {notice && <AlertBanner tone="success" title={notice} />}
      {s.cancelled && (
        <AlertBanner title={`Cancelled${s.cancelled.by ? ` by ${s.cancelled.by}` : ''} on ${formatDay(s.cancelled.at, timeZone)}`}>
          {s.cancelled.reason ? `Reason: ${s.cancelled.reason}. ` : ''}Cancelled sessions don’t count towards attendance or delivery, and need no report.
        </AlertBanner>
      )}

      <div className="flex items-start gap-4 max-lg:flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-4 max-lg:w-full">
          <Panel aria-labelledby="details-title">
            <PanelHeader id="details-title" title="Details" />
            <DetailList
              items={[
                { label: 'When', value: when },
                {
                  label: 'Where',
                  value: s.joinUrl ? (
                    <>
                      {whereLabel(s)} ·{' '}
                      <a href={s.joinUrl} target="_blank" rel="noreferrer" className="font-normal break-all text-brand-text underline">
                        {s.joinUrl}
                      </a>
                    </>
                  ) : s.mode === 'online' ? (
                    <>
                      Online · <span className="font-normal text-muted">no meeting link yet</span>
                    </>
                  ) : (
                    whereLabel(s)
                  ),
                },
                { label: 'Course', value: s.course.name },
                {
                  label: 'Cohort',
                  value: (
                    <>
                      <Link to={`/admin/cohorts/${s.cohort.id}`} className="hover:underline">
                        {s.cohort.name}
                      </Link>
                      <span className="font-normal text-secondary"> · {plural(s.expected, 'participant')} expected</span>
                    </>
                  ),
                },
                {
                  label: 'Trainer',
                  value: s.trainer ? (
                    <Link to={`/admin/trainers/${s.trainer.id}`} className="hover:underline">
                      {s.trainer.name}
                      {s.trainer.isLead ? ' (lead)' : ''}
                    </Link>
                  ) : (
                    <span className="font-normal text-muted">Not assigned</span>
                  ),
                },
              ]}
            />
          </Panel>
        </div>

        <div className="flex w-[356px] shrink-0 flex-col gap-4 max-lg:w-full">
          {!s.cancelled && (
            <>
              <Panel aria-labelledby="attendance-title">
                <PanelHeader
                  id="attendance-title"
                  title="Attendance"
                  description={
                    scheduled
                      ? 'Marked from the register once the session starts. You or the trainer can record it.'
                      : s.attendance.recorded
                        ? `${s.attendance.recorded} of ${s.expected} recorded`
                        : 'Not recorded yet.'
                  }
                />
                {past && s.attendance.recorded > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-metric-large text-primary">{Math.round((s.attendance.present / s.attendance.recorded) * 100)}%</span>
                    <span className="text-caption text-secondary">
                      {s.attendance.present} present ÷ {s.attendance.recorded} recorded
                    </span>
                  </div>
                )}
                {past && s.attendance.recorded === 0 && <Badge tone="warning">Not recorded</Badge>}
                {past && (
                  <Button variant={s.attendance.recorded ? 'secondary' : 'primary'} fullWidth onClick={() => navigate('attendance')}>
                    {s.attendance.recorded ? 'Open register' : 'Take attendance'}
                  </Button>
                )}
              </Panel>
              <Panel aria-labelledby="report-title">
                <PanelHeader
                  id="report-title"
                  title="Session report"
                  description={
                    s.report.submittedAt
                      ? `Submitted ${formatDay(s.report.submittedAt, timeZone)}.`
                      : `${s.trainer ? s.trainer.name.split(' ')[0] : 'The trainer'} submits it after the session. Due ${formatDay(s.report.dueAt, timeZone)}, ${formatTime(s.report.dueAt, timeZone)}.`
                  }
                />
                {reportOverdue && <Badge tone="error">Overdue</Badge>}
                {s.report.submittedAt && <Badge tone="success">Submitted</Badge>}
              </Panel>
            </>
          )}
          {s.joinUrl && !s.cancelled && (
            <Button variant="secondary" fullWidth onClick={copy}>
              {copied ? 'Link copied' : 'Copy meeting link'}
            </Button>
          )}
        </div>
      </div>

      {scheduled && <CancelSessionDialog open={cancelling} onClose={() => setCancelling(false)} session={s} timeZone={timeZone} />}
    </>
  )
}

/** C1.05 Cancel session. */
function CancelSessionDialog({ open, onClose, session: s, timeZone }: { open: boolean; onClose: () => void; session: Session; timeZone: string | undefined }) {
  const cancel = useCancelSession(s.id)
  const navigate = useNavigate()
  const [reason, setReason] = useState('')
  const [notify, setNotify] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [failed, setFailed] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!reason.trim()) return setError('Add a reason. Participants see it in the email.')
    setFailed(null)
    try {
      const result = await cancel.mutateAsync({ reason, notify })
      onClose()
      navigate('.', { replace: true, state: { notice: notify ? `Session cancelled. ${plural(result.emailed, 'email')} sent.` : 'Session cancelled.' } })
    } catch (err) {
      setFailed(err instanceof ApiError && err.status < 500 ? err.message : 'It wasn’t cancelled. Try again.')
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => !cancel.isPending && onClose()}
      width={440}
      title="Cancel this session?"
      description={`${s.title} · ${formatDay(s.startsAt, timeZone)}, ${formatTimeRange(s.startsAt, s.endsAt, timeZone)} · ${s.cohort.name}`}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={cancel.isPending}>
            Keep session
          </Button>
          <Button type="submit" form="cancel-session" variant="destructive" disabled={cancel.isPending}>
            {cancel.isPending ? 'Cancelling…' : 'Cancel session'}
          </Button>
        </>
      }
    >
      <form id="cancel-session" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {failed && (
          <AlertBanner tone="error" title="Couldn’t cancel">
            {failed}
          </AlertBanner>
        )}
        <TextField
          label="Reason"
          autoFocus
          value={reason}
          onChange={(e) => {
            setReason(e.target.value)
            setError(null)
          }}
          error={error}
          helper="Shown to participants in the email."
        />
        <Checkbox label="Email participants and the trainer" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
        <AlertBanner title="Cancelled sessions don’t count">They’re left out of attendance and delivery progress, and need no session report.</AlertBanner>
      </form>
    </Dialog>
  )
}
