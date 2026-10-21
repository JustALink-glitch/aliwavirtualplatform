import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { MailIcon } from '@/components/ui/icons'
import { TextField } from '@/components/ui/TextField'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { ApiError } from '@/lib/api'
import { splitFullName } from '@/lib/people'
import { validateEmail, validateFullName } from '@/pages/onboarding/validation'
import { useInviteMember, type Member } from './members'

type Errors = { fullName?: string | undefined; email?: string | undefined }

/** B2.03 Invite trainer. Cohort assignment is optional and appears once cohorts exist. */
export function InviteTrainerDialog({
  open,
  onClose,
  onInvited,
}: {
  open: boolean
  onClose: () => void
  onInvited: (member: Member, emailSent: boolean) => void
}) {
  const invite = useInviteMember()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [failed, setFailed] = useState<string | null>(null)

  function close() {
    if (invite.isPending) return
    setFullName('')
    setEmail('')
    setErrors({})
    setFailed(null)
    invite.reset()
    onClose()
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next: Errors = { fullName: validateFullName(fullName, 'their'), email: validateEmail(email) }
    setErrors(next)
    setFailed(null)
    if (next.fullName || next.email) return

    try {
      const { firstName, lastName } = splitFullName(fullName)
      const result = await invite.mutateAsync({ email: email.trim().toLowerCase(), firstName, lastName, role: 'trainer' })
      setFullName('')
      setEmail('')
      onInvited(result.member, result.emailSent)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'email_in_use') {
        setErrors({ email: 'This email is already in use on Synqop. One email can belong to one organisation.' })
      } else if (error instanceof ApiError && error.status === 400) {
        const fields = ((error.details as { field: string; message: string }[] | undefined) ?? []).map((d) => d.field)
        setErrors({
          fullName: fields.some((f) => f === 'firstName' || f === 'lastName') ? 'Enter their first and last name.' : undefined,
          email: fields.includes('email') ? 'Enter an email address like name@organisation.org.' : undefined,
        })
      } else {
        setFailed('The invitation wasn’t sent. Check your connection and try again.')
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Invite a trainer"
      description="They get an email to set up their account. They only see the cohorts you assign."
      actions={
        <>
          <Button variant="secondary" onClick={close} disabled={invite.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="invite-trainer" icon={<MailIcon size={16} />} disabled={invite.isPending}>
            {invite.isPending ? 'Sending…' : 'Send invitation'}
          </Button>
        </>
      }
    >
      <form id="invite-trainer" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {failed && (
          <AlertBanner tone="error" title="Couldn’t send the invitation">
            {failed}
          </AlertBanner>
        )}
        <TextField
          label="Full name"
          autoComplete="off"
          autoFocus
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value)
            setErrors((prev) => ({ ...prev, fullName: undefined }))
          }}
          error={errors.fullName}
        />
        <TextField
          label="Work email"
          type="email"
          autoComplete="off"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((prev) => ({ ...prev, email: undefined }))
          }}
          error={errors.email}
        />
        <div className="flex flex-col gap-2.5">
          <p className="flex gap-1.5 text-caption-strong">
            <span className="text-primary">Assign to cohorts</span>
            <span className="text-caption text-muted">Optional</span>
          </p>
          <p className="text-body text-secondary">You don’t have any cohorts yet.</p>
          <p className="text-caption text-secondary">You can assign courses and cohorts later from the trainer’s page.</p>
        </div>
      </form>
    </Dialog>
  )
}
