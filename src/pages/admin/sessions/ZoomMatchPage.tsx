import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { CheckIcon } from '@/components/ui/icons'
import { PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { Cell, Row, Table } from '@/components/ui/Table'
import { ApiError } from '@/lib/api'
import { formatDay, formatTimeRange, plural } from '@/lib/format'
import { useSaveZoomMatches, useZoomUnmatched, type ZoomAttendee } from './attendanceData'
import { useSession, type Session } from './data'
import { useSessionPaths } from './paths'

const length = (minutes: number) => (minutes >= 60 ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m` : `${minutes}m`)

/** /admin/courses/sessions/:id/attendance/zoom — C2.04 Unmatched Zoom attendees (T4.04 for trainers). */
export function ZoomMatchPage() {
  const { id = '' } = useParams()
  const paths = useSessionPaths()
  const session = useSession(id)
  const query = useZoomUnmatched(id)
  if (session.isPending || query.isPending) return <div aria-busy="true" aria-label="Loading Zoom attendees" className="h-40" />
  if (session.isError || query.isError) {
    return (
      <>
        <PageHeader title="Couldn’t load Zoom attendees" breadcrumb={[{ label: paths.listLabel, to: paths.list }]} />
        <Panel>
          <StatePanel
            kind="error"
            title="Something went wrong"
            description="Check your connection and try again."
            action={{ label: 'Try again', onClick: () => void query.refetch() }}
          />
        </Panel>
      </>
    )
  }
  return (
    <MatchView session={session.data.session} canEdit={session.data.can.attendance} attendees={query.data.attendees} participants={query.data.participants} />
  )
}

function MatchView({
  session: s,
  canEdit,
  attendees,
  participants,
}: {
  session: Session
  canEdit: boolean
  attendees: ZoomAttendee[]
  participants: { memberId: string; name: string; status: string | null }[]
}) {
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const paths = useSessionPaths()
  const navigate = useNavigate()
  const save = useSaveZoomMatches(s.id)
  // Start with each suggestion filled in; the person checks and saves.
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(attendees.flatMap((a) => (a.suggestedMemberId ? [[a.id, a.suggestedMemberId]] : []))),
  )
  const [ignored, setIgnored] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const day = formatDay(s.startsAt, timeZone)
  const attendanceLink = `${paths.session(s.id)}/attendance`
  const pending = attendees.filter((a) => !ignored.has(a.id))
  const toSave = pending.filter((a) => choices[a.id]).length + ignored.size

  async function onSave() {
    setError(null)
    try {
      const result = await save.mutateAsync({
        matches: pending.flatMap((a) => (choices[a.id] ? [{ id: a.id, memberId: choices[a.id]! }] : [])),
        ignore: [...ignored],
      })
      navigate(attendanceLink, {
        state: {
          zoomMatched: `${plural(result.matched, 'attendee')} matched${result.ignored ? `, ${result.ignored} ignored` : ''}.${result.kept ? ` ${plural(result.kept, 'mark')} made by hand ${result.kept === 1 ? 'was' : 'were'} kept.` : ''}`,
        },
      })
    } catch (e) {
      setError(e instanceof ApiError && e.status < 500 ? e.message : 'The matches weren’t saved. Try again.')
    }
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: paths.listLabel, to: paths.list }, { label: `${s.title} · ${day}`, to: paths.session(s.id) }, { label: 'Unmatched attendees' }]}
        title="Match Zoom attendees"
        description={`Zoom couldn’t link these attendees to anyone in ${s.cohort.name} by email. Match them to count their attendance.`}
        actions={
          canEdit && attendees.length > 0 ? (
            <Button icon={<CheckIcon size={16} />} onClick={onSave} disabled={save.isPending || toSave === 0}>
              {save.isPending ? 'Saving…' : 'Save matches'}
            </Button>
          ) : undefined
        }
      />
      {error && <AlertBanner tone="error" title={error} />}
      {!canEdit && (
        <AlertBanner title="You can look, but not match">
          Your organisation doesn’t let assistant trainers change attendance. The lead trainer or an admin can match these.
        </AlertBanner>
      )}
      <Panel aria-labelledby="unmatched-title" className="gap-3">
        <PanelHeader
          id="unmatched-title"
          title={attendees.length ? plural(pending.length, 'unmatched attendee') : 'Everyone is matched'}
          description={`From the Zoom meeting on ${day}, ${formatTimeRange(s.startsAt, s.endsAt, timeZone)}.`}
        />
        {attendees.length === 0 ? (
          <p className="py-6 text-center text-body text-secondary">
            Nothing to match.{' '}
            <Link to={attendanceLink} className="text-brand-text underline">
              Back to attendance
            </Link>
          </p>
        ) : (
          <>
            <div className="max-md:hidden">
              <Table
                columns={[
                  { label: 'Zoom name' },
                  { label: 'Zoom email' },
                  { label: 'In meeting', width: 100, align: 'right' },
                  { label: 'Match to', width: 260 },
                  { label: '', width: 96 },
                ]}
              >
                {attendees.map((a) => (
                  <Row key={a.id}>
                    <Cell className={ignored.has(a.id) ? 'text-muted line-through' : undefined}>{a.name}</Cell>
                    <Cell className="truncate text-secondary">{a.email ?? '—'}</Cell>
                    <Cell align="right" className="font-medium">
                      {length(a.minutes)}
                    </Cell>
                    <Cell>
                      <MatchSelect
                        a={a}
                        participants={participants}
                        value={choices[a.id] ?? ''}
                        disabled={!canEdit || ignored.has(a.id)}
                        onChange={(v) => setChoices((c) => ({ ...c, [a.id]: v }))}
                      />
                    </Cell>
                    <Cell align="right">
                      {canEdit && <IgnoreButton ignored={ignored.has(a.id)} name={a.name} onToggle={() => setIgnored((set) => toggle(set, a.id))} />}
                    </Cell>
                  </Row>
                ))}
              </Table>
            </div>
            <ul className="flex flex-col md:hidden">
              {attendees.map((a) => (
                <li key={a.id} className="flex flex-col gap-2 border-b border-default py-3 last:border-b-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                      <span className={`text-body-strong ${ignored.has(a.id) ? 'text-muted line-through' : 'text-primary'}`}>{a.name}</span>
                      <span className="truncate text-caption text-secondary">
                        {a.email ?? 'No email'} · {length(a.minutes)}
                      </span>
                    </div>
                    {canEdit && <IgnoreButton ignored={ignored.has(a.id)} name={a.name} onToggle={() => setIgnored((set) => toggle(set, a.id))} />}
                  </div>
                  <MatchSelect
                    a={a}
                    participants={participants}
                    value={choices[a.id] ?? ''}
                    disabled={!canEdit || ignored.has(a.id)}
                    onChange={(v) => setChoices((c) => ({ ...c, [a.id]: v }))}
                  />
                </li>
              ))}
            </ul>
            <p className="text-caption text-secondary">Matched attendees count as present or late using your Zoom rules. Ignored names aren’t counted.</p>
          </>
        )}
      </Panel>
    </>
  )
}

const toggle = (set: Set<string>, id: string) => {
  const next = new Set(set)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

function IgnoreButton({ ignored, name, onToggle }: { ignored: boolean; name: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${ignored ? 'Undo ignore' : 'Ignore'} ${name}`}
      className="text-body-strong text-brand-text hover:underline"
    >
      {ignored ? 'Undo' : 'Ignore'}
    </button>
  )
}

function MatchSelect({
  a,
  participants,
  value,
  disabled,
  onChange,
}: {
  a: ZoomAttendee
  participants: { memberId: string; name: string; status: string | null }[]
  value: string
  disabled: boolean
  onChange: (v: string) => void
}) {
  return (
    <select
      aria-label={`Match ${a.name} to`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-strong bg-surface px-3 text-body text-primary outline-none focus:border-focus focus:shadow-[var(--shadow-focus)] disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-disabled"
    >
      <option value="">Choose a participant</option>
      {participants.map((p) => (
        <option key={p.memberId} value={p.memberId}>
          {p.name}
          {p.memberId === a.suggestedMemberId ? ' — suggested' : p.status === 'present' ? ' (already present)' : ''}
        </option>
      ))}
    </select>
  )
}
