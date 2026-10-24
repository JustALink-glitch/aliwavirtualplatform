import { useState, type FormEvent } from 'react'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { CloseIcon, PlusIcon } from '@/components/ui/icons'
import { Panel } from '@/components/ui/Page'
import { TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/api'
import { CertificateCard } from '@/pages/admin/completion/CertificateCard'
import { useCompletionSettings, useSaveCompletionSettings, type CompletionSettings } from './data'
import { NumberBox, SaveBar, SettingRow, SettingsSection } from './SettingsBits'
import { SettingsTitle } from './SettingsLayout'

type Draft = {
  attendance: { enabled: boolean; minPct: string }
  submissions: { enabled: boolean; minPct: string }
  grade: { enabled: boolean; minPct: string }
  requiresApproval: boolean
  autoIssue: boolean
  signedBy: string
  certificateTitle: string
  defaultOutcomes: string[]
}

const toDraft = (s: CompletionSettings): Draft => ({
  attendance: { enabled: s.attendance.enabled, minPct: String(s.attendance.minPct) },
  submissions: { enabled: s.submissions.enabled, minPct: String(s.submissions.minPct) },
  grade: { enabled: s.grade.enabled, minPct: String(s.grade.minPct) },
  requiresApproval: s.requiresApproval,
  autoIssue: s.autoIssue,
  signedBy: s.signedBy,
  certificateTitle: s.certificateTitle,
  defaultOutcomes: s.defaultOutcomes,
})

/** /admin/settings/completion — F1.05 Completion & certificates. */
export function CompletionSettingsPage() {
  const query = useCompletionSettings()
  return (
    <>
      <SettingsTitle
        title="Completion & certificates"
        description="When a participant counts as completed, how certificates are issued, and which outcomes you track."
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
        <CompletionForm settings={query.data.settings} />
      )}
    </>
  )
}

