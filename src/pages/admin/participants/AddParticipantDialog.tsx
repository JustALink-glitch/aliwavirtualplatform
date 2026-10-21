import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { MailIcon } from '@/components/ui/icons'
import { SelectField, TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/api'
import { validateEmail, validateFullName } from '@/pages/onboarding/validation'
import type { CohortSummary } from '@/pages/admin/programmes/data'
import { useAddParticipant } from './data'

type Errors = Partial<Record<'fullName' | 'email' | 'cohortId', string>>
type Blocked = { name: string; memberId: string | null; cohortName: string; kind: 'already_enrolled' | 'one_cohort_only' }

/** B1.02 Add participant (+ B1.02b already enrolled). */
export function AddParticipantDialog({
  open,
  onClose,
  cohorts,
  defaultCohortId,
  onAdded,
}: {
  open: boolean
  onClose: () => void
  /** Cohorts people can join: active and upcoming. */
  cohorts: CohortSummary[]
  defaultCohortId?: string
  onAdded: (result: { name: string; email: string; cohortName: string; invited: boolean; emailSent: boolean | null }) => void
}) {
  const add = useAddParticipant()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [cohortId, setCohortId] = useState(defaultCohortId ?? (cohorts.length === 1 ? cohorts[0]!.id : ''))
  const [errors, setErrors] = useState<Errors>({})
  const [blocked, setBlocked] = useState<Blocked | null>(null)
  const [failed, setFailed] = useState<string | null>(null)

  function reset() {
    setFullName('')
    setPhone('')
    setEmail('')
    setErrors({})
    setBlocked(null)
    setFailed(null)
  }

  function close() {
    if (add.isPending) return
    reset()
    onClose()
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next: Errors = {
      fullName: validateFullName(fullName, 'their'),
      email: validateEmail(email),
      cohortId: cohortId ? undefined : 'Choose a cohort.',
    }
    setErrors(next)
    setBlocked(null)
    setFailed(null)
    if (Object.values(next).some(Boolean)) return
    const cohortName = cohorts.find((c) => c.id === cohortId)?.name ?? 'the cohort'
    try {
      const result = await add.mutateAsync({ fullName, email: email.trim().toLowerCase(), phone, cohortId })
      onAdded({ name: fullName.trim(), email: email.trim().toLowerCase(), cohortName, invited: result.invited, emailSent: result.emailSent })
      reset()
    } catch (error) {
      if (error instanceof ApiError && (error.code === 'already_enrolled' || error.code === 'one_cohort_only')) {
        const details = error.details as { cohortName: string; memberId?: string }
        setErrors({ email: `This email is already in ${details.cohortName}.` })
        setBlocked({ name: fullName.trim().split(' ')[0] || 'them', memberId: details.memberId ?? null, cohortName: details.cohortName, kind: error.code })
      } else if (error instanceof ApiError && (error.code === 'email_in_use' || error.code === 'access_ended')) {
        setErrors({ email: error.message })
      } else if (error instanceof ApiError && Array.isArray(error.details)) {
        setErrors(Object.fromEntries((error.details as { field: string; message: string }[]).map((d) => [d.field, d.message])))
      } else {
        setFailed(error instanceof ApiError && error.status < 500 ? error.message : 'The invitation wasn’t sent. Check your connection and try again.')
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Add participant"
      description="They’ll get an email with a link to set a password and sign in."
      actions={
        <>
          <Button variant="secondary" onClick={close} disabled={add.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="add-participant" icon={<MailIcon size={16} />} disabled={add.isPending}>
            {add.isPending ? 'Sending…' : 'Send invitation'}
          </Button>
        </>
      }
    >
      <form id="add-participant" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {failed && (
          <AlertBanner tone="error" title="Couldn’t add the participant">
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
        <TextField label="Phone" optional type="tel" autoComplete="off" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField
          label="Email"
          type="email"
          autoComplete="off"
          helper="Used to sign in. One account per email."
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((prev) => ({ ...prev, email: undefined }))
            setBlocked(null)
          }}
          error={errors.email}
        />
        <SelectField
          label="Cohort"
          value={cohortId}
          onChange={(e) => {
            setCohortId(e.target.value)
            setErrors((prev) => ({ ...prev, cohortId: undefined }))
          }}
          error={errors.cohortId}
        >
          <option value="">Select a cohort</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
        {blocked?.kind === 'one_cohort_only' ? (
          <AlertBanner title="Participants can be in one cohort at a time">
            Your organisation allows one active cohort per participant. To move {blocked.name}, open their{' '}
            {blocked.memberId ? (
              <Link to={`/admin/participants/${blocked.memberId}`} className="font-medium underline">
                profile
              </Link>
            ) : (
              'profile'
            )}{' '}
            and choose Transfer.
          </AlertBanner>
        ) : blocked?.kind === 'already_enrolled' && blocked.memberId ? (
          <p className="text-caption text-secondary">
            <Link to={`/admin/participants/${blocked.memberId}`} className="font-medium text-brand-text underline">
              Open their profile
            </Link>
          </p>
        ) : (
          <AlertBanner title="The invitation link expires after 72 hours">You can resend it from their profile if it expires.</AlertBanner>
        )}
      </form>
    </Dialog>
  )
}
