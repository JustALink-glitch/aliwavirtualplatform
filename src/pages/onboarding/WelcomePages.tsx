import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useAuth, type Me } from '@/auth/useAuth'
import { OnboardingHeader, OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { ProfilePhoto } from '@/components/profile/ProfilePhoto'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { TextAreaField, TextField } from '@/components/ui/TextField'
import { api, ApiError } from '@/lib/api'
import { formatDay, formatTime } from '@/lib/format'
import { homePath, type Role } from '@/lib/roles'
import { validateFullName } from './validation'

type Welcome =
  | { kind: 'staff'; organisationName: string; timeZone: string; zoom: boolean }
  | {
      kind: 'trainer'
      organisationName: string
      timeZone: string
      zoom: boolean
      teaching: {
        course: string
        cohort: string
        lead: boolean
        leadName: string | null
        nextAt: string | null
        mode: string | null
        location: string | null
      }[]
      assistantCan: { attendance: boolean; resources: boolean; grade: boolean; assignments: boolean; reports: boolean }
    }
  | {
      kind: 'participant'
      organisationName: string
      timeZone: string
      zoom: boolean
      cohort: { name: string; programme: string; firstSessionAt: string | null } | null
      courses: { course: string; trainer: string | null; firstAt: string | null; mode: string | null; location: string | null }[]
    }

const isTrainer = (role: Role) => role === 'trainer' || role === 'assistant_trainer'

/** Signed-in only; staff who aren't trainers have nothing to set up here and go home. */
function Guard({ children }: { children: (me: Me) => ReactNode }) {
  const { state } = useAuth()
  if (state.status === 'loading') return <div aria-busy="true" aria-label="Loading" className="min-h-dvh bg-canvas" />
  if (state.status !== 'signed-in') return <Navigate to="/sign-in" replace />
  const role = state.me.membership.role
  if (!isTrainer(role) && role !== 'participant') return <Navigate to={homePath(role)} replace />
  return <>{children(state.me)}</>
}

const footerFor = (me: Me) =>
  me.membership.role === 'participant'
    ? 'One email works with one organisation on Synqop.'
    : `Your email belongs to ${me.organisation?.name ?? 'your organisation'}. One email works with one organisation.`

/** /welcome/profile — T1.03 / P1.02 Your profile, step 2 of 2 after setting a password. */
export function WelcomeProfilePage() {
  return <Guard>{(me) => <ProfileStep me={me} />}</Guard>
}

function ProfileStep({ me }: { me: Me }) {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const trainer = isTrainer(me.membership.role)
  const [fullName, setFullName] = useState(`${me.membership.firstName} ${me.membership.lastName}`.trim())
  const [phone, setPhone] = useState(me.membership.phone ?? '')
  const [bio, setBio] = useState(me.membership.bio ?? '')
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; bio?: string }>({})
  const [failed, setFailed] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next = {
      fullName: validateFullName(fullName),
      phone: phone.trim() && !/^\+?[\d\s()-]{7,}$/.test(phone.trim()) ? 'Enter a phone number, e.g. +234 806 555 0121.' : undefined,
      bio: bio.trim().length > 300 ? 'Keep it to 300 characters or fewer.' : undefined,
    }
    setErrors(next)
    setFailed(null)
    if (next.fullName || next.phone || next.bio) return
    setSaving(true)
    try {
      await api('/v1/me', { method: 'PATCH', body: { fullName: fullName.trim(), phone: phone.trim() || null, ...(trainer && { bio: bio.trim() || null }) } })
      await refresh()
      navigate('/welcome', { replace: true })
    } catch (error) {
      if (error instanceof ApiError && Array.isArray(error.details)) {
        setErrors(Object.fromEntries((error.details as { field: string; message: string }[]).map((d) => [d.field, d.message])))
      } else {
        setFailed('Your profile wasn’t saved. Check your connection and try again.')
      }
      setSaving(false)
    }
  }

  return (
    <OnboardingLayout
      panelTitle="Almost there"
      panelBody={
        trainer ? 'Add a photo and a few details so participants know who’s teaching them.' : 'Add a photo so your trainers recognise you in sessions.'
      }
      footer={footerFor(me)}
    >
      <OnboardingHeader
        compact
        title="Your profile"
        description={`Step 2 of 2 · ${trainer ? 'Participants and admins see this.' : 'Your trainers and programme team see this.'} You can change it later.`}
      />
      {failed && <AlertBanner tone="error" title={failed} />}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <ProfilePhoto name={fullName} label="Upload a photo" />
          <TextField
            label="Display name"
            autoComplete="name"
            value={fullName}
            maxLength={160}
            onChange={(e) => {
              setFullName(e.target.value)
              setErrors((p) => ({ ...p, fullName: undefined }))
            }}
            error={errors.fullName}
          />
          <TextField
            label="Phone"
            optional
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              setErrors((p) => ({ ...p, phone: undefined }))
            }}
            error={errors.phone}
            helper={trainer ? 'Only admins see this.' : 'Only the programme team sees this.'}
          />
          {trainer && (
            <TextAreaField
              label="Short bio"
              optional
              value={bio}
              maxLength={300}
              onChange={(e) => {
                setBio(e.target.value)
                setErrors((p) => ({ ...p, bio: undefined }))
              }}
              error={errors.bio}
              helper="Shown on your sessions."
            />
          )}
        </div>
        <div className="flex flex-col items-center gap-4">
          <Button type="submit" size="lg" fullWidth disabled={saving}>
            {saving ? 'Saving…' : 'Continue'}
          </Button>
          <button
            type="button"
            onClick={() => navigate('/welcome', { replace: true })}
            className="rounded-sm text-body-strong text-brand-text hover:underline focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none"
          >
            Skip for now
          </button>
        </div>
      </form>
    </OnboardingLayout>
  )
}