function CompletionForm({ settings }: { settings: CompletionSettings }) {
  const save = useSaveCompletionSettings()
  // What's saved; moves forward after each save so the form never resets under the person.
  const [saved, setSaved] = useState(() => toDraft(settings))
  const [draft, setDraft] = useState(saved)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; title: string } | null>(null)
  const [adding, setAdding] = useState<string | null>(null)
  const changed = JSON.stringify(draft) !== JSON.stringify(saved)

  const set = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setErrors({})
    setNotice(null)
  }
  const criterion = (key: 'attendance' | 'submissions' | 'grade', patch: Partial<Draft['attendance']>) => set({ [key]: { ...draft[key], ...patch } })

  function addOption() {
    const label = (adding ?? '').trim()
    if (label && !draft.defaultOutcomes.some((o) => o.toLowerCase() === label.toLowerCase())) set({ defaultOutcomes: [...draft.defaultOutcomes, label] })
    setAdding(null)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const missing: Record<string, string> = {}
    for (const key of ['attendance', 'submissions', 'grade'] as const) if (draft[key].minPct === '') missing[`${key}.minPct`] = 'Enter a percentage.'
    if (!draft.certificateTitle.trim()) missing.certificateTitle = 'Enter a title.'
    setErrors(missing)
    if (Object.keys(missing).length) return
    try {
      const body = {
        ...draft,
        attendance: { ...draft.attendance, minPct: Number(draft.attendance.minPct) },
        submissions: { ...draft.submissions, minPct: Number(draft.submissions.minPct) },
        grade: { ...draft.grade, minPct: Number(draft.grade.minPct) },
      }
      const result = await save.mutateAsync(body as unknown as CompletionSettings)
      const next = toDraft(result.settings)
      setSaved(next)
      setDraft(next)
      setNotice({ tone: 'success', title: 'Settings saved' })
    } catch (error) {
      if (error instanceof ApiError && Array.isArray(error.details))
        setErrors(Object.fromEntries((error.details as { field: string; message: string }[]).map((d) => [d.field, d.message])))
      setNotice({ tone: 'error', title: error instanceof ApiError && error.status < 500 ? error.message : 'They weren’t saved. Try again.' })
    }
  }

  const sample = settings.sample
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {notice && <AlertBanner tone={notice.tone} title={notice.title} />}
      <SettingsSection
        title="Participant completion"
        description="A participant completes a cohort when they meet every criterion you switch on. Cohorts complete on their end date."
      >
        <SettingRow
          title="Minimum attendance"
          description="Present ÷ expected sessions. Excused counts as not present."
          error={errors['attendance.minPct']}
          value={
            <NumberBox
              name="Minimum attendance"
              label="At least"
              unit="%"
              value={draft.attendance.minPct}
              disabled={!draft.attendance.enabled}
              invalid={Boolean(errors['attendance.minPct'])}
              onChange={(v) => criterion('attendance', { minPct: v })}
            />
          }
          on={draft.attendance.enabled}
          onToggle={(enabled) => criterion('attendance', { enabled })}
        />
        <SettingRow
          title="Assignments submitted"
          description="Share of assignments submitted by the end date."
          error={errors['submissions.minPct']}
          value={
            <NumberBox
              name="Assignments submitted"
              label="At least"
              unit="%"
              value={draft.submissions.minPct}
              disabled={!draft.submissions.enabled}
              invalid={Boolean(errors['submissions.minPct'])}
              onChange={(v) => criterion('submissions', { minPct: v })}
            />
          }
          on={draft.submissions.enabled}
          onToggle={(enabled) => criterion('submissions', { enabled })}
        />
        <SettingRow
          title="Minimum average grade"
          description="Across graded assignments, converted to a percentage."
          error={errors['grade.minPct']}
          value={
            <NumberBox
              name="Minimum average grade"
              label="At least"
              unit="%"
              value={draft.grade.minPct}
              disabled={!draft.grade.enabled}
              invalid={Boolean(errors['grade.minPct'])}
              onChange={(v) => criterion('grade', { minPct: v })}
            />
          }
          on={draft.grade.enabled}
          onToggle={(enabled) => criterion('grade', { enabled })}
        />
        <SettingRow
          title="Admin approval"
          description="An admin confirms each completion before a certificate is issued."
          on={draft.requiresApproval}
          onToggle={(on) => set({ requiresApproval: on, autoIssue: on ? false : draft.autoIssue })}
        />
      </SettingsSection>

      <SettingsSection title="Certificates">
        <fieldset className="flex flex-col gap-3 border-b border-default pt-2 pb-4">
          <legend className="pb-3 text-body-strong text-primary">Issuing</legend>
          {(
            [
              {
                value: false,
                label: draft.requiresApproval ? 'Admin issues after approval' : 'An admin issues them',
                help: 'Eligible participants appear in Certificates for review.',
              },
              {
                value: true,
                label: 'Issue automatically when criteria are met',
                help: 'Certificates are issued when the cohort ends, and each person is emailed.',
              },
            ] as const
          ).map((option) => (
            <label key={option.label} className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="issuing"
                checked={draft.autoIssue === option.value}
                onChange={() => set({ autoIssue: option.value, requiresApproval: option.value ? false : true })}
                className="mt-px size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-strong bg-surface checked:border-[5px] checked:border-brand focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-body text-primary">{option.label}</span>
                {draft.autoIssue === option.value && <span className="text-caption text-secondary">{option.help}</span>}
              </span>
            </label>
          ))}
        </fieldset>
        <div className="grid grid-cols-2 gap-3 pt-4 max-md:grid-cols-1">
          <TextField
            label="Signed by"
            placeholder="Name, Title"
            value={draft.signedBy}
            maxLength={160}
            onChange={(e) => set({ signedBy: e.target.value })}
            error={errors.signedBy}
          />
          <TextField
            label="Certificate title"
            value={draft.certificateTitle}
            maxLength={80}
            onChange={(e) => set({ certificateTitle: e.target.value })}
            error={errors.certificateTitle}
          />
        </div>
        <div className="mt-3">
          <CertificateCard
            preview
            certificate={{
              code: '',
              title: draft.certificateTitle.trim() || 'Certificate of Completion',
              participant: { name: sample?.name ?? 'Participant name' },
              programme: sample?.programme ?? 'Your programme',
              cohort: { id: '', name: sample?.cohort ?? 'Cohort', endsOn: sample?.endsOn ?? '2026-12-18' },
              organisation: settings.organisation,
              signedBy: draft.signedBy.trim() || null,
            }}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Default outcome options" description="Each programme can edit its own list. These are the defaults for new programmes.">
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {draft.defaultOutcomes.map((label) => (
            <span key={label} className="inline-flex h-8 items-center gap-1 rounded-md border border-default bg-surface pr-1 pl-3 text-body text-primary">
              {label}
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={() => set({ defaultOutcomes: draft.defaultOutcomes.filter((o) => o !== label) })}
                className="flex size-6 items-center justify-center rounded-sm text-icon-muted hover:bg-surface-hover hover:text-primary"
              >
                <CloseIcon size={12} />
              </button>
            </span>
          ))}
          {adding === null ? (
            <button
              type="button"
              onClick={() => setAdding('')}
              className="inline-flex h-8 items-center gap-1.5 px-2 text-label-button text-brand-text hover:underline"
            >
              <PlusIcon size={16} />
              Add option
            </button>
          ) : (
            <input
              autoFocus
              aria-label="New outcome option"
              placeholder="e.g. Apprenticeship"
              value={adding}
              maxLength={80}
              onChange={(e) => setAdding(e.target.value)}
              onBlur={addOption}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addOption()
                }
                if (e.key === 'Escape') setAdding(null)
              }}
              className="h-8 w-[200px] rounded-md border border-strong bg-surface px-3 text-body text-primary outline-none focus:border-focus focus:shadow-[var(--shadow-focus)]"
            />
          )}
        </div>
        {errors.defaultOutcomes && <p className="pt-2 text-caption text-error-fg">{errors.defaultOutcomes}</p>}
      </SettingsSection>

      <SaveBar
        changed={changed}
        saving={save.isPending}
        onDiscard={() => {
          setDraft(saved)
          setErrors({})
        }}
      />
    </form>
  )
}
