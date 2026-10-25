import { useState, type FormEvent } from 'react'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { RadioGroup } from '@/components/ui/Choice'
import { CloseIcon, PencilIcon, PlusIcon } from '@/components/ui/icons'
import { Panel } from '@/components/ui/Page'
import { TextAreaField, TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/api'
import { useReportSettings, useSaveReportSettings, type ReportSettings, type ReportSettingsQuestion } from './data'
import { NumberBox, SaveBar, SettingRow, SettingsSection } from './SettingsBits'
import { SettingsTitle } from './SettingsLayout'

type Draft = Omit<ReportSettings, 'dueHours'> & { dueHours: string }

const toDraft = (s: ReportSettings): Draft => ({ ...s, dueHours: String(s.dueHours) })

/** /admin/settings/session-reports — F1.08 Session reports. */
export function SessionReportSettingsPage() {
  const query = useReportSettings()
  return (
    <>
      <SettingsTitle
        title="Session reports"
        description="Trainers submit a short report after every session: your multiple-choice questions plus a written summary."
      />
      {query.isPending ? (
        <Panel aria-busy="true" aria-label="Loading settings" className="h-[320px]">
          <span className="sr-only">Loading settings</span>
        </Panel>
      ) : query.isError ? (
        <Panel>
          <StatePanel
            kind="error"
            title="Couldn’t load these settings"
            description="Check your connection and try again."
            action={{ label: 'Try again', onClick: () => void query.refetch() }}
          />
        </Panel>
      ) : (
        <ReportSettingsForm settings={query.data.settings} />
      )}
    </>
  )
}

function ReportSettingsForm({ settings }: { settings: ReportSettings }) {
  const save = useSaveReportSettings()
  const [saved, setSaved] = useState(() => toDraft(settings))
  const [draft, setDraft] = useState(saved)
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; title: string } | null>(null)
  const changed = JSON.stringify(draft) !== JSON.stringify(saved)

  const set = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setErrors({})
    setNotice(null)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!draft.dueHours) return setErrors({ dueHours: 'Enter a number of hours.' })
    try {
      const result = await save.mutateAsync({ ...draft, dueHours: Number(draft.dueHours) })
      const next = toDraft(result.settings)
      setSaved(next)
      setDraft(next)
      setEditing(null)
      setNotice({ tone: 'success', title: 'Settings saved. New questions apply to reports not yet submitted.' })
    } catch (error) {
      if (error instanceof ApiError && Array.isArray(error.details))
        setErrors(Object.fromEntries((error.details as { field: string; message: string }[]).map((d) => [d.field, d.message])))
      setNotice({ tone: 'error', title: error instanceof ApiError && error.status < 500 ? error.message : 'They weren’t saved. Try again.' })
    }
  }

  const questionError = (i: number) => Object.entries(errors).find(([k]) => k.startsWith(`questions.${i}`))?.[1]

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {notice && <AlertBanner tone={notice.tone} title={notice.title} />}
      <SettingsSection title="When it’s due">
        <SettingRow
          title="Due after the session ends"
          description="Hours after the session’s end time."
          error={errors.dueHours}
          value={
            <NumberBox
              name="Due after the session ends"
              label="Hours"
              value={draft.dueHours}
              invalid={Boolean(errors.dueHours)}
              onChange={(v) => set({ dueHours: v })}
            />
          }
          always
        />
        <SettingRow
          title="Remind the trainer"
          description="Two hours before the report is due, once emails are set up."
          on={draft.remind}
          onToggle={(on) => set({ remind: on })}
        />
        <SettingRow title="Show overdue reports on the overview" on={draft.overdueOnOverview} onToggle={(on) => set({ overdueOnOverview: on })} />
      </SettingsSection>

      <SettingsSection title="Multiple-choice questions" description="Shown in this order. Trainers must answer every question.">
        <ul className="flex flex-col gap-2 pt-2">
          {draft.questions.map((q, i) =>
            editing === i ? (
              <li key={q.id ?? `new-${i}`}>
                <QuestionEditor
                  initial={q}
                  onCancel={() => setEditing(null)}
                  onSave={(next) => {
                    set({ questions: draft.questions.map((x, j) => (j === i ? { ...next, id: x.id } : x)) })
                    setEditing(null)
                  }}
                />
              </li>
            ) : (
              <li key={q.id ?? `new-${i}`} className="flex flex-col gap-2 rounded-md bg-canvas p-4">
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-caption text-secondary">
                    Question {i + 1} · {q.multiple ? 'Multiple choice' : 'Single choice'}
                  </p>
                  <button
                    type="button"
                    aria-label={`Edit question ${i + 1}`}
                    onClick={() => setEditing(i)}
                    className="flex size-8 items-center justify-center rounded-md text-icon hover:bg-surface-hover"
                  >
                    <PencilIcon size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove question ${i + 1}`}
                    onClick={() => set({ questions: draft.questions.filter((_, j) => j !== i) })}
                    className="flex size-8 items-center justify-center rounded-md text-icon hover:bg-surface-hover"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
                <p className="text-body-strong text-primary">{q.prompt}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {q.options.map((o) => (
                    <li key={o} className="inline-flex h-7 items-center rounded-full border border-default bg-surface px-3 text-caption text-primary">
                      {o}
                    </li>
                  ))}
                </ul>
                {questionError(i) && <p className="text-caption text-error-fg">{questionError(i)}</p>}
              </li>
            ),
          )}
          {editing === 'new' && (
            <li>
              <QuestionEditor
                initial={{ id: null, prompt: '', multiple: false, options: [] }}
                onCancel={() => setEditing(null)}
                onSave={(next) => {
                  set({ questions: [...draft.questions, next] })
                  setEditing(null)
                }}
              />
            </li>
          )}
        </ul>
        {draft.questions.length === 0 && editing === null && <p className="py-2 text-body text-secondary">No questions. Trainers only write a summary.</p>}
        {editing === null && draft.questions.length < 10 && (
          <div className="pt-3">
            <Button variant="secondary" icon={<PlusIcon size={16} />} onClick={() => setEditing('new')}>
              Add question
            </Button>
          </div>
        )}
      </SettingsSection>

      <SettingsSection title="Written summary">
        <SettingRow title="Required" description="Prompt: “Summarise what you covered and anything the team should know.”" always />
      </SettingsSection>

      <SaveBar
        changed={changed && editing === null}
        saving={save.isPending}
        onDiscard={() => {
          setDraft(saved)
          setEditing(null)
          setErrors({})
        }}
      />
    </form>
  )
}

/** Add or change one question: the prompt, single or multiple choice, and one option per line. */
function QuestionEditor({ initial, onSave, onCancel }: { initial: ReportSettingsQuestion; onSave: (q: ReportSettingsQuestion) => void; onCancel: () => void }) {
  const [prompt, setPrompt] = useState(initial.prompt)
  const [multiple, setMultiple] = useState(initial.multiple ? 'multiple' : 'single')
  const [options, setOptions] = useState(initial.options.join('\n'))
  const [errors, setErrors] = useState<{ prompt?: string; options?: string }>({})

  function apply() {
    const list = options
      .split('\n')
      .map((o) => o.trim())
      .filter(Boolean)
    const next = {
      prompt: prompt.trim() ? undefined : 'Write the question.',
      options:
        list.length < 2
          ? 'Give at least two options, one per line.'
          : list.length > 10
            ? 'Keep it to 10 options.'
            : new Set(list.map((o) => o.toLowerCase())).size !== list.length
              ? 'Each option must be different.'
              : undefined,
    }
    setErrors(next)
    if (next.prompt || next.options) return
    onSave({ id: initial.id, prompt: prompt.trim(), multiple: multiple === 'multiple', options: list })
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-brand-border p-4">
      <TextField label="Question" value={prompt} maxLength={200} autoFocus onChange={(e) => setPrompt(e.target.value)} error={errors.prompt} />
      <div className="flex flex-col gap-2">
        <span className="text-caption-strong text-primary">Answer</span>
        <RadioGroup
          label="Answer"
          options={[
            { value: 'single', label: 'Single choice' },
            { value: 'multiple', label: 'Multiple choice' },
          ]}
          value={multiple}
          onChange={setMultiple}
        />
      </div>
      <TextAreaField
        label="Options"
        rows={4}
        value={options}
        onChange={(e) => setOptions(e.target.value)}
        error={errors.options}
        helper="One per line, 2 to 10."
      />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={apply}>
          {initial.prompt ? 'Done' : 'Add question'}
        </Button>
      </div>
    </div>
  )
}
