import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { DetailList } from '@/components/ui/FormLayout'
import { TextAreaField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/api'
import { CalendarIcon, ChevronRightIcon } from '@/components/ui/icons'
import { EmptyState, PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { formatDay, formatTime, formatTimeRange, plural, relativeDay } from '@/lib/format'
import { duration, sessionWhere, useMySession, useMySessions, useRateSession, type MySession } from './data'
import { ResourceRow, SessionBadge } from './SessionBits'

const BASE = '/participant/sessions'

function when(s: MySession, timeZone?: string) {
  const day = relativeDay(s.startsAt, timeZone)
  return `${day === 'Today' || day === 'Yesterday' ? day : formatDay(s.startsAt, timeZone)} · ${formatTime(s.startsAt, timeZone)}`
}

function pastLine(s: MySession) {
  if (s.status === 'cancelled') return s.cancellationReason ? `Cancelled — ${s.cancellationReason}` : 'Cancelled by the trainer'
  const a = s.attendance
  return [sessionWhere(s), a?.minutesInMeeting ? `${duration(a.minutesInMeeting)} in the meeting` : null, a?.note].filter(Boolean).join(' · ')
}

function SessionLink({ s, timeZone, past }: { s: MySession; timeZone: string; past?: boolean }) {
  return (
    <li className="border-b border-default last:border-b-0">
      <Link to={`${BASE}/${s.id}`} className="flex items-center gap-3 py-2.5 hover:bg-surface-hover">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-strong text-primary">
            {past ? formatDay(s.startsAt, timeZone) : when(s, timeZone)} · {s.course.name}
          </span>
          <span className="truncate text-caption text-secondary">
            {past ? pastLine(s) : [s.number ? `Session ${s.number}` : null, sessionWhere(s)].filter(Boolean).join(' · ')}
          </span>
        </span>
        {(past || s.status !== 'scheduled') && <SessionBadge session={s} />}
        <ChevronRightIcon size={16} className="shrink-0 text-icon-muted" />
      </Link>
    </li>
  )
}

/** /participant/sessions — P4.01 Sessions. */
export function MySessionsPage() {
  const query = useMySessions()
  if (query.isPending) return <div aria-busy="true" aria-label="Loading sessions" className="h-40" />
  if (query.isError) {
    return (
      <>
        <PageHeader title="Sessions" />
        <Panel>
          <StatePanel
            kind="error"
            title="Couldn’t load your sessions"
            description="Check your connection and try again."
            action={{ label: 'Try again', onClick: () => void query.refetch() }}
          />
        </Panel>
      </>
    )
  }
  const { sessions, attendance: a, timeZone } = query.data
  const upcoming = sessions.filter((s) => s.status === 'scheduled' || s.status === 'in_progress')
  const past = sessions
    .filter((s) => s.status === 'held' || (s.status === 'cancelled' && Date.parse(s.startsAt) <= Date.parse(upcoming[0]?.startsAt ?? s.startsAt)))
    .reverse()
  const cancelledAhead = sessions.filter((s) => s.status === 'cancelled' && !past.includes(s))

  return (
    <>
      <PageHeader
        title="Sessions"
        description={
          a.recorded
            ? `Your attendance: ${a.present} of ${plural(a.recorded, 'session')} · ${a.rate}%. Excused counts as not attended.`
            : 'Your attendance shows here after your first session.'
        }
      />
      {sessions.length === 0 ? (
        <Panel className="py-12">
          <EmptyState
            icon={<CalendarIcon size={24} />}
            title="No sessions yet"
            body="When your trainers schedule sessions for your courses, they appear here."
          />
        </Panel>
      ) : (
        <div className="grid grid-cols-2 items-start gap-4 max-lg:grid-cols-1">
          <Panel aria-labelledby="upcoming-title" className="gap-1">
            <PanelHeader id="upcoming-title" title="Coming up" />
            {upcoming.length === 0 && cancelledAhead.length === 0 ? (
              <p className="py-3 text-body text-secondary">Nothing else scheduled.</p>
            ) : (
              <ul>
                {[...upcoming, ...cancelledAhead]
                  .sort((x, y) => Date.parse(x.startsAt) - Date.parse(y.startsAt))
                  .map((s) => (
                    <SessionLink key={s.id} s={s} timeZone={timeZone} />
                  ))}
              </ul>
            )}
          </Panel>
          <Panel aria-labelledby="past-title" className="gap-1">
            <PanelHeader id="past-title" title="Past sessions" description="Your attendance as recorded." />
            {past.length === 0 ? (
              <p className="py-3 text-body text-secondary">None yet.</p>
            ) : (
              <ul>
                {past.map((s) => (
                  <SessionLink key={s.id} s={s} timeZone={timeZone} past />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </>
  )
}

/** /participant/sessions/:id — P4.02 live now, P4.02b in person, P4.02c past. */
export function MySessionPage() {
  const { id = '' } = useParams()
  const query = useMySession(id)
  if (query.isPending) return <div aria-busy="true" aria-label="Loading session" className="h-40" />
  if (query.isError) {
    const notFound = (query.error as { status?: number }).status === 404
    return (
      <>
        <PageHeader title={notFound ? 'Session not found' : 'Couldn’t load the session'} breadcrumb={[{ label: 'Sessions', to: BASE }]} />
        <Panel>
          <StatePanel
            kind={notFound ? 'no-results' : 'error'}
            title={notFound ? 'It isn’t one of your sessions.' : 'Something went wrong'}
            description="Go back to your sessions."
          />
        </Panel>
      </>
    )
  }
  const { session: s, resources, timeZone, feedback } = query.data
  const day = relativeDay(s.startsAt, timeZone)
  const dayLabel = day === 'Today' || day === 'Yesterday' ? day : formatDay(s.startsAt, timeZone)
  const statusText = { scheduled: 'Scheduled', in_progress: 'In progress', held: 'Held', cancelled: 'Cancelled' }[s.status]
  const a = s.attendance

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Sessions', to: BASE }, { label: `${s.course.name} · ${dayLabel}` }]}
        title={s.course.name}
        badge={
          <span
            className={
              s.status === 'in_progress'
                ? 'inline-flex h-[22px] items-center gap-1.5 rounded-full bg-info-bg px-2 text-caption-strong text-info-fg'
                : 'inline-flex h-[22px] items-center gap-1.5 rounded-full bg-neutral-bg px-2 text-caption-strong text-neutral-fg'
            }
          >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {statusText}
          </span>
        }
        description={[
          s.number ? `Session ${s.number} of ${s.total}` : null,
          `${dayLabel}, ${formatTimeRange(s.startsAt, s.endsAt, timeZone)}`,
          sessionWhere(s),
          s.trainer,
        ]
          .filter(Boolean)
          .join(' · ')}
        actions={
          s.joinUrl ? (
            <a
              href={s.joinUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-md bg-brand px-4 text-label-button text-on-brand hover:bg-brand-hover"
            >
              {s.joinUrl.includes('zoom.us') ? 'Join Zoom' : 'Join session'}
            </a>
          ) : undefined
        }
      />
      {s.status === 'cancelled' && (
        <AlertBanner tone="warning" title="This session was cancelled">
          {s.cancellationReason ?? 'Your trainer will let you know about any catch-up.'}
        </AlertBanner>
      )}
      {s.joinUrl && (
        <AlertBanner title="Join with the email you use on Synqop">
          Your attendance counts automatically when Zoom is connected. Please don’t share this link.
        </AlertBanner>
      )}
      {s.mode === 'online' && !s.joinUrl && s.status === 'scheduled' && (
        <AlertBanner title="The joining link appears here the day before">Check back on {formatDay(s.startsAt, timeZone)}.</AlertBanner>
      )}

      <div className="flex items-start gap-4 max-lg:flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-4 max-lg:w-full">
          {s.mode === 'in_person' && s.status !== 'held' && s.status !== 'cancelled' && (
            <Panel aria-labelledby="where-title" className="gap-1">
              <PanelHeader id="where-title" title="Where to go" />
              <p className="text-body text-primary">{s.location ?? 'In person'}</p>
              <p className="text-caption text-secondary">Your trainer marks attendance in the room.</p>
            </Panel>
          )}
          {s.status === 'held' && (
            <Panel aria-labelledby="attendance-title" className="gap-1">
              <PanelHeader
                id="attendance-title"
                title="Your attendance"
                description={
                  a
                    ? a.source === 'zoom'
                      ? 'Recorded from Zoom.'
                      : a.source === 'edited'
                        ? 'Updated by your trainer.'
                        : 'Marked by your trainer.'
                    : 'Not recorded yet.'
                }
              />
              {a ? (
                <DetailList
                  items={[
                    { label: 'Status', value: { present: 'Present', absent: 'Absent', excused: 'Excused' }[a.status] },
                    ...(a.joinedAt ? [{ label: 'Joined', value: formatTime(a.joinedAt, timeZone) }] : []),
                    ...(a.minutesInMeeting !== null ? [{ label: 'In the meeting', value: duration(a.minutesInMeeting) }] : []),
                    ...(a.note ? [{ label: 'Note', value: a.note }] : []),
                  ]}
                />
              ) : null}
              <p className="text-caption text-secondary">Looks wrong? Tell your trainer — they can correct it.</p>
            </Panel>
          )}
          {feedback.canRate && <RatePanel sessionId={s.id} mine={feedback.mine} />}
          {resources.length > 0 && (
            <Panel aria-labelledby="resources-title" className="gap-1">
              <PanelHeader id="resources-title" title="Resources for this session" />
              <div>
                {resources.map((r) => (
                  <ResourceRow key={r.id} resource={r} />
                ))}
              </div>
            </Panel>
          )}
        </div>
        <aside className="w-[356px] shrink-0 max-lg:w-full">
          <Panel aria-labelledby="session-details">
            <PanelHeader id="session-details" title="Details" />
            <DetailList
              items={[
                { label: 'When', value: `${dayLabel}, ${formatTimeRange(s.startsAt, s.endsAt, timeZone)}` },
                { label: 'Where', value: s.mode === 'online' ? sessionWhere(s).replace(', ', ' · ') : (s.location ?? 'In person') },
                ...(s.trainer
                  ? [
                      {
                        label: 'Trainer',
                        value: s.trainerBio ? (
                          <span className="flex flex-col gap-0.5">
                            <span>{s.trainer}</span>
                            <span className="text-caption text-secondary">{s.trainerBio}</span>
                          </span>
                        ) : (
                          s.trainer
                        ),
                      },
                    ]
                  : []),
                {
                  label: 'Course',
                  value: (
                    <Link to={`/participant/courses/${s.course.cohortCourseId}`} className="hover:underline">
                      {s.course.name}
                    </Link>
                  ),
                },
              ]}
            />
          </Panel>
        </aside>
      </div>
    </>
  )
}

/** P4.03 "How was this session?" — optional, anonymous, can be changed. */
function RatePanel({ sessionId, mine }: { sessionId: string; mine: { rating: number; comment: string | null } | null }) {
  const [open, setOpen] = useState(false)
  return (
    <Panel aria-labelledby="rate-title" className="gap-3">
      <PanelHeader
        id="rate-title"
        title="How was this session?"
        description={mine ? `You rated it ${mine.rating} out of 5. Thanks — it helps your trainer.` : 'Optional and anonymous. Takes 30 seconds.'}
      />
      <div>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          {mine ? 'Change your rating' : 'Rate this session'}
        </Button>
      </div>
      {open && <RateDialog sessionId={sessionId} mine={mine} onClose={() => setOpen(false)} />}
    </Panel>
  )
}

function RateDialog({ sessionId, mine, onClose }: { sessionId: string; mine: { rating: number; comment: string | null } | null; onClose: () => void }) {
  const rate = useRateSession(sessionId)
  const [rating, setRating] = useState<number | null>(mine?.rating ?? null)
  const [comment, setComment] = useState(mine?.comment ?? '')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!rating) return setError('Choose a rating from 1 to 5.')
    try {
      await rate.mutateAsync({ rating, comment })
      onClose()
    } catch (err) {
      setError(err instanceof ApiError && err.status < 500 ? err.message : 'Your feedback wasn’t sent. Try again.')
    }
  }

  return (
    <Dialog
      open
      onClose={() => !rate.isPending && onClose()}
      width={520}
      title="How useful was this session?"
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={rate.isPending}>
            Skip
          </Button>
          <Button type="submit" form="rate-session" disabled={rate.isPending}>
            {rate.isPending ? 'Sending…' : 'Send feedback'}
          </Button>
        </>
      }
    >
      <form id="rate-session" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div role="radiogroup" aria-label="Rating, 1 not useful to 5 very useful" className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                onClick={() => {
                  setRating(n)
                  setError(null)
                }}
                className={
                  rating === n
                    ? 'h-9 rounded-full border border-brand bg-brand-subtle text-body-strong text-brand-text focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none max-md:h-11'
                    : 'h-9 rounded-full border border-default bg-surface text-body text-secondary hover:bg-surface-hover focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none max-md:h-11'
                }
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-caption text-secondary">
            <span>Not useful</span>
            <span>Very useful</span>
          </div>
          {error && <p className="text-caption text-error-fg">{error}</p>}
        </div>
        <TextAreaField label="Anything to add?" optional value={comment} maxLength={1000} onChange={(e) => setComment(e.target.value)} />
        <p className="text-caption text-secondary">Anonymous — your trainer sees the results, not your name.</p>
      </form>
    </Dialog>
  )
}
