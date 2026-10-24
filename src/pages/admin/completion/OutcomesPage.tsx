import { useState, type FormEvent } from 'react'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { ChartIcon, PlusIcon } from '@/components/ui/icons'
import { Badge, EmptyState, Panel, PanelHeader } from '@/components/ui/Page'
import { Cell, Row, Table, type Column } from '@/components/ui/Table'
import { SelectField, TextAreaField, TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/api'
import { formatDate, plural, todayIn } from '@/lib/format'
import { initials } from '@/lib/people'
import { useOutcomes, useRecordOutcome, type OutcomesResponse } from './data'
import { ParticipantsHeader } from './ParticipantsHeader'

const columns: Column[] = [{ label: 'Participant' }, { label: 'Outcome', width: 170 }, { label: 'Details', hideBelow: 'lg' }, { label: 'Date', width: 120 }]

const tones = ['success', 'info', 'neutral'] as const
const toneFor = (data: OutcomesResponse, optionId: string) =>
  tones[
    Math.max(
      0,
      data.options.findIndex((o) => o.id === optionId),
    ) % tones.length
  ]!

/** /admin/participants/outcomes — D3.01 Outcomes. */
export function OutcomesPage() {
  const [programmeId, setProgrammeId] = useState('')
  const [cohortId, setCohortId] = useState('')
  const [recording, setRecording] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const query = useOutcomes(programmeId, cohortId)
  const data = query.data
  const canRecord = Boolean(data?.people.length && data.options.length)

  return (
    <>
      <ParticipantsHeader
        actions={
          <Button
            icon={<PlusIcon size={16} />}
            disabled={!canRecord}
            title={canRecord ? undefined : 'No one has completed yet'}
            onClick={() => setRecording(true)}
          >
            Record outcome
          </Button>
        }
      />
      {notice && <AlertBanner tone="success" title={notice} />}
      {query.isPending ? (
        <Panel aria-busy="true" aria-label="Loading outcomes" className="h-[240px]">
          <span className="sr-only">Loading outcomes</span>
        </Panel>
      ) : query.isError ? (
        <Panel>
          <StatePanel
            kind="error"
            title="Couldn’t load outcomes"
            description="Check your connection and try again."
            action={{ label: 'Try again', onClick: () => void query.refetch() }}
          />
        </Panel>
      ) : !data!.programmeId ? (
        <Panel className="py-12">
          <EmptyState
            icon={<ChartIcon size={24} />}
            title="No programmes yet"
            body="Outcomes are tracked per programme. Create a programme and choose which outcomes it tracks."
          />
        </Panel>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 max-md:flex-col">
            <div className="w-[268px] max-md:w-full">
              <SelectField
                label="Programme"
                value={data!.programmeId}
                onChange={(e) => {
                  setProgrammeId(e.target.value)
                  setCohortId('')
                }}
              >
                {data!.programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="w-[216px] max-md:w-full">
              <SelectField label="Cohort" value={cohortId} onChange={(e) => setCohortId(e.target.value)}>
                <option value="">All completed cohorts</option>
                {data!.cohorts.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>
          <OutcomesBody data={data!} />
        </>
      )}
      {data && recording && (
        <RecordOutcomeDialog
          data={data}
          onClose={() => setRecording(false)}
          onSaved={(name) => {
            setRecording(false)
            setNotice(`Outcome recorded for ${name}`)
          }}
        />
      )}
    </>
  )
}

function OutcomesBody({ data }: { data: OutcomesResponse }) {
  const programme = data.programmes.find((p) => p.id === data.programmeId)
  return (
    <div className="grid grid-cols-[296px_minmax(0,1fr)] items-start gap-4 max-lg:grid-cols-1">
      <Panel className="gap-0">
        <PanelHeader
          title="By outcome"
          description={
            data.completed
              ? `For ${plural(data.completed, 'person', 'people')} who completed. Options come from the programme.`
              : 'No one in this programme has completed yet.'
          }
        />
        {data.options.length === 0 ? (
          <p className="py-4 text-body text-secondary">{programme?.name} doesn’t track any outcomes. Choose them when you edit the programme.</p>
        ) : (
          <dl className="mt-2">
            {[...data.options.map((o) => ({ label: o.label, count: o.count })), { label: 'Not recorded yet', count: data.notRecorded }].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 border-b border-default py-3 last:border-b-0">
                <dt className="text-body text-primary">{row.label}</dt>
                <dd className="text-body-strong text-primary tabular-nums">{row.count}</dd>
              </div>
            ))}
          </dl>
        )}
      </Panel>
      <Panel className="gap-0 max-md:py-2">
        <PanelHeader title="Recorded outcomes" />
        {data.outcomes.length === 0 ? (
          <p role="status" className="py-6 text-body text-secondary">
            {data.completed
              ? 'Nothing recorded yet. When you hear what someone did after completing, record it here.'
              : 'Outcomes can be recorded once people complete the programme.'}
          </p>
        ) : (
          <>
            <div className="mt-2 max-md:hidden">
              <Table columns={columns}>
                {data.outcomes.map((o) => (
                  <Row key={o.id} to={`/admin/participants/${o.participant.id}`}>
                    <Cell>
                      <span className="flex min-w-0 items-center gap-3">
                        <Avatar initials={initials(o.participant.name)} seed={o.participant.id} />
                        <span className="truncate text-body-strong text-primary">{o.participant.name}</span>
                      </span>
                    </Cell>
                    <Cell>
                      <Badge tone={toneFor(data, o.option.id)}>{o.option.label}</Badge>
                    </Cell>
                    <Cell hideBelow="lg" className="truncate">
                      {details(o) || <span className="text-muted">—</span>}
                    </Cell>
                    <Cell className="tabular-nums">{o.achievedOn ? formatDate(o.achievedOn) : <span className="text-muted">—</span>}</Cell>
                  </Row>
                ))}
              </Table>
            </div>
            <ul className="mt-1 md:hidden">
              {data.outcomes.map((o) => (
                <li key={o.id} className="flex items-start gap-3 border-b border-default py-3 last:border-b-0">
                  <Avatar size={32} initials={initials(o.participant.name)} seed={o.participant.id} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-body-strong text-primary">{o.participant.name}</span>
                      <Badge tone={toneFor(data, o.option.id)}>{o.option.label}</Badge>
                    </span>
                    <span className="text-caption text-secondary">{[details(o), o.achievedOn && formatDate(o.achievedOn)].filter(Boolean).join(' · ')}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  )
}

const details = (o: OutcomesResponse['outcomes'][number]) => [o.organisationName, o.roleTitle].filter(Boolean).join(' · ') || o.notes || ''

type Errors = Partial<Record<'enrolmentId' | 'optionId' | 'achievedOn' | 'organisationName' | 'roleTitle' | 'notes', string>>

/** D3.02 Record outcome. */
export function RecordOutcomeDialog({ data, onClose, onSaved }: { data: OutcomesResponse; onClose: () => void; onSaved: (name: string) => void }) {
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const today = todayIn(timeZone)
  const record = useRecordOutcome()
  const programme = data.programmes.find((p) => p.id === data.programmeId)
  // People without an outcome first.
  const people = [...data.people].sort((a, b) => Number(a.recorded) - Number(b.recorded))
  const [enrolmentId, setEnrolmentId] = useState(people[0]?.enrolmentId ?? '')
  const [optionId, setOptionId] = useState(data.options[0]?.id ?? '')
  const [organisationName, setOrganisationName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [achievedOn, setAchievedOn] = useState(today)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [failed, setFailed] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!achievedOn) return setErrors({ achievedOn: 'Enter a date.' })
    setErrors({})
    setFailed(null)
    try {
      await record.mutateAsync({ enrolmentId, optionId, organisationName, roleTitle, achievedOn, notes })
      onSaved(people.find((p) => p.enrolmentId === enrolmentId)?.name ?? 'them')
    } catch (error) {
      if (error instanceof ApiError && Array.isArray(error.details))
        setErrors(Object.fromEntries((error.details as { field: string; message: string }[]).map((d) => [d.field, d.message])))
      else setFailed(error instanceof ApiError && error.status < 500 ? error.message : 'It wasn’t saved. Try again.')
    }
  }

  return (
    <Dialog
      open
      onClose={() => !record.isPending && onClose()}
      title="Record outcome"
      description="What a participant did after completing. Only admins see outcomes."
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={record.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="record-outcome" disabled={record.isPending}>
            {record.isPending ? 'Saving…' : 'Save outcome'}
          </Button>
        </>
      }
    >
      <form id="record-outcome" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {failed && (
          <AlertBanner tone="error" title="Couldn’t save">
            {failed}
          </AlertBanner>
        )}
        <SelectField label="Participant" value={enrolmentId} onChange={(e) => setEnrolmentId(e.target.value)} error={errors.enrolmentId}>
          {people.map((p) => (
            <option key={p.enrolmentId} value={p.enrolmentId}>
              {p.name} · {p.cohort}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Outcome"
          value={optionId}
          onChange={(e) => setOptionId(e.target.value)}
          error={errors.optionId}
          helper={`Options come from ${programme?.name ?? 'the programme'}.`}
        >
          {data.options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <TextField
            label="Organisation"
            optional
            value={organisationName}
            maxLength={120}
            onChange={(e) => setOrganisationName(e.target.value)}
            error={errors.organisationName}
          />
          <TextField label="Role" optional value={roleTitle} maxLength={120} onChange={(e) => setRoleTitle(e.target.value)} error={errors.roleTitle} />
        </div>
        <TextField label="Started" type="date" max={today} value={achievedOn} onChange={(e) => setAchievedOn(e.target.value)} error={errors.achievedOn} />
        <TextAreaField
          label="Note"
          optional
          placeholder="Add how you heard about it"
          value={notes}
          maxLength={1000}
          onChange={(e) => setNotes(e.target.value)}
          error={errors.notes}
        />
      </form>
    </Dialog>
  )
}