/** /welcome — T1.04 / P1.03 "You're all set". */
export function WelcomePage() {
  return <Guard>{(me) => <AllSet me={me} />}</Guard>
}

function AllSet({ me }: { me: Me }) {
  const navigate = useNavigate()
  const query = useQuery({ queryKey: ['me', 'welcome'], queryFn: ({ signal }) => api<Welcome>('/v1/me/welcome', { signal }) })
  const home = homePath(me.membership.role)
  const trainer = isTrainer(me.membership.role)
  const w = query.data
  const tz = w?.timeZone
  const when = (at: string) => `${formatDay(at, tz)}, ${formatTime(at, tz)}`
  const where = (mode: string | null, location: string | null) => (mode === 'online' ? 'Online' : location)

  const panelBody =
    w?.kind === 'trainer'
      ? [w.zoom ? 'Online attendance comes from Zoom automatically.' : null, 'Your admin decides what assistants can do.'].filter(Boolean).join(' ')
      : 'Everything for your programme in one place: sessions, assignments, feedback and progress.'

  return (
    <OnboardingLayout panelTitle="Welcome to Synqop" panelBody={panelBody} footer={footerFor(me)}>
      {query.isPending ? (
        <div aria-busy="true" aria-label="Loading" className="h-40" />
      ) : query.isError || !w ? (
        <>
          <OnboardingHeader compact title={`You’re all set, ${me.membership.firstName}`} />
          <p className="text-body text-secondary">Your account is ready.</p>
        </>
      ) : w.kind === 'trainer' ? (
        <TrainerWelcome w={w} me={me} when={when} where={where} />
      ) : w.kind === 'participant' ? (
        <ParticipantWelcome w={w} me={me} when={when} where={where} />
      ) : null}
      <Button size="lg" fullWidth onClick={() => navigate(home, { replace: true })}>
        {trainer ? 'Go to Today' : 'Go to my dashboard'}
      </Button>
    </OnboardingLayout>
  )
}

type Helpers = { when: (at: string) => string; where: (mode: string | null, location: string | null) => string | null }

function Row({ title, detail }: { title: string; detail: string }) {
  return (
    <li className="flex flex-col gap-0.5 border-b border-default pb-3">
      <span className="text-body-strong text-primary">{title}</span>
      <span className="text-caption text-secondary">{detail}</span>
    </li>
  )
}

