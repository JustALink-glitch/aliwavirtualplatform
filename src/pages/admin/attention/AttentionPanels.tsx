import { useState, type FormEvent } from 'react'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { RadioGroup } from '@/components/ui/Choice'
import { Dialog } from '@/components/ui/Dialog'
import { DetailList } from '@/components/ui/FormLayout'
import { CheckCircleIcon } from '@/components/ui/icons'
import { Badge, Panel, PanelHeader } from '@/components/ui/Page'
import { SelectField, TextAreaField, TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/api'
import { formatDate, formatDay, formatTime, plural } from '@/lib/format'
import {
  describeFlag,
  methodLabel,
  nowIn,
  outcomeLabel,
  outcomeTone,
  ruleLabel,
  useRecordIntervention,
  useResolveFlags,
  type Method,
  type Outcome,
  type ParticipantAttention,
} from './data'

/** D1.02 "Why Amara is flagged": each matched rule with its evidence. */
export function WhyFlaggedPanel({ firstName, data }: { firstName: string; data: ParticipantAttention }) {
  return (
    <Panel aria-labelledby="why-title" className="gap-3">
      <PanelHeader id="why-title" title={`Why ${firstName} is flagged`} description={`${plural(data.flags.length, 'rule')} matched. Rechecked whenever Needs attention is opened; rules are provisional.`} />
      <ul className="flex flex-col">
        {data.flags.map((f) => {
          const what = describeFlag(f, data.timeZone)
          return (
            <li key={f.id} className="flex items-start gap-4 border-b border-default py-3 last:border-b-0 max-md:flex-col max-md:gap-1.5">
              <span className="w-28 shrink-0">
                <Badge tone={f.rule === 'inactive' ? 'neutral' : 'warning'}>{ruleLabel[f.rule]}</Badge>
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-body-strong text-primary">{what.title}</span>
                <span className="text-caption text-secondary">{what.detail}</span>
              </span>
              <span className="shrink-0 text-caption text-secondary">Since {formatDay(f.raisedAt, data.timeZone)}</span>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

/** D1.02 Interventions panel: who contacted them, how, and what happened. */
export function InterventionsPanel({ data, onRecord }: { data: ParticipantAttention; onRecord: () => void }) {
  return (
    <Panel aria-labelledby="interventions-title" className="gap-2">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <PanelHeader id="interventions-title" title="Interventions" description="Who was contacted and the outcome. Not visible to the participant." />
        </div>
        <button type="button" onClick={onRecord} className="text-caption-strong text-brand-text hover:underline">
          Record
        </button>
      </div>
      {data.interventions.length === 0 ? (
        <p className="py-1 text-body text-secondary">No contact recorded yet.</p>
      ) : (
        <ul>
          {data.interventions.map((i) => (
            <li key={i.id} className="flex flex-col gap-0.5 border-b border-default py-2.5 last:border-b-0">
              <span className="flex items-center justify-between gap-2">
                <span className="text-body-strong text-primary">{methodLabel[i.method]}</span>
                <Badge tone={outcomeTone[i.outcome]}>{outcomeLabel[i.outcome]}</Badge>
              </span>
              <span className="text-caption text-secondary">
                {i.by ? `${i.by.name}${i.by.trainer ? ' (trainer)' : ''}` : 'Someone who has left'} · {formatDay(i.at, data.timeZone)}, {formatTime(i.at, data.timeZone)}
              </span>
              {i.notes && <span className="line-clamp-3 text-body text-primary">{i.notes}</span>}
              {i.reviewOn && <span className="text-caption text-secondary">Review again on {formatDate(i.reviewOn, { year: true })}</span>}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/** D1.02 Flag status, with "Resolve flag" for admins. */
export function FlagStatusPanel({ data, onResolve }: { data: ParticipantAttention; onResolve: () => void }) {
  const opened = data.flags.map((f) => f.raisedAt).sort()[0]
  return (
    <Panel aria-labelledby="flag-status-title" className="gap-2">
      <PanelHeader id="flag-status-title" title="Flag status" />
      <DetailList
        items={[
          ...(opened ? [{ label: 'Opened', value: formatDay(opened, data.timeZone) }] : []),
          { label: 'Next review', value: data.nextReview ? formatDate(data.nextReview, { year: true }) : <span className="font-normal text-muted">Not set</span> },
          { label: 'Resolution', value: <span className="font-normal">Clears automatically when the rules stop matching, or an admin resolves it with a note.</span> },
        ]}
      />
      {data.canResolve ? (
        <Button variant="secondary" icon={<CheckCircleIcon size={16} />} onClick={onResolve}>
          Resolve flag
        </Button>
      ) : (
        <p className="text-caption text-secondary">Only admins resolve flags. Record what you did and they’ll review it.</p>
      )}
    </Panel>
  )
}

const methods: { value: Method; label: string }[] = [
  { value: 'call', label: 'Phone call' },
  { value: 'email', label: 'Email' },
  { value: 'message', label: 'Message' },
  { value: 'visit', label: 'In person' },
]

/** D1.03 / T7.03 Record intervention. */
export function RecordInterventionDialog({
  memberId,
  name,
  cohortName,
  timeZone,
  onClose,
  onSaved,
}: {
  memberId: string
  name: string
  cohortName: string
  timeZone?: string
  onClose: () => void
  onSaved: () => void
}) {
  const record = useRecordIntervention(memberId)
  const [initial] = useState(() => nowIn(timeZone))
  const [method, setMethod] = useState<Method>('call')
  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)
  const [notes, setNotes] = useState('')
  const [outcome, setOutcome] = useState<Outcome>('reached')
  const [reviewOn, setReviewOn] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [failed, setFailed] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next = { notes: notes.trim() ? undefined : 'Say what was discussed and agreed.', date: date ? undefined : 'Choose a date.' }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    setFailed(null)
    try {
      await record.mutateAsync({ method, date, time, notes, outcome, reviewOn: reviewOn || null })
      onSaved()
    } catch (error) {
      if (error instanceof ApiError && Array.isArray(error.details)) setErrors(Object.fromEntries((error.details as { field: string; message: string }[]).map((d) => [d.field, d.message])))
      else setFailed(error instanceof ApiError && error.status < 500 ? error.message : 'It wasn’t saved. Try again.')
    }
  }

  return (
    <Dialog
      open
      onClose={() => !record.isPending && onClose()}
      width={520}
      title="Record intervention"
      description={`For ${name} · ${cohortName}`}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={record.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="record-intervention" disabled={record.isPending}>
            {record.isPending ? 'Saving…' : 'Save intervention'}
          </Button>
        </>
      }
    >
      <form id="record-intervention" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {failed && (
          <AlertBanner tone="error" title="Couldn’t save">
            {failed}
          </AlertBanner>
        )}
        <div className="flex flex-col gap-2">
          <span className="text-caption-strong text-primary">How did you contact them?</span>
          <RadioGroup label="How did you contact them?" options={methods} value={method} onChange={setMethod} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Date" type="date" max={initial.date} value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />
          <TextField label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} error={errors.time} />
        </div>
        <TextAreaField
          label="What was discussed and agreed?"
          value={notes}
          maxLength={2000}
          onChange={(e) => {
            setNotes(e.target.value)
            setErrors((p) => ({ ...p, notes: undefined }))
          }}
          error={errors.notes}
          helper={`Visible to admins and ${name.split(' ')[0]}’s trainers. Never shown to the participant.`}
        />
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <SelectField label="Outcome" value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)} helper="Outcome names are provisional.">
            {(['awaiting_response', 'reached', 'resolved', 'no_response'] as const).map((o) => (
              <option key={o} value={o}>
                {outcomeLabel[o]}
              </option>
            ))}
          </SelectField>
          <TextField label="Review again on" optional type="date" min={initial.date} value={reviewOn} onChange={(e) => setReviewOn(e.target.value)} error={errors.reviewOn} helper="A reminder; the flag stays open." />
        </div>
      </form>
    </Dialog>
  )
}

/** D1.02 Resolve flag: admins close the open flags with a note. */
export function ResolveFlagDialog({ memberId, firstName, data, onClose, onDone }: { memberId: string; firstName: string; data: ParticipantAttention; onClose: () => void; onDone: () => void }) {
  const resolve = useResolveFlags(memberId)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!note.trim()) return setError('Add a note. It’s kept with the flag.')
    try {
      await resolve.mutateAsync(note)
      onDone()
    } catch (err) {
      setError(err instanceof ApiError && err.status < 500 ? err.message : 'It wasn’t resolved. Try again.')
    }
  }

  return (
    <Dialog
      open
      onClose={() => !resolve.isPending && onClose()}
      width={440}
      title={`Resolve ${firstName}’s flag`}
      description={`The flag closes now. If ${firstName} stops matching and then matches a rule again, a new flag opens.`}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={resolve.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="resolve-flag" disabled={resolve.isPending}>
            {resolve.isPending ? 'Resolving…' : 'Resolve flag'}
          </Button>
        </>
      }
    >
      <form id="resolve-flag" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-caption-strong text-primary">Matched rules</span>
          <div className="flex flex-wrap gap-1.5">
            {[...new Set(data.flags.map((f) => ruleLabel[f.rule]))].map((label) => (
              <Badge key={label} tone="warning">
                {label}
              </Badge>
            ))}
          </div>
        </div>
        <TextAreaField
          label="Note"
          autoFocus
          value={note}
          maxLength={1000}
          onChange={(e) => {
            setNote(e.target.value)
            setError(null)
          }}
          error={error}
          helper={`Required. Visible to admins and ${firstName}’s trainers.`}
        />
        {data.interventions.length > 0 && <p className="text-caption text-secondary">{plural(data.interventions.length, 'intervention is', 'interventions are')} already logged.</p>}
      </form>
    </Dialog>
  )
}
