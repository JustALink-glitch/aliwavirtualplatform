import clsx from 'clsx'
import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Choice'
import { DetailList } from '@/components/ui/FormLayout'
import { ChevronRightIcon, MailIcon } from '@/components/ui/icons'
import { Badge, PageHeader, Panel, PanelHeader } from '@/components/ui/Page'
import { TextAreaField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/api'
import { formatDay, formatTime, formatTimeRange, plural } from '@/lib/format'
import { reportBadge, useReport, useReportPaths, useSaveReport, type ReportDetail } from './data'

/** /trainer/reports/:sessionId — T5.01 write, T5.01x overdue, T5.02 submitted; /admin/courses/reports/:sessionId — C3.02. */
export function SessionReportPage() {
  const { sessionId = '' } = useParams()
  const paths = useReportPaths()
  const query = useReport(sessionId)
  if (query.isPending) return <div aria-busy="true" aria-label="Loading report" className="h-40" />
  if (query.isError) {
    const missing = (query.error as { status?: number }).status === 404
    return (
      <>
        <PageHeader title="Session report" breadcrumb={[{ label: paths.listLabel, to: paths.list }]} />
        <Panel>
          <StatePanel
            kind={missing ? 'no-results' : 'error'}
            title={missing ? 'No report for this session' : 'Couldn’t load this report'}
            description={missing ? 'Reports open when a session ends. Cancelled sessions need none.' : 'Check your connection and try again.'}
          />
        </Panel>
      </>
    )
  }
  return <ReportView data={query.data} />
}

function ReportView({ data }: { data: ReportDetail }) {
  const paths = useReportPaths()
  const { session: s, timeZone } = data
  const [editing, setEditing] = useState(data.can.write && !data.report?.submittedAt)
  const [notice, setNotice] = useState<string | null>(null)
  const day = formatDay(s.startsAt, timeZone)
  const due = `${formatDay(data.dueAt, timeZone)}, ${formatTime(data.dueAt, timeZone)}`
  const badge = reportBadge[data.state]
  const firstName = data.trainer?.name?.split(' ')[0]

  return (
    <>
      <PageHeader
        breadcrumb={[
          ...(paths.trainer ? [] : [{ label: 'Courses & sessions', to: '/admin/courses' }]),
          { label: paths.listLabel, to: paths.list },
          { label: `${s.course} · ${day}` },
        ]}
        title="Session report"
        badge={<Badge tone={badge.tone}>{badge.label}</Badge>}
        description={[s.course, s.cohort.name, s.number && `Session ${s.number}`, `${day}, ${formatTimeRange(s.startsAt, s.endsAt, timeZone)}`]
          .filter(Boolean)
          .join(' · ')}
        actions={
          <>
            {!paths.trainer && data.trainer?.email && (
              <a
                href={`mailto:${data.trainer.email}?subject=${encodeURIComponent(`Session report: ${s.course}, ${day}`)}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-strong bg-surface pr-4 pl-3 text-label-button text-primary hover:bg-surface-hover"
              >
                <MailIcon size={16} />
                Email {firstName}
              </a>
            )}
            {data.can.edit && !editing && (
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Edit report
              </Button>
            )}
          </>
        }
      />
      {notice && <AlertBanner tone="success" title={notice} />}
      {editing && data.state === 'overdue' && (
        <AlertBanner tone="error" title={`Overdue since ${due}`}>
          Admins can see it’s late. Submit it as soon as you can — a late report still counts.
        </AlertBanner>
      )}
      {!editing && !data.report?.submittedAt && (
        <AlertBanner tone={data.state === 'overdue' ? 'error' : 'info'} title={data.state === 'overdue' ? `Overdue since ${due}` : `Due ${due}`}>
          {paths.trainer
            ? 'The course’s lead trainer writes this report.'
            : `${firstName ?? 'The trainer'} hasn’t submitted it yet${data.report ? ' — there’s a draft' : ''}.`}
        </AlertBanner>
      )}
      <div className="flex items-start gap-4 max-lg:flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-4 max-lg:w-full">
          {editing ? (
            <ReportForm
              data={data}
              onDone={(submitted) => {
                setNotice(
                  submitted
                    ? data.report?.submittedAt
                      ? 'Report updated'
                      : 'Report submitted. Thank you.'
                    : 'Draft saved. Only you can see it until you submit.',
                )
                if (submitted) setEditing(false)
              }}
              onCancel={data.report?.submittedAt ? () => setEditing(false) : undefined}
            />
          ) : (
            data.report?.submittedAt && <Answers data={data} />
          )}
        </div>
        <div className="flex w-[356px] shrink-0 flex-col gap-4 max-lg:w-full">
          <Panel className="gap-0">
            <PanelHeader title={data.report?.submittedAt ? 'About this report' : 'This session'} />
            <DetailList
              items={[
                ...(data.report?.submittedAt
                  ? [
                      { label: 'Submitted by', value: data.report.author ?? '—' },
                      { label: 'Submitted', value: `${formatDay(data.report.submittedAt, timeZone)}, ${formatTime(data.report.submittedAt, timeZone)}` },
                    ]
                  : []),
                { label: 'Due', value: data.report?.submittedAt ? `${due} · ${data.report.onTime ? 'on time' : 'late'}` : due },
                { label: 'Attendance', value: s.attendance.recorded ? `${s.attendance.present} of ${s.attendance.expected} present` : 'Not recorded yet' },
                ...(data.can.write ? [{ label: 'Editable until', value: due }] : []),
              ]}
            />
            {paths.trainer && data.report?.submittedAt && !data.can.write && (
              <p className="pt-2 text-caption text-secondary">Locked — the due time has passed. Ask an admin if something needs correcting.</p>
            )}
          </Panel>
          <Panel className="gap-0">
            <PanelHeader title="Session" />
            <Link to={`${paths.session(s.id)}/attendance`} className="inline-flex items-center gap-1 pt-2 text-caption-strong text-brand-text hover:underline">
              Open attendance
              <ChevronRightIcon size={14} />
            </Link>
            <Link to={`${paths.session(s.id)}/feedback`} className="inline-flex items-center gap-1 pt-2 text-caption-strong text-brand-text hover:underline">
              Participant feedback · {plural(s.feedback, 'response')}
              <ChevronRightIcon size={14} />
            </Link>
          </Panel>
          {paths.trainer && <p className="text-caption text-secondary">Only admins see session reports. Participants never do.</p>}
        </div>
      </div>
    </>
  )
}

/** T5.02 / C3.02 Answers: every option shown, the chosen ones highlighted. */
function Answers({ data }: { data: ReportDetail }) {
  const answers = data.report!.answers
  return (
    <>
      {data.questions.length > 0 && (
        <Panel className="gap-0">
          <PanelHeader title="Answers" description="Questions set in Settings › Session reports." />
          {data.questions.map((q, i) => {
            const chosen = (q.id && answers[q.id]) || []
            return (
              <section key={q.id ?? i} className="flex flex-col gap-2 border-b border-default py-3 last:border-b-0">
                <p className="text-caption text-secondary">
                  Question {i + 1} · {q.multiple ? 'Multiple choice' : 'Single choice'}
                </p>
                <p className="text-body-strong text-primary">{q.prompt}</p>
                <ul className="flex flex-wrap gap-1.5" aria-label={`Answer to question ${i + 1}`}>
                  {q.options.map((o) => {
                    const on = chosen.includes(o)
                    return (
                      <li
                        key={o}
                        className={clsx(
                          'inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-caption',
                          on ? 'bg-info-bg text-info-fg' : 'bg-neutral-bg text-secondary',
                        )}
                        aria-label={on ? `${o} (chosen)` : o}
                      >
                        {on && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
                        {o}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </Panel>
      )}
      <Panel>
        <PanelHeader title="Written summary" />
        <p className="text-body whitespace-pre-line text-primary">{data.report!.summary}</p>
      </Panel>
    </>
  )
}

/** T5.01 Write session report. */
function ReportForm({ data, onDone, onCancel }: { data: ReportDetail; onDone: (submitted: boolean) => void; onCancel?: () => void }) {
  const save = useSaveReport(data.session.id)
  const [answers, setAnswers] = useState<Record<string, string[]>>(data.report?.answers ?? {})
  const [summary, setSummary] = useState(data.report?.summary ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [failed, setFailed] = useState<string | null>(null)
  const submitted = Boolean(data.report?.submittedAt)

  function choose(id: string, option: string, multiple: boolean) {
    setAnswers((a) => {
      const current = a[id] ?? []
      const next = multiple ? (current.includes(option) ? current.filter((x) => x !== option) : [...current, option]) : [option]
      return { ...a, [id]: next }
    })
    setErrors((e) => ({ ...e, [`answers.${id}`]: '' }))
  }

  async function send(submit: boolean) {
    const next: Record<string, string> = {}
    if (submit) {
      data.questions.forEach((q, i) => {
        if (q.id && !(answers[q.id]?.length ?? 0)) next[`answers.${q.id}`] = `Answer question ${i + 1}.`
      })
      if (!summary.trim()) next.summary = 'Write a short summary.'
    }
    setErrors(next)
    setFailed(null)
    if (Object.values(next).some(Boolean)) return
    try {
      await save.mutateAsync({ answers: Object.entries(answers).map(([questionId, choices]) => ({ questionId, choices })), summary, submit })
      onDone(submit)
    } catch (error) {
      if (error instanceof ApiError && Array.isArray(error.details))
        setErrors(Object.fromEntries((error.details as { field: string; message: string }[]).map((d) => [d.field, d.message])))
      else setFailed(error instanceof ApiError && error.status < 500 ? error.message : 'It wasn’t saved. Check your connection and try again.')
    }
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault()
        void send(true)
      }}
      noValidate
    >
      <Panel className="gap-0">
        <PanelHeader title="Questions" description="Set by your organisation. Answer every question." />
        {failed && (
          <div className="pt-3">
            <AlertBanner tone="error" title="Couldn’t save">
              {failed}
            </AlertBanner>
          </div>
        )}
        {data.questions.map((q, i) => {
          const error = q.id ? errors[`answers.${q.id}`] : undefined
          return (
            <fieldset key={q.id ?? i} className="flex flex-col gap-2 pt-4" aria-invalid={Boolean(error) || undefined}>
              <p className="text-caption text-secondary">
                Question {i + 1} · {q.multiple ? 'Multiple choice' : 'Single choice'}
              </p>
              <legend className="contents">
                <span className="text-body-strong text-primary">{q.prompt}</span>
              </legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                {q.options.map((o) =>
                  q.multiple ? (
                    <Checkbox key={o} label={o} checked={(answers[q.id!] ?? []).includes(o)} onChange={() => choose(q.id!, o, true)} />
                  ) : (
                    <label key={o} className="inline-flex cursor-pointer items-center gap-2 text-body text-primary">
                      <input
                        type="radio"
                        name={q.id!}
                        checked={(answers[q.id!] ?? []).includes(o)}
                        onChange={() => choose(q.id!, o, false)}
                        className="size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-strong bg-surface checked:border-[5px] checked:border-brand focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none"
                      />
                      {o}
                    </label>
                  ),
                )}
              </div>
              {error && <p className="text-caption text-error-fg">{error}</p>}
            </fieldset>
          )
        })}
        <div className="pt-5">
          <TextAreaField
            label="Written summary"
            placeholder="Summarise what you covered and anything the team should know."
            value={summary}
            maxLength={5000}
            rows={5}
            onChange={(e) => {
              setSummary(e.target.value)
              setErrors((x) => ({ ...x, summary: '' }))
            }}
            error={errors.summary || undefined}
            helper="Required."
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 max-md:flex-col-reverse max-md:[&>*]:h-11">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} disabled={save.isPending}>
              Cancel
            </Button>
          )}
          {!submitted && (
            <Button variant="secondary" onClick={() => void send(false)} disabled={save.isPending}>
              Save draft
            </Button>
          )}
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : submitted ? 'Save changes' : 'Submit report'}
          </Button>
        </div>
      </Panel>
    </form>
  )
}
