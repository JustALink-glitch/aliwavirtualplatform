import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { OnboardingHeader, OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { Prompt } from '@/components/ui/TextLink'
import { useAuth } from '@/auth/useAuth'
import { api, ApiError } from '@/lib/api'
import { formatDay, formatTime } from '@/lib/format'
import type { Role } from '@/lib/roles'
import { supabase } from '@/lib/supabase'
import { validateFullName, validatePassword } from './validation'

interface Invitation {
  state: 'valid' | 'expired' | 'replaced'
  email: string
  firstName: string
  lastName: string
  role: Role
  organisationName: string
  invitedBy: string | null
  sentAt: string
  expiresAt: string
}

const FOOTER = (org: string) => `Your email belongs to ${org}. One email works with one organisation.`

/** What the invitation is for, in the words of T1.01 / P1.01. */
function invitedTo(role: Role): string {
  switch (role) {
    case 'trainer':
    case 'assistant_trainer':
      return 'to teach on Synqop'
    case 'participant':
      return 'to join their programme on Synqop'
    default:
      return 'to help run programmes on Synqop'
  }
}

/**
 * /invite/:token — T1.01 / P1.01 Set password, with states:
 * x validation · e link expired (also "replaced" by a newer link) · s new link sent · used · invalid.
 */
export function InvitationPage() {
  const { token = '' } = useParams()
  const query = useQuery({
    queryKey: ['invitation', token],
    queryFn: ({ signal }) => api<{ invitation: Invitation }>(`/v1/invitations/${encodeURIComponent(token)}`, { signal }),
    retry: false,
    staleTime: Infinity,
  })
  const [sentTo, setSentTo] = useState<string | null>(null)

  if (query.isPending) return <div aria-busy="true" aria-label="Loading invitation" className="min-h-dvh bg-canvas" />

  if (query.isError) {
    const code = query.error instanceof ApiError ? query.error.code : 'network'
    return <UnusableLink code={code} />
  }

  const invitation = query.data.invitation
  if (sentTo) return <NewLinkSent token={token} email={sentTo} organisationName={invitation.organisationName} />
  if (invitation.state !== 'valid') {
    return <ExpiredLink token={token} invitation={invitation} onSent={setSentTo} />
  }
  return <SetPassword token={token} invitation={invitation} />
}

function SetPassword({ token, invitation }: { token: string; invitation: Invitation }) {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [fullName, setFullName] = useState(`${invitation.firstName} ${invitation.lastName}`)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ fullName?: string; password?: string; confirm?: string }>({})
  const [failed, setFailed] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next = {
      fullName: validateFullName(fullName),
      password: validatePassword(password),
      confirm: password && confirm !== password ? 'Passwords don’t match.' : undefined,
    }
    setErrors(next)
    setFailed(null)
    if (next.fullName || next.password || next.confirm) return

    setSaving(true)
    try {
      const { email } = await api<{ email: string }>(`/v1/invitations/${encodeURIComponent(token)}/accept`, {
        method: 'POST',
        body: { password, fullName: fullName.trim() },
      })
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) await refresh()
      // Signed in: /sign-in forwards to the role's home. If sign-in failed, they can sign in there.
      navigate('/sign-in', { replace: true })
    } catch (error) {
      setFailed(error instanceof ApiError && error.status < 500 ? error.message : 'Your password wasn’t saved. Try again.')
      setSaving(false)
    }
  }

  return (
    <OnboardingLayout
      panelTitle={`Welcome to ${invitation.organisationName}`}
      panelBody={`${invitation.invitedBy ?? invitation.organisationName} invited you ${invitedTo(invitation.role)}. Set a password to finish your account.`}
      footer={FOOTER(invitation.organisationName)}
    >
      <OnboardingHeader compact title="Set your password" description="You’ll use this with your email to sign in." />

      {failed && (
        <AlertBanner tone="error" title="Couldn’t set your password">
          {failed}
        </AlertBanner>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <TextField label="Email" value={invitation.email} disabled readOnly helper="Set by your organisation." />
          <TextField
            label="Full name"
            autoComplete="name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              setErrors((prev) => ({ ...prev, fullName: undefined }))
            }}
            helper="As your admin entered it. You can change it."
            error={errors.fullName}
          />
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            helper="At least 10 characters."
            error={errors.password}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              setErrors((prev) => ({ ...prev, confirm: undefined }))
            }}
            error={errors.confirm}
          />
        </div>
        <Button type="submit" size="lg" fullWidth disabled={saving}>
          {saving ? 'Setting password…' : 'Set password and continue'}
        </Button>
      </form>
    </OnboardingLayout>
  )
}

