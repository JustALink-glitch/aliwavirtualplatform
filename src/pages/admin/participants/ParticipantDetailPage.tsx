import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { DetailList } from '@/components/ui/FormLayout'
import { MailIcon } from '@/components/ui/icons'
import { Menu } from '@/components/ui/Menu'
import { Badge, PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { ApiError } from '@/lib/api'
import { formatDate, formatDay, formatDayWithYear, formatTime, relativeDay } from '@/lib/format'
import { enrolmentLabel, linkExpired, useParticipant, useResendParticipantInvitation, type Enrolment, type HistoryEntry, type ParticipantDetail } from './data'
import { ParticipantBadge } from './ParticipantBadge'
import { DeferDialog, EditParticipantDialog, TransferDialog, WithdrawDialog } from './ParticipantDialogs'

type Open = 'edit' | 'defer' | 'withdraw' | 'transfer' | null
type Notice = { tone: 'success' | 'warning' | 'error'; title: string; body?: string }

/** /admin/participants/:id — B1.04 Participant detail, B1.04i invitation expired. */
export function ParticipantDetailPage() {
  const { id = '' } = useParams()
  const query = useParticipant(id)
  if (query.isPending) return <div aria-busy="true" aria-label="Loading participant" className="h-40" />
  if (query.isError) {
    const missing = query.error instanceof ApiError && query.error.status === 404
    return (
      <>
        <PageHeader title={missing ? 'Participant not found' : 'Couldn’t load this participant'} breadcrumb={[{ label: 'Participants', to: '/admin/participants' }]} />
        <Panel>
          <StatePanel kind={missing ? 'no-results' : 'error'} title={missing ? 'This person isn’t a participant in your organisation' : 'Something went wrong'} />
        </Panel>
      </>
    )
  }
  return <ParticipantView data={query.data} />
}

function ParticipantView({ data }: { data: ParticipantDetail }) {
  const { participant: person, enrolments, history } = data
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const when = (value: string) => `${formatDay(value, timeZone)}, ${formatTime(value, timeZone)}`
  const resend = useResendParticipantInvitation(person.id)
  const [open, setOpen] = useState<Open>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  const name = `${person.firstName} ${person.lastName}`.trim()
  const current = enrolments.find((e) => e.status === 'active')
  const shown = current ?? enrolments[0]
  const invited = person.status === 'invited'
  const expired = invited && linkExpired(person.invitationExpiresAt)

  async function onResend() {
    setNotice(null)
    try {
      const result = await resend.mutateAsync()
      setNotice(
        result.emailSent
          ? { tone: 'success', title: 'New invitation sent', body: `We emailed a new link to ${person.email}. The previous link no longer works.` }
          : { tone: 'warning', title: 'The email didn’t send', body: 'A new link was created, but we couldn’t email it. Try again in a moment.' },
      )
    } catch (error) {
      setNotice({ tone: 'error', title: 'Couldn’t resend the invitation', body: error instanceof ApiError && error.status < 500 ? error.message : 'Try again.' })
    }
  }

  const done = (message: string) => {
    setOpen(null)
    setNotice({ tone: 'success', title: message })
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Participants', to: '/admin/participants' }, { label: name }]}
        title={name}
        badge={<ParticipantBadge memberStatus={person.status} invitationExpiresAt={person.invitationExpiresAt} enrolmentStatus={shown?.status} />}
        description={['Participant', shown?.cohort.name, shown?.programme.name].filter(Boolean).join(' · ')}
        actions={
          <>
            {!invited && (
              <a
                href={`mailto:${person.email}`}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-strong bg-surface pr-4 pl-3 text-label-button text-primary hover:bg-surface-hover focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none"
              >
                <MailIcon size={16} />
                Email
              </a>
            )}
            <Button variant="secondary" onClick={() => setOpen('edit')}>
              Edit
            </Button>
            {current && (
              <Menu
                label="Change enrolment"
                items={[
                  { label: 'Transfer to another cohort', onSelect: () => setOpen('transfer') },
                  { label: 'Defer', onSelect: () => setOpen('defer') },
                  { label: 'Withdraw', onSelect: () => setOpen('withdraw'), destructive: true },
                ]}
              />
            )}
            {invited && (
              <Button icon={<MailIcon size={16} />} onClick={onResend} disabled={resend.isPending}>
                {resend.isPending ? 'Sending…' : 'Resend invitation'}
              </Button>
            )}
          </>
        }
      />

      {notice && (
        <AlertBanner tone={notice.tone} title={notice.title}>
          {notice.body}
        </AlertBanner>
      )}
      {invited && !notice && person.invitationExpiresAt && (
        expired ? (
          <AlertBanner tone="warning" title={`${person.firstName} hasn’t accepted their invitation`}>
            The link sent on {formatDay(person.invitationSentAt ?? person.invitedAt ?? person.invitationExpiresAt, timeZone)} expired on {when(person.invitationExpiresAt)}. Resending creates a new link that expires after 72 hours.
          </AlertBanner>
        ) : (
          <AlertBanner title={`Waiting for ${person.firstName} to set a password`}>
            The invitation link expires {when(person.invitationExpiresAt)} — 72 hours after it was sent. Resending sends a new link and cancels the old one.
          </AlertBanner>
        )
      )}

      <div className="flex items-start gap-4 max-lg:flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-4 max-lg:w-full">
          <Panel aria-labelledby="enrolments-title">
            <PanelHeader id="enrolments-title" title="Cohorts" description="Where they’re enrolled, and any changes." />
            {enrolments.length === 0 ? (
              <p className="py-2 text-body text-secondary">Not enrolled in a cohort.</p>
            ) : (
              <ul>
                {enrolments.map((e) => (
                  <EnrolmentRow key={e.id} enrolment={e} timeZone={timeZone} />
                ))}
              </ul>
            )}
          </Panel>

          <Panel aria-labelledby="history-title">
            <PanelHeader id="history-title" title="History" description="Only admins see this." />
            {history.length === 0 ? (
              <p className="py-2 text-body text-secondary">Nothing recorded yet.</p>
            ) : (
              <ol>
                {history.map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="flex gap-4 border-b border-default py-2.5 last:border-b-0 max-md:flex-col max-md:gap-0.5">
                    <time dateTime={entry.at} className="w-40 shrink-0 text-body text-secondary tabular-nums">
                      {when(entry.at)}
                    </time>
                    <span className="text-body-strong text-primary">{describe(entry, person.firstName)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="flex w-[356px] shrink-0 flex-col gap-4 max-lg:w-full">
          <Panel aria-labelledby="details-title">
            <PanelHeader id="details-title" title="Details" />
            <DetailList
              items={[
                { label: 'Email', value: person.email },
                { label: 'Phone', value: person.phone ?? <span className="font-normal text-muted">Not added</span> },
                ...(shown
                  ? [
                      {
                        label: 'Cohort',
                        value: (
                          <Link to={`/admin/cohorts/${shown.cohort.id}`} className="hover:underline">
                            {shown.cohort.name}
                          </Link>
                        ),
                      },
                      { label: 'Trainers', value: shown.trainers.length ? shown.trainers.join(', ') : <span className="font-normal text-muted">None yet</span> },
                      { label: 'Enrolment', value: enrolmentLabel[shown.status] },
                      {
                        label: 'Attendance',
                        value: shown.attendance ? `${shown.attendance.rate}% · ${shown.attendance.present} of ${shown.attendance.recorded} sessions` : <span className="font-normal text-muted">Nothing recorded yet</span>,
                      },
                      { label: 'Enrolled', value: formatDayWithYear(shown.enrolledAt, timeZone) },
                    ]
                  : []),
                { label: 'Signed in', value: person.lastSignInAt ? relativeDay(person.lastSignInAt, timeZone) : 'Never' },
              ]}
            />
          </Panel>
        </div>
      </div>

      {open === 'edit' && <EditParticipantDialog open onClose={() => setOpen(null)} person={person} current={current} onSaved={done} />}
      {open === 'defer' && current && <DeferDialog open onClose={() => setOpen(null)} person={person} enrolment={current} timeZone={timeZone} onDone={done} />}
      {open === 'withdraw' && current && <WithdrawDialog open onClose={() => setOpen(null)} person={person} enrolment={current} timeZone={timeZone} onDone={done} />}
      {open === 'transfer' && current && <TransferDialog open onClose={() => setOpen(null)} person={person} enrolment={current} timeZone={timeZone} onDone={done} />}
    </>
  )
}

function EnrolmentRow({ enrolment: e, timeZone }: { enrolment: Enrolment; timeZone: string | undefined }) {
  const tone = e.status === 'active' ? 'success' : e.status === 'deferred' ? 'warning' : e.status === 'completed' ? 'info' : 'neutral'
  const change =
    e.status === 'deferred'
      ? `Deferred${e.effectiveOn ? ` from ${formatDate(e.effectiveOn)}` : ''}${e.reason ? ` · ${e.reason}` : ''}`
      : e.status === 'withdrawn'
        ? `Withdrawn${e.effectiveOn ? ` on ${formatDate(e.effectiveOn)}` : ''}${e.reason ? ` · ${e.reason}` : ''}`
        : e.status === 'transferred'
          ? `Moved to another cohort ${formatDay(e.changedAt, timeZone)}${e.reason ? ` · ${e.reason}` : ''}`
          : `Enrolled ${formatDayWithYear(e.enrolledAt, timeZone)}`
  return (
    <li className="flex items-start gap-3 border-b border-default py-3 last:border-b-0">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Link to={`/admin/cohorts/${e.cohort.id}`} className="truncate text-body-strong text-primary hover:underline">
          {e.cohort.name}
        </Link>
        <span className="text-caption text-secondary">
          {e.programme.name} · {change}
          {e.attendance && ` · Attendance ${e.attendance.rate}% (${e.attendance.present} of ${e.attendance.recorded})`}
        </span>
        {e.note && <span className="text-caption text-secondary italic">“{e.note}”</span>}
      </span>
      <Badge tone={tone}>{enrolmentLabel[e.status]}</Badge>
    </li>
  )
}

function describe(entry: HistoryEntry, firstName: string): string {
  const by = entry.actor ? ` by ${entry.actor}` : ''
  const d = entry.data as Record<string, string | null | undefined>
  switch (entry.action) {
    case 'member.invited':
      return `Invitation sent${by}${d.source === 'import' ? ' · CSV import' : ''}`
    case 'member.invitation_resent':
      return `Invitation resent${by} — the earlier link stopped working`
    case 'member.invitation_renewed':
      return `${firstName} asked for a new link — it was emailed automatically`
    case 'member.joined':
      return `${firstName} set a password and joined`
    case 'participant.enrolled':
      return `Added to ${d.cohortName ?? 'a cohort'}${by}${d.source === 'import' ? ' · CSV import' : ''}`
    case 'participant.updated':
      return `Details updated${by}${d.emailChanged ? ' — new email, new invitation link sent' : ''}`
    case 'enrolment.deferred':
      return `Deferred from ${d.from}${d.to ? `, joining ${d.to}` : ''}${by}${d.reason ? ` · ${d.reason}` : ''}`
    case 'enrolment.withdrawn':
      return `Withdrawn from ${d.cohort}${by}${d.reason ? ` · ${d.reason}` : ''}`
    case 'enrolment.transferred':
      return `Moved from ${d.from} to ${d.to}${by}`
    default:
      return 'Updated'
  }
}
