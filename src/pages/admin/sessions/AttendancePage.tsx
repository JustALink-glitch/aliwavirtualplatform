import clsx from 'clsx'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { RadioGroup } from '@/components/ui/Choice'
import { Dialog } from '@/components/ui/Dialog'
import { ChartIcon, CheckCircleIcon, DownloadIcon, InfoTriangleIcon, UserGroupIcon } from '@/components/ui/icons'
import { Metrics } from '@/components/ui/Metrics'
import { Badge, FilterChips, PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { TextAreaField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/api'
import { formatDay, formatTime, formatTimeRange, plural } from '@/lib/format'
import { initials } from '@/lib/people'
import { downloadCsv, markLabel, sourceLabel, useEditMark, useRegister, useSaveRegister, type Mark, type Register, type RegisterRow } from './attendanceData'
import { useSession, whereLabel, type Session } from './data'

type Filter = 'all' | Mark | 'none'
const tone: Record<Mark, 'success' | 'error' | 'warning'> = { present: 'success', absent: 'error', excused: 'warning' }

export function MarkBadge({ status }: { status: Mark | null }) {
  return status ? <Badge tone={tone[status]}>{markLabel[status]}</Badge> : <Badge tone="neutral">Not recorded</Badge>
}

/** /admin/courses/sessions/:id/attendance — C2.01 Session attendance with C2.03 marking and C2.02 edits. */
export function AttendancePage() {
  const { id = '' } = useParams()
  const session = useSession(id)
  const register = useRegister(id)
  if (session.isPending || register.isPending) return <div aria-busy="true" aria-label="Loading attendance" className="h-40" />
  if (session.isError || register.isError) {
    return (
      <>
        <PageHeader title="Couldn’t load attendance" breadcrumb={[{ label: 'Courses & sessions', to: '/admin/courses' }]} />
        <Panel>
          <StatePanel kind="error" title="Something went wrong" description="Check your connection and try again." />
        </Panel>
      </>
    )
  }
  return <AttendanceView session={session.data.session} data={register.data} />
}

function AttendanceView({ session: s, data }: { session: Session; data: Register }) {
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const save = useSaveRegister(s.id)
  const [pending, setPending] = useState<Record<string, Mark>>({})
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<RegisterRow | null>(null)
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; title: string; body?: string } | null>(null)

  const open = data.status === 'in_progress' || data.status === 'held'
  const unmarked = data.register.filter((r) => !r.status)
  const recorded = data.counts.present + data.counts.absent + data.counts.excused
  const pendingCount = Object.keys(pending).length
  const effective = (r: RegisterRow): Mark | null => r.status ?? pending[r.memberId] ?? null
  const visible = data.register.filter((r) => filter === 'all' || (filter === 'none' ? !effective(r) : effective(r) === filter))
  const showZoomColumns = data.register.some((r) => r.joinedAt || r.minutesInMeeting !== null)
  const day = formatDay(s.startsAt, timeZone)

  async function saveRegister() {
    setNotice(null)
    try {
      const result = await save.mutateAsync(Object.entries(pending).map(([memberId, status]) => ({ memberId, status })))
      setPending({})
      setNotice({ tone: 'success', title: `${plural(result.marked, 'person', 'people')} marked`, body: unmarked.length - result.marked > 0 ? `${plural(unmarked.length - result.marked, 'person is', 'people are')} still not recorded.` : undefined })
    } catch (error) {
      setNotice({ tone: 'error', title: 'The register wasn’t saved', body: error instanceof ApiError && error.status < 500 ? error.message : 'Check your connection and try again.' })
    }
  }

  function exportCsv() {
    downloadCsv(`attendance-${s.title}-${day}.csv`.replace(/\s+/g, '-').toLowerCase(), [
      ['Participant', 'Email', 'Attendance', 'Source', 'Joined', 'Minutes in meeting', 'Note'],
      ...data.register.map((r) => [
        r.name,
        r.email,
        r.status ? markLabel[r.status] : 'Not recorded',
        r.source ? sourceLabel[r.source] : '',
        r.joinedAt ? formatTime(r.joinedAt, timeZone) : '',
        r.minutesInMeeting?.toString() ?? '',
        r.note ?? '',
      ]),
    ])
  }

  const summary = data.firstSaved
    ? `Marked by ${data.firstSaved.by ?? 'an admin'} · ${formatDay(data.firstSaved.at, timeZone)}, ${formatTime(data.firstSaved.at, timeZone)}${data.changes.count ? ` · ${plural(data.changes.count, 'change')}${data.changes.lastBy ? ` by ${data.changes.lastBy}` : ''}` : ''}`
    : `${recorded} of ${data.register.length} marked`

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: 'Courses & sessions', to: '/admin/courses' },
          { label: `${s.title} · ${day}`, to: `/admin/courses/sessions/${s.id}` },
          { label: 'Attendance' },
        ]}
        title={s.title}
        badge={recorded === 0 ? <Badge tone="warning">Not recorded</Badge> : unmarked.length ? <Badge tone="info">Partly recorded</Badge> : <Badge tone="success">Attendance recorded</Badge>}
        description={[s.cohort.name, `${day}, ${formatTimeRange(s.startsAt, s.endsAt, timeZone)}`, whereLabel(s), s.trainer?.name].filter(Boolean).join(' · ')}
        actions={
          <>
            <Link
              to="history"
              className="inline-flex h-9 items-center justify-center rounded-md border border-strong bg-surface px-4 text-label-button text-primary hover:bg-surface-hover"
            >
              History
            </Link>
            <Button variant="secondary" icon={<DownloadIcon size={16} />} onClick={exportCsv}>
              Export CSV
            </Button>
          </>
        }
      />

      {!open && (
        <AlertBanner title={data.status === 'cancelled' ? 'This session was cancelled' : 'Attendance opens when the session starts'}>
          {data.status === 'cancelled' ? 'Cancelled sessions have no attendance.' : `You can mark the register from ${day}, ${formatTime(s.startsAt, timeZone)}.`}
        </AlertBanner>
      )}
      {notice && (
        <AlertBanner tone={notice.tone} title={notice.title}>
          {notice.body}
        </AlertBanner>
      )}

      <Metrics
        items={[
          { label: 'Present', icon: <CheckCircleIcon size={18} />, value: data.counts.present, context: `of ${plural(data.expected, 'person', 'people')} expected` },
          { label: 'Excused', icon: <InfoTriangleIcon size={18} />, value: data.counts.excused, context: 'Counts as not present' },
          { label: 'Absent', icon: <UserGroupIcon size={18} />, value: data.counts.absent, context: data.counts.notRecorded ? `${data.counts.notRecorded} not recorded yet` : 'No check-in or excuse' },
          {
            label: 'Attendance',
            icon: <ChartIcon size={18} />,
            value: data.rate === null ? '—' : `${data.rate}%`,
            context: data.rate === null ? 'Nothing recorded yet' : `${data.counts.present} ÷ ${recorded} · present ÷ recorded`,
          },
        ]}
      />

      {open && unmarked.length > 0 && (
        <AlertBanner title={s.mode === 'in_person' ? 'In-person session — attendance is marked by hand' : 'Mark who attended'}>
          {s.mode === 'in_person'
            ? 'Trainers usually do this during the session. You can mark or correct it here too.'
            : 'Zoom isn’t connected yet, so mark attendance by hand. Once it is, attendance imports when each meeting ends.'}
        </AlertBanner>
      )}

      <Panel aria-labelledby="register-title" className="gap-3">
        <div className="flex items-start gap-3 max-md:flex-col">
          <div className="flex-1">
            <PanelHeader id="register-title" title="Register" description={summary} />
          </div>
          {open && unmarked.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setPending((prev) => ({ ...Object.fromEntries(unmarked.map((r) => [r.memberId, 'present' as Mark])), ...prev }))}
            >
              Mark everyone present
            </Button>
          )}
        </div>
        <FilterChips
          label="Attendance"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All', count: data.register.length },
            { value: 'present', label: 'Present', count: data.register.filter((r) => effective(r) === 'present').length },
            { value: 'excused', label: 'Excused', count: data.register.filter((r) => effective(r) === 'excused').length },
            { value: 'absent', label: 'Absent', count: data.register.filter((r) => effective(r) === 'absent').length },
            { value: 'none', label: 'Not recorded', count: data.register.filter((r) => !effective(r)).length },
          ]}
        />
        {data.register.length === 0 ? (
          <StatePanel kind="empty" title="No one is enrolled in this cohort" description="Add participants to the cohort to take attendance." />
        ) : (
          <ul aria-label="Register">
            {visible.map((r) => (
              <li key={r.memberId} className="flex items-center gap-3 border-b border-default py-2.5 last:border-b-0 max-md:flex-wrap">
                <Avatar initials={initials(r.name)} seed={r.memberId} size={32} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-body-strong text-primary">
                    {r.name}
                    {!r.stillEnrolled && <span className="font-normal text-muted"> · no longer in the cohort</span>}
                  </span>
                  <span className="truncate text-caption text-secondary">
                    {[
                      r.source && sourceLabel[r.source],
                      showZoomColumns && r.joinedAt && `Joined ${formatTime(r.joinedAt, timeZone)}`,
                      r.minutesInMeeting !== null && `${Math.floor(r.minutesInMeeting / 60)}h ${String(r.minutesInMeeting % 60).padStart(2, '0')}m in meeting`,
                      r.late && 'Late',
                      r.note,
                    ]
                      .filter(Boolean)
                      .join(' · ') || (r.status ? '' : 'Not marked')}
                  </span>
                </span>
                {r.status ? (
                  <>
                    <MarkBadge status={r.status} />
                    {open && (
                      <button type="button" onClick={() => setEditing(r)} className="text-caption-strong text-brand-text hover:underline">
                        Edit
                      </button>
                    )}
                  </>
                ) : open ? (
                  <MarkPicker
                    name={r.name}
                    value={pending[r.memberId] ?? null}
                    onChange={(mark) =>
                      setPending((prev) => {
                        const next = { ...prev }
                        if (mark) next[r.memberId] = mark
                        else delete next[r.memberId]
                        return next
                      })
                    }
                  />
                ) : (
                  <MarkBadge status={null} />
                )}
              </li>
            ))}
          </ul>
        )}
        {open && unmarked.length > 0 && (
          <div className="sticky bottom-0 -mx-panel flex items-center gap-3 border-t border-default bg-surface px-panel pt-3 pb-1 max-md:flex-col max-md:items-stretch">
            <p className="flex-1 text-caption text-secondary">
              {pendingCount ? `${plural(pendingCount, 'mark')} to save` : 'Nothing marked yet'} · anyone left unmarked is saved as Not recorded
            </p>
            <Button onClick={saveRegister} disabled={!pendingCount || save.isPending}>
              {save.isPending ? 'Saving…' : 'Save register'}
            </Button>
          </div>
        )}
      </Panel>

      {editing && (
        <EditMarkDialog
          key={editing.memberId}
          row={editing}
          session={s}
          timeZone={timeZone}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setNotice({ tone: 'success', title: `${editing.name}’s attendance was changed`, body: 'The change and your reason are in the history.' })
            setEditing(null)
          }}
        />
      )}
    </>
  )
}