function Bullets({ title, items, after }: { title: string; items: string[]; after?: string | null }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body-strong text-primary">{title}</h2>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-body text-secondary">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {after && <p className="text-body text-secondary">{after}</p>}
    </section>
  )
}

function TrainerWelcome({ w, me, when, where }: { w: Extract<Welcome, { kind: 'trainer' }>; me: Me } & Helpers) {
  const leads = w.teaching.some((t) => t.lead)
  const assisting = w.teaching.filter((t) => !t.lead)
  const assistantOnly = !leads && assisting.length > 0
  const courses = [...new Set(w.teaching.map((t) => t.course))]
  const resourcesFor = courses.length === 1 ? `for ${courses[0]}` : 'for your courses'
  const items = assistantOnly
    ? [
        w.assistantCan.attendance ? 'Check or mark the register in your sessions' : null,
        w.assistantCan.resources ? `Add resources ${resourcesFor}` : null,
        w.assistantCan.grade ? 'Grade submissions in your queue' : null,
        w.assistantCan.assignments ? 'Create assignments' : null,
        w.assistantCan.reports ? 'Write session reports' : null,
      ].filter((x): x is string => Boolean(x))
    : [
        w.zoom ? 'Check the register — online attendance fills in from Zoom' : 'Take attendance during or right after each session',
        'Submit a short session report',
        `Add resources ${resourcesFor}`,
        'Grade submissions in your queue',
      ]
  const leadNames = [...new Set(assisting.map((t) => t.leadName).filter(Boolean))]
  const after = assistantOnly && !w.assistantCan.reports && leadNames.length ? `${leadNames.join(' and ')}, the lead trainer, submits session reports.` : null

  return (
    <>
      <OnboardingHeader compact title={`You’re all set, ${me.membership.firstName}`} description={`Here’s what you’re teaching at ${w.organisationName}.`} />
      {w.teaching.length === 0 ? (
        <AlertBanner title="You’re not on a course yet">Your admin will assign you to a course. You’ll see it on Today when they do.</AlertBanner>
      ) : (
        <ul className="flex flex-col gap-3">
          {w.teaching.map((t) => (
            <Row
              key={`${t.course}-${t.cohort}`}
              title={t.course}
              detail={[
                t.cohort,
                t.lead ? 'Lead' : 'Assistant',
                t.nextAt ? `Next: ${when(t.nextAt)}` : 'No sessions scheduled yet',
                t.nextAt ? where(t.mode, t.location) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          ))}
        </ul>
      )}
      {items.length > 0 && <Bullets title="After each session" items={items} after={after} />}
    </>
  )
}

function ParticipantWelcome({ w, me, when, where }: { w: Extract<Welcome, { kind: 'participant' }>; me: Me } & Helpers) {
  const online = w.courses.some((c) => c.mode === 'online')
  const items = [
    online && w.zoom ? 'Join online sessions with your own Zoom link — attendance records itself' : null,
    online && w.zoom && me.user.email ? `Use ${me.user.email} in Zoom so your attendance counts` : null,
    'Submit assignments here before the due time',
    'Rate sessions if you like — it’s optional and anonymous',
  ].filter((x): x is string => Boolean(x))
  return (
    <>
      <OnboardingHeader
        compact
        title={`You’re all set, ${me.membership.firstName}`}
        description={
          w.cohort
            ? [w.cohort.name, w.cohort.programme, w.cohort.firstSessionAt ? `first session ${when(w.cohort.firstSessionAt)}` : null]
                .filter(Boolean)
                .join(' · ') + '.'
            : `Welcome to ${w.organisationName}.`
        }
      />
      {w.courses.length > 0 && (
        <ul className="flex flex-col gap-3">
          {w.courses.map((c) => (
            <Row
              key={c.course}
              title={c.course}
              detail={[c.trainer, where(c.mode, c.location), c.firstAt ? `starts ${formatDay(c.firstAt, w.timeZone)}` : 'Sessions to be scheduled']
                .filter(Boolean)
                .join(' · ')}
            />
          ))}
        </ul>
      )}
      <Bullets title="How it works" items={items} />
    </>
  )
}
