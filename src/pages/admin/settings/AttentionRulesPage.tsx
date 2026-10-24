import { useState, type FormEvent } from 'react'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Panel } from '@/components/ui/Page'
import { ApiError } from '@/lib/api'
import { plural } from '@/lib/format'
import { useAttentionRuleSettings, useSaveAttentionRules, type AttentionRuleSettings } from './data'
import { NumberBox, SaveBar, SettingRow, SettingsSection } from './SettingsBits'
import { SettingsTitle } from './SettingsLayout'

type Draft = {
  attendance: { enabled: boolean; belowPct: string }
  missedInRow: { enabled: boolean; count: string }
  overdue: { enabled: boolean; count: string }
  inactivity: { enabled: boolean; days: string }
  grade: { enabled: boolean; belowPct: string }
  trainersSee: boolean
  clearAutomatically: boolean
  trainersCanResolve: boolean
}

const toDraft = (s: AttentionRuleSettings): Draft => ({
  attendance: { enabled: s.attendance.enabled, belowPct: String(s.attendance.belowPct) },
  missedInRow: { enabled: s.missedInRow.enabled, count: String(s.missedInRow.count) },
  overdue: { enabled: s.overdue.enabled, count: String(s.overdue.count) },
  inactivity: { enabled: s.inactivity.enabled, days: String(s.inactivity.days) },
  grade: { enabled: s.grade.enabled, belowPct: String(s.grade.belowPct) },
  trainersSee: s.trainersSee,
  clearAutomatically: s.clearAutomatically,
  trainersCanResolve: s.trainersCanResolve,
})

type Signal = 'attendance' | 'missedInRow' | 'overdue' | 'inactivity' | 'grade'
const signals: { key: Signal; field: 'belowPct' | 'count' | 'days'; title: string; description: string; label: string; unit?: string }[] = [
  {
    key: 'attendance',
    field: 'belowPct',
    title: 'Low attendance',
    description: 'Present ÷ expected sessions in the cohort so far.',
    label: 'Below',
    unit: '%',
  },
  { key: 'missedInRow', field: 'count', title: 'Missed sessions in a row', description: 'Absent without an excuse.', label: 'At least' },
  { key: 'overdue', field: 'count', title: 'Overdue assignments', description: 'Not submitted after the due date.', label: 'At least' },
  { key: 'inactivity', field: 'days', title: 'No activity', description: 'No sign-in, attendance or submission.', label: 'Days' },
  { key: 'grade', field: 'belowPct', title: 'Low average grade', description: 'Across graded assignments, as a percentage.', label: 'Below', unit: '%' },
]

/** /admin/settings/attention-rules — F1.06 Needs attention rules. */
export function AttentionRulesPage() {
  const query = useAttentionRuleSettings()
  return (
    <>
      <SettingsTitle title="Needs attention rules" description="Which signals flag a participant, who sees the flag, and how it closes." />
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
        <RulesForm settings={query.data.settings} />
      )}
    </>
  )
}

function RulesForm({ settings }: { settings: AttentionRuleSettings }) {
  const save = useSaveAttentionRules()
  const [saved, setSaved] = useState(() => toDraft(settings))
  const [draft, setDraft] = useState(saved)
  const [flagged, setFlagged] = useState(settings.flaggedNow)
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
    const missing: Record<string, string> = {}
    for (const s of signals) if ((draft[s.key] as Record<string, string | boolean>)[s.field] === '') missing[`${s.key}.${s.field}`] = 'Enter a number.'
    setErrors(missing)
    if (Object.keys(missing).length) return
    try {
      const body = {
        ...draft,
        attendance: { ...draft.attendance, belowPct: Number(draft.attendance.belowPct) },
        missedInRow: { ...draft.missedInRow, count: Number(draft.missedInRow.count) },
        overdue: { ...draft.overdue, count: Number(draft.overdue.count) },
        inactivity: { ...draft.inactivity, days: Number(draft.inactivity.days) },
        grade: { ...draft.grade, belowPct: Number(draft.grade.belowPct) },
      }
      const result = await save.mutateAsync(body as unknown as AttentionRuleSettings)
      const next = toDraft(result.settings)
      setSaved(next)
      setDraft(next)
      setFlagged(result.settings.flaggedNow)
      setNotice({ tone: 'success', title: 'Rules saved' })
    } catch (error) {
      if (error instanceof ApiError && Array.isArray(error.details))
        setErrors(Object.fromEntries((error.details as { field: string; message: string }[]).map((d) => [d.field, d.message])))
      setNotice({ tone: 'error', title: error instanceof ApiError && error.status < 500 ? error.message : 'They weren’t saved. Try again.' })
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {notice ? (
        <AlertBanner tone={notice.tone} title={notice.title}>
          {notice.tone === 'success' && `With these rules, ${plural(flagged, 'participant is', 'participants are')} flagged now.`}
        </AlertBanner>
      ) : (
        <AlertBanner tone="info" title="Checked whenever Needs attention opens">
          With these rules, {plural(flagged, 'participant is', 'participants are')} flagged now. Changes apply from the next check.
        </AlertBanner>
      )}
      <SettingsSection title="Signals" description="A participant is flagged when any switched-on rule matches.">
        {signals.map((s) => {
          const current = draft[s.key] as { enabled: boolean } & Record<string, string | boolean>
          const error = errors[`${s.key}.${s.field}`]
          return (
            <SettingRow
              key={s.key}
              title={s.title}
              description={s.description}
              error={error}
              value={
                <NumberBox
                  name={s.title}
                  label={s.label}
                  unit={s.unit}
                  value={String(current[s.field])}
                  disabled={!current.enabled}
                  invalid={Boolean(error)}
                  onChange={(v) => set({ [s.key]: { ...current, [s.field]: v } } as Partial<Draft>)}
                />
              }
              on={current.enabled}
              onToggle={(enabled) => set({ [s.key]: { ...current, enabled } } as Partial<Draft>)}
            />
          )
        })}
      </SettingsSection>
      <SettingsSection title="Who sees flags">
        <SettingRow title="Admins" description="Always see every flag." always />
        <SettingRow
          title="The participant’s trainers"
          description="Only for participants in cohorts or courses they teach."
          on={draft.trainersSee}
          onToggle={(on) => set({ trainersSee: on, trainersCanResolve: on && draft.trainersCanResolve })}
        />
      </SettingsSection>
      <SettingsSection title="Closing a flag">
        <SettingRow
          title="Clear automatically"
          description="When no rule matches at the next check."
          on={draft.clearAutomatically}
          onToggle={(on) => set({ clearAutomatically: on })}
        />
        <SettingRow title="Admin resolves with a note" description="The note is kept on the participant’s record." always />
        <SettingRow
          title="Trainers can resolve with a note"
          description={draft.trainersSee ? undefined : 'Turn on “The participant’s trainers” first.'}
          on={draft.trainersCanResolve}
          disabled={!draft.trainersSee}
          onToggle={(on) => set({ trainersCanResolve: on })}
        />
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
