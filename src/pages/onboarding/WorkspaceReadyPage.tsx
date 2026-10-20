import { Navigate, useNavigate } from 'react-router'
import { OnboardingHeader, OnboardingLayout, SummaryRow } from '@/components/onboarding/OnboardingLayout'
import { signUpSteps } from '@/components/onboarding/steps'
import { Button } from '@/components/ui/Button'
import { ArrowRightIcon, CheckCircleIcon } from '@/components/ui/icons'
import { useAuth } from '@/auth/useAuth'
import { timeZoneLabel } from '@/lib/format'
import { homePath } from '@/lib/roles'

const ROLE_LABEL = { owner: 'Owner', admin: 'Admin', trainer: 'Trainer', assistant_trainer: 'Assistant trainer', participant: 'Participant' }

/** R1.06 Workspace ready: what was saved, and what comes next. */
export function WorkspaceReadyPage() {
  const { state } = useAuth()
  const navigate = useNavigate()

  if (state.status === 'loading') return <div aria-busy="true" className="min-h-dvh bg-canvas" />
  if (state.status === 'signed-out') return <Navigate to="/sign-in" replace />
  if (state.status === 'no-access') return <Navigate to="/signup/organisation" replace />

  const { me } = state
  const organisation = me.organisation
  const role = me.membership.role
  if (role !== 'owner' && role !== 'admin') return <Navigate to={homePath(role)} replace />

  return (
    <OnboardingLayout
      panelTitle="You’re all set"
      panelBody="Your workspace is ready. Next, create your first programme from the dashboard."
      steps={signUpSteps(4)}
      footer={`Signed in as ${me.user.email ?? ''}. Progress is saved as you go.`}
      contentWidth={480}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-success-bg text-success-fg">
        <CheckCircleIcon size={24} />
      </div>
      <OnboardingHeader
        eyebrow="Step 4 of 4"
        title={`${organisation?.name ?? 'Your organisation'} is ready`}
        description="Here’s what has been saved. You can change any of it later in Settings."
      />

      <dl className="border-t border-default">
        {organisation && <SummaryRow label="Organisation" value={organisation.name} />}
        <SummaryRow label="Your role" value={ROLE_LABEL[role]} />
        {organisation && <SummaryRow label="Time zone" value={timeZoneLabel(organisation.timeZone)} />}
        <SummaryRow label="Plan" value="Free · no payment details on file" />
      </dl>

      <section className="flex flex-col gap-2 rounded-lg border border-default bg-surface p-4">
        <h2 className="text-body-strong text-primary">Next, from your dashboard</h2>
        <p className="text-body text-secondary">
          Create a programme → create a cohort → add trainers → import participants → add courses → schedule the first session.
        </p>
        <p className="text-caption text-muted">None of these are done yet. Your dashboard tracks them as a checklist.</p>
      </section>

      <Button fullWidth icon={<ArrowRightIcon size={16} />} onClick={() => navigate('/admin')}>
        Go to dashboard
      </Button>
    </OnboardingLayout>
  )
}