/** Present / Absent / Excused as a three-way toggle (C2.03). Choosing the same option again clears it. */
function MarkPicker({ name, value, onChange }: { name: string; value: Mark | null; onChange: (mark: Mark | null) => void }) {
  const options: Mark[] = ['present', 'absent', 'excused']
  const selected: Record<Mark, string> = {
    present: 'border-success bg-success-bg text-success-fg',
    absent: 'border-error bg-error-bg text-error-fg',
    excused: 'border-warning bg-warning-bg text-warning-fg',
  }
  return (
    <div role="group" aria-label={`Attendance for ${name}`} className="flex shrink-0 gap-1 max-md:w-full">
      {options.map((mark) => (
        <button
          key={mark}
          type="button"
          aria-pressed={value === mark}
          onClick={() => onChange(value === mark ? null : mark)}
          className={clsx(
            'h-8 rounded-md border px-3 text-caption-strong transition-colors focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none max-md:h-10 max-md:flex-1',
            value === mark ? selected[mark] : 'border-default bg-surface text-secondary hover:bg-surface-hover',
          )}
        >
          {markLabel[mark]}
        </button>
      ))}
    </div>
  )
}

/** C2.02 Edit attendance: a reason is required and saved to the log. */
function EditMarkDialog({
  row,
  session: s,
  timeZone,
  onClose,
  onSaved,
}: {
  row: RegisterRow
  session: Session
  timeZone: string | undefined
  onClose: () => void
  onSaved: () => void
}) {
  const edit = useEditMark(s.id, row.memberId)
  const [status, setStatus] = useState<Mark>(row.status ?? 'present')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [failed, setFailed] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (status === row.status) return setError(`${row.name.split(' ')[0]} is already marked ${markLabel[status].toLowerCase()}. Choose a different mark.`)
    if (!reason.trim()) return setError('Add a reason. It’s saved to the attendance log.')
    setFailed(null)
    try {
      await edit.mutateAsync({ status, reason })
      onSaved()
    } catch (err) {
      setFailed(err instanceof ApiError && err.status < 500 ? err.message : 'The change wasn’t saved. Try again.')
    }
  }

  return (
    <Dialog
      open
      onClose={() => !edit.isPending && onClose()}
      width={440}
      title={`Edit attendance — ${row.name}`}
      description={`${s.title} · ${formatDay(s.startsAt, timeZone)} · ${s.cohort.name}`}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={edit.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="edit-mark" disabled={edit.isPending}>
            {edit.isPending ? 'Saving…' : 'Save change'}
          </Button>
        </>
      }
    >
      <form id="edit-mark" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {failed && (
          <AlertBanner tone="error" title="Couldn’t save">
            {failed}
          </AlertBanner>
        )}
        <div className="flex items-center gap-3">
          <span className="w-24 text-caption text-secondary">Current</span>
          <MarkBadge status={row.status} />
          {row.source && <span className="text-caption text-secondary">{sourceLabel[row.source]}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-caption-strong text-primary">Change to</span>
          <RadioGroup
            label="Change to"
            options={(['present', 'excused', 'absent'] as Mark[]).map((m) => ({ value: m, label: markLabel[m] }))}
            value={status}
            onChange={(value) => {
              setStatus(value)
              setError(null)
            }}
          />
        </div>
        <TextAreaField
          label="Reason"
          autoFocus
          value={reason}
          onChange={(e) => {
            setReason(e.target.value)
            setError(null)
          }}
          error={error}
          helper="Required. Saved to the attendance log with your name and the time."
        />
      </form>
    </Dialog>
  )
}
