import clsx from 'clsx'
import { Link } from 'react-router'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { CheckCircleIcon, DownloadIcon } from '@/components/ui/icons'
import { Badge, EmptyState, PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { Tabs } from '@/components/ui/Tabs'
import { formatDate, formatDay } from '@/lib/format'
import { CertificateCard } from '@/pages/admin/completion/CertificateCard'
import { printCertificate, type Criterion } from '@/pages/admin/completion/data'
import { todayLong, useMyCertificate, useMyProgress, type MyProgress } from './data'

/** "Grades & feedback" header with the Grades | Progress tabs (P6.01, P7.01). */
export function GradesHeader() {
  return (
    <>
      <PageHeader title="Grades & feedback" description="Each grade uses the scale your trainer chose for that assignment." />
      <Tabs
        label="Grades and progress"
        items={[
          { label: 'Grades', to: '/participant/grades', end: true },
          { label: 'Progress', to: '/participant/grades/progress' },
        ]}
      />
    </>
  )
}

const names = { attendance: 'attendance', submissions: 'assignments submitted', grade: 'average grade' } as const
type Key = keyof typeof names

/** /participant/grades/progress — P7.01 Progress, P7.01n not completed, P7.01w awaiting confirmation. */
export function ProgressPage() {
  const query = useMyProgress()
  return (
    <>
      <GradesHeader />
      {query.isPending ? (
        <Panel aria-busy="true" aria-label="Loading progress" className="h-[240px] max-w-[760px]">
          <span className="sr-only">Loading progress</span>
        </Panel>
      ) : query.isError ? (
        <Panel className="max-w-[760px]">
          <StatePanel
            kind="error"
            title="Couldn’t load your progress"
            description="Check your connection and try again."
            action={{ label: 'Try again', onClick: () => void query.refetch() }}
          />
        </Panel>
      ) : !query.data.progress ? (
        <Panel className="max-w-[760px] py-12">
          <EmptyState
            icon={<CheckCircleIcon size={24} />}
            title="You’re not in a cohort"
            body="When you’re enrolled, your progress towards completing it shows here."
          />
        </Panel>
      ) : (
        <Progress data={query.data} progress={query.data.progress} />
      )}
    </>
  )
}

function Progress({ data, progress }: { data: MyProgress; progress: NonNullable<MyProgress['progress']> }) {
  const { cohort, status } = progress
  const ended = formatDate(cohort.endsOn)
  const criteria = (['attendance', 'submissions', 'grade'] as Key[]).filter((k) => progress[k].enabled)
  const missing = criteria.filter((k) => progress[k].met === false).map((k) => names[k])
  const list = missing.length > 1 ? `${missing.slice(0, -1).join(', ')} and ${missing.at(-1)}` : (missing[0] ?? '')

  const banner =
    status === 'issued' ? (
      <AlertBanner tone="success" title={`You’ve completed ${cohort.name}`}>
        Your certificate is ready.{' '}
        <Link to="/participant/grades/certificate" className="text-brand-text hover:underline">
          View certificate
        </Link>
      </AlertBanner>
    ) : status === 'eligible' ? (
      <AlertBanner tone="info" title={`${cohort.name} has ended — waiting for an admin`}>
        You met every requirement. Once an admin confirms, your certificate is issued and we’ll email you.
      </AlertBanner>
    ) : status === 'not_completed' ? (
      <AlertBanner tone="warning" title="You didn’t meet the completion rule">
        {cohort.name} ended on {ended}. {list ? `Your ${list} ${missing.length > 1 ? 'were' : 'was'} below what’s needed` : 'An admin reviewed your progress'},
        so a certificate isn’t issued. Talk to your programme team about next steps, such as joining a later cohort.
      </AlertBanner>
    ) : missing.length ? (
      <AlertBanner tone="warning" title={`You’re behind on ${list}`}>
        There’s still time before {cohort.name} ends on {ended}. Talk to your trainer if you need a hand catching up.
      </AlertBanner>
    ) : (
      <AlertBanner tone="success" title="You’re on track to complete">
        Keep this up until {cohort.name} ends on {ended}.{' '}
        {progress.requiresApproval ? 'An admin then confirms completion and your certificate is issued.' : 'Your certificate is then issued.'}
      </AlertBanner>
    )

  return (
    <div className="flex max-w-[760px] flex-col gap-4">
      {banner}
      <Panel className="gap-0">
        <PanelHeader title="Completion rule" description={`Set by ${data.organisation}. The black line marks what you need.`} />
        <ul className="mt-1">
          {criteria.map((k) => (
            <CriterionRow key={k} name={k} criterion={progress[k]} ended={cohort.ended} />
          ))}
          {progress.requiresApproval && <ApprovalRow progress={progress} timeZone={data.timeZone} />}
        </ul>
      </Panel>
    </div>
  )
}

const titles: Record<Key, string> = { attendance: 'Attendance', submissions: 'Assignments submitted', grade: 'Average grade' }

function line(name: Key, c: Criterion, ended: boolean) {
  const needs = `needs ${c.needed}%`
  if (c.value === null) {
    const none = { attendance: 'No sessions held yet', submissions: 'Nothing due yet', grade: 'Nothing graded yet' }[name]
    return `${none} · ${needs}`
  }
  if (name === 'attendance') return `${c.value}% (${c.detail}) · ${needs}`
  if (name === 'submissions') return ended ? `${c.value}% submitted · ${needs}` : `${c.value}% (${c.detail}) · ${needs}`
  return `${c.value}% across graded work · ${needs}`
}

function CriterionRow({ name, criterion: c, ended }: { name: Key; criterion: Criterion; ended: boolean }) {
  const met = c.met !== false
  const badge = ended
    ? met
      ? { tone: 'success' as const, label: 'Met' }
      : { tone: 'error' as const, label: 'Not met' }
    : met
      ? { tone: 'success' as const, label: 'On track' }
      : { tone: 'warning' as const, label: 'Behind' }
  return (
    <li className="flex items-start gap-4 border-b border-default py-3 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body-strong text-primary">{titles[name]}</span>
        <span className="text-caption text-secondary">{line(name, c, ended)}</span>
        <div
          role="meter"
          aria-label={titles[name]}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={c.value ?? 0}
          aria-valuetext={`${c.value ?? 0}%, needs ${c.needed}%`}
          className="relative mt-2 h-1.5 w-full rounded-full bg-chart-track"
        >
          <span
            className={clsx('absolute inset-y-0 left-0 rounded-full', met ? 'bg-brand' : ended ? 'bg-error' : 'bg-warning')}
            style={{ width: `${c.value ?? 0}%` }}
          />
          <span aria-hidden="true" className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-primary" style={{ left: `calc(${c.needed}% - 1px)` }} />
        </div>
      </div>
      <span className="flex w-[92px] shrink-0 justify-end">
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </span>
    </li>
  )
}

function ApprovalRow({ progress, timeZone }: { progress: NonNullable<MyProgress['progress']>; timeZone: string }) {
  const { status, review, cohort } = progress
  const [detail, badge]: [string, { tone: 'neutral' | 'info' | 'success'; label: string }] =
    status === 'not_yet'
      ? ['After the cohort ends · needs an admin to confirm', { tone: 'neutral', label: 'Later' }]
      : status === 'eligible'
        ? [`Cohort ended ${formatDate(cohort.endsOn)} · waiting for an admin to confirm`, { tone: 'info', label: 'Waiting' }]
        : review
          ? [
              `${review.decision === 'completed' ? 'Confirmed' : 'Reviewed'}${review.by ? ` by ${review.by}` : ''} on ${formatDay(review.at, timeZone)}`,
              { tone: 'neutral', label: 'Done' },
            ]
          : status === 'issued'
            ? ['Confirmed when your certificate was issued', { tone: 'neutral', label: 'Done' }]
            : ['Not needed, as the rule wasn’t met', { tone: 'neutral', label: 'Not needed' }]
  return (
    <li className="flex items-start gap-4 border-b border-default py-3 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body-strong text-primary">Admin approval</span>
        <span className="text-caption text-secondary">{detail}</span>
      </div>
      <span className="flex w-[92px] shrink-0 justify-end">
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </span>
    </li>
  )
}

/** /participant/grades/certificate — P7.02 Certificate. */
export function MyCertificatePage() {
  const query = useMyCertificate()
  const timeZone = query.data?.timeZone
  if (query.isPending) return <div aria-busy="true" aria-label="Loading certificate" className="h-40" />
  if (query.isError) {
    const missing = (query.error as { status?: number }).status === 404
    return (
      <>
        <PageHeader title="Your certificate" />
        <Panel className="max-w-[760px] py-12">
          {missing ? (
            <EmptyState
              icon={<CheckCircleIcon size={24} />}
              title="No certificate yet"
              body="Your certificate is issued after your cohort ends and you’ve met the completion rule."
              actions={
                <Link
                  to="/participant/grades/progress"
                  className="inline-flex h-9 items-center rounded-md border border-strong bg-surface px-4 text-label-button text-primary hover:bg-surface-hover"
                >
                  See your progress
                </Link>
              }
            />
          ) : (
            <StatePanel
              kind="error"
              title="Couldn’t load your certificate"
              description="Check your connection and try again."
              action={{ label: 'Try again', onClick: () => void query.refetch() }}
            />
          )}
        </Panel>
      </>
    )
  }
  const { certificate } = query.data
  return (
    <>
      <PageHeader
        eyebrow={todayLong(timeZone)}
        title="Your certificate"
        description={`Issued ${formatDay(certificate.issuedAt, timeZone)} after ${certificate.cohort.name} ended.`}
        actions={
          <Button icon={<DownloadIcon size={16} />} onClick={printCertificate}>
            Download PDF
          </Button>
        }
      />
      <div className="flex max-w-[760px] flex-col gap-3">
        <CertificateCard certificate={certificate} />
        <p className="text-caption text-secondary">Anyone with the certificate ID can confirm it with {certificate.organisation}.</p>
      </div>
    </>
  )
}
