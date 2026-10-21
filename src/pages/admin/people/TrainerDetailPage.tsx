import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { BookOpenIcon, MailIcon, PlusIcon } from '@/components/ui/icons'
import { DetailList } from '@/components/ui/FormLayout'
import { EmptyState, PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { ApiError } from '@/lib/api'
import { formatDay, formatTime } from '@/lib/format'
import { roleLabel } from '@/lib/people'
import {
  fullNameOf,
  invitationExpired,
  useMember,
  useResendInvitation,
  useRevokeInvitation,
  type HistoryEntry,
  type MemberDetail,
} from './members'
import { StatusBadge } from './StatusBadge'

type Notice = { tone: 'success' | 'warning' | 'error'; title: string; body: string }

/** /admin/trainers/:id — B2.02 Trainer detail, B2.02i Invitation pending. */
export function TrainerDetailPage() {
  const { id = '' } = useParams()
  const query = useMember(id)

  if (query.isPending) return <div aria-busy="true" aria-label="Loading trainer" className="h-40" />
  if (query.isError) {
    const missing = query.error instanceof ApiError && query.error.status === 404
    return (
      <>
        <PageHeader title={missing ? 'Trainer not found' : 'Couldn’t load this trainer'} breadcrumb={[{ label: 'Trainers', to: '/admin/trainers' }]} />
        <Panel>
          <StatePanel
            kind={missing ? 'no-results' : 'error'}
            title={missing ? 'This person isn’t in your organisation' : 'Something went wrong'}
            description={missing ? 'Their invitation may have been revoked.' : 'Check your connection and try again.'}
          />
        </Panel>
      </>
    )
  }
  return <TrainerDetail member={query.data.member} history={query.data.history} />
}

function TrainerDetail({ member, history }: { member: MemberDetail; history: HistoryEntry[] }) {
  const { state } = useAuth()
  const navigate = useNavigate()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const when = (value: string) => `${formatDay(value, timeZone)}, ${formatTime(value, timeZone)}`

  const resend = useResendInvitation(member.id)
  const revoke = useRevokeInvitation(member.id)
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const name = fullNameOf(member)
  const invited = member.status === 'invited'
  const expired = invitationExpired(member)

  const meta = [
    roleLabel[member.role],
    member.email,
    invited && member.invitedAt
      ? `Invited ${when(member.invitedAt)}${member.invitedBy ? ` by ${member.invitedBy}` : ''}`
      : member.joinedAt
        ? `Joined ${formatDay(member.joinedAt, timeZone)}`
        : null,
  ]
    .filter(Boolean)
    .join(' · ')

  async function onResend() {
    setNotice(null)
    try {
      const result = await resend.mutateAsync()
      setNotice(
        result.emailSent
          ? { tone: 'success', title: 'New invitation sent', body: `We emailed a new link to ${member.email}. The previous link no longer works.` }
          : { tone: 'warning', title: 'The email didn’t send', body: 'A new link was created, but we couldn’t email it. Try again in a moment.' },
      )
    } catch (error) {
      setNotice({
        tone: 'error',
        title: 'Couldn’t resend the invitation',
        body: error instanceof ApiError && error.status < 500 ? error.message : 'Check your connection and try again.',
      })
    }
  }

  async function onRevoke() {
    try {
      await revoke.mutateAsync()
      navigate('/admin/trainers', { state: { revoked: name } })
    } catch (error) {
      setConfirmRevoke(false)
      setNotice({
        tone: 'error',
        title: 'Couldn’t revoke the invitation',
        body: error instanceof ApiError && error.status < 500 ? error.message : 'Check your connection and try again.',
      })
    }
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Trainers', to: '/admin/trainers' }, { label: name }]}
        title={name}
        badge={<StatusBadge member={member} />}
        description={meta}
        actions={
          invited ? (
            <>
              <Button variant="secondary" onClick={() => setConfirmRevoke(true)} disabled={resend.isPending}>
                Revoke invitation
              </Button>
              <Button icon={<MailIcon size={16} />} onClick={onResend} disabled={resend.isPending}>
                {resend.isPending ? 'Sending…' : 'Resend invitation'}
              </Button>
            </>
          ) : undefined
        }
      />

      {notice && (
        <AlertBanner tone={notice.tone} title={notice.title}>
          {notice.body}
        </AlertBanner>
      )}

      {invited && !notice && member.invitationExpiresAt && (
        expired ? (
          <AlertBanner tone="warning" title={`${member.firstName}’s invitation link has expired`}>
            It expired {when(member.invitationExpiresAt)}. Resend to email a new link that lasts 72 hours.
          </AlertBanner>
        ) : (
          <AlertBanner title={`Waiting for ${member.firstName} to set a password`}>
            The invitation link expires {when(member.invitationExpiresAt)} — 72 hours after it was sent. Resending sends a new link and
            cancels the old one.
          </AlertBanner>
        )
      )}

      <Panel aria-labelledby="teaching-title">
        <PanelHeader
          id="teaching-title"
          title="Teaching"
          description={invited ? `Courses ${member.firstName} will lead or assist once signed in.` : `Courses ${member.firstName} leads or assists.`}
        />
        {member.teaching.courses.length > 0 ? (
          <DetailList
            items={[
              { label: 'Courses', value: member.teaching.courses.map((c) => c.name).join(', ') },
              {
                label: 'Cohorts',
                value: member.teaching.cohorts.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && ', '}
                    <Link to={`/admin/cohorts/${c.id}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </span>
                )),
              },
            ]}
          />
        ) : (
          <EmptyState
            icon={<BookOpenIcon size={24} />}
            title="Not assigned to a course yet"
            body={`Choose ${member.firstName} as a course’s lead trainer when you add it to a programme.${invited ? ' They’ll see the course after they sign in for the first time.' : ''}`}
            actions={
              <Button icon={<PlusIcon size={16} />} onClick={() => navigate('/admin/courses/new')}>
                Add course
              </Button>
            }
          />
        )}
      </Panel>

      {history.length > 0 && (
        <Panel aria-labelledby="history-title">
          <PanelHeader id="history-title" title="Invitation history" />
          <ol>
            {history.map((entry, index) => (
              <li key={`${entry.at}-${index}`} className="flex gap-4 border-b border-default py-2.5 last:border-b-0 max-md:flex-col max-md:gap-0.5">
                <time dateTime={entry.at} className="w-40 shrink-0 text-body text-secondary tabular-nums">
                  {when(entry.at)}
                </time>
                <span className="text-body-strong text-primary">{describe(entry, member)}</span>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      <Dialog
        open={confirmRevoke}
        onClose={() => !revoke.isPending && setConfirmRevoke(false)}
        width={440}
        title={`Revoke ${member.firstName}’s invitation?`}
        description={`The link in their email stops working and ${name} is removed from Trainers. You can invite them again later.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmRevoke(false)} disabled={revoke.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onRevoke} disabled={revoke.isPending}>
              {revoke.isPending ? 'Revoking…' : 'Revoke invitation'}
            </Button>
          </>
        }
      />
    </>
  )
}

function describe(entry: HistoryEntry, member: MemberDetail): string {
  const by = entry.actor ? ` by ${entry.actor}` : ''
  switch (entry.action) {
    case 'member.invited':
      return `Invitation sent${by}`
    case 'member.invitation_resent':
      return `Invitation resent${by} — the earlier link stopped working`
    case 'member.invitation_renewed':
      return `${member.firstName} asked for a new link — it was emailed automatically`
    case 'member.joined':
      return `${member.firstName} set a password and joined`
    default:
      return 'Updated'
  }
}