/** T1.01e — expired, or replaced by a newer link. */
function ExpiredLink({ token, invitation, onSent }: { token: string; invitation: Invitation; onSent: (email: string) => void }) {
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const replaced = invitation.state === 'replaced'

  async function requestNewLink() {
    setSending(true)
    setFailed(null)
    try {
      const result = await api<{ email: string }>(`/v1/invitations/${encodeURIComponent(token)}/renew`, { method: 'POST' })
      onSent(result.email)
    } catch (error) {
      setFailed(error instanceof ApiError && error.status < 500 ? error.message : 'We couldn’t send a new link. Try again.')
      setSending(false)
    }
  }

  return (
    <OnboardingLayout
      panelTitle="Invitation links last 72 hours"
      panelBody="For your security, each invitation link works once. Ask for a new one and we’ll email it straight away."
      footer={FOOTER(invitation.organisationName)}
    >
      <OnboardingHeader title={replaced ? 'This link was replaced' : 'This link has expired'} />
      <p className="text-body text-secondary">
        {replaced
          ? `A newer invitation from ${invitation.organisationName} was sent to you. Use the link in the latest email, or ask for a new one.`
          : `Your invitation from ${invitation.organisationName} was sent on ${formatDay(invitation.sentAt)} and expired on ${formatDay(invitation.expiresAt)} at ${formatTime(invitation.expiresAt)}.`}
      </p>
      <AlertBanner title="Your admin is told">
        {invitation.invitedBy ?? 'Your admin'} will see that you asked for a new link.
      </AlertBanner>
      {failed && (
        <AlertBanner tone="error" title="Couldn’t send a new link">
          {failed}
        </AlertBanner>
      )}
      <Button size="lg" fullWidth disabled={sending} onClick={requestNewLink}>
        {sending ? 'Sending…' : 'Email me a new link'}
      </Button>
      <Prompt text="Already set a password?" to="/sign-in" label="Sign in" />
    </OnboardingLayout>
  )
}

/** T1.01s — new link sent. "Resend email" asks again (at most once a minute). */
function NewLinkSent({ token, email, organisationName }: { token: string; email: string; organisationName: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function resend() {
    setStatus('sending')
    try {
      await api(`/v1/invitations/${encodeURIComponent(token)}/renew`, { method: 'POST' })
      setStatus('sent')
      setMessage('Sent again. Use the newest email.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof ApiError && error.status < 500 ? error.message : 'We couldn’t resend it. Try again.')
    }
  }

  return (
    <OnboardingLayout
      panelTitle="Invitation links last 72 hours"
      panelBody="For your security, each invitation link works once."
      footer={FOOTER(organisationName)}
    >
      <OnboardingHeader title="Check your email" />
      <p className="text-body text-secondary">We sent a new link to {email}. It expires in 72 hours.</p>
      <Button variant="secondary" size="lg" fullWidth disabled={status === 'sending'} onClick={resend}>
        {status === 'sending' ? 'Sending…' : 'Resend email'}
      </Button>
      {message && (
        <p role="status" className={status === 'error' ? 'text-caption text-error-fg' : 'text-caption text-secondary'}>
          {message}
        </p>
      )}
    </OnboardingLayout>
  )
}

/** Used, invalid or unreachable link. Not separately designed; follows the T1 layout. */
function UnusableLink({ code }: { code: string }) {
  const content =
    code === 'invitation_used'
      ? { title: 'You’ve already set your password', body: 'This invitation has been used. Sign in with your email and password.' }
      : code === 'network'
        ? { title: 'Couldn’t open your invitation', body: 'Check your connection and reload this page.' }
        : { title: 'This link isn’t valid', body: 'Check you opened the whole link from your email, or ask your administrator to send a new invitation.' }

  return (
    <OnboardingLayout
      panelTitle="Invitation links last 72 hours"
      panelBody="For your security, each invitation link works once."
    >
      <OnboardingHeader title={content.title} />
      <p className="text-body text-secondary">{content.body}</p>
      <Prompt text={code === 'invitation_used' ? 'Ready?' : 'Already set a password?'} to="/sign-in" label="Sign in" />
    </OnboardingLayout>
  )
}
