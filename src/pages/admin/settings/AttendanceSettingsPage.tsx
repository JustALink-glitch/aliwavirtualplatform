import type { FormEvent } from 'react'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Badge, Panel, PanelHeader } from '@/components/ui/Page'
import { useAttendanceSettings, useSaveAttendanceSettings, type AttendanceSettings } from './data'
import { NumberBox, RadioList, SaveBar, SettingRow, SettingsLoader, SettingsSection } from './SettingsBits'
import { SettingsTitle } from './SettingsLayout'
import { useSettingsForm } from './settingsForm'

type Draft = {
  joinLinks: AttendanceSettings['joinLinks']
  presentMinPct: string
  late: { enabled: boolean; minutes: string }
  recordings: { shared: boolean; days: string }
  inPersonReminder: { enabled: boolean; hours: string }
}

const toDraft = (s: AttendanceSettings): Draft => ({
  joinLinks: s.joinLinks,
  presentMinPct: String(s.presentMinPct),
  late: { enabled: s.late.enabled, minutes: String(s.late.minutes) },
  recordings: { shared: s.recordings.shared, days: String(s.recordings.days) },
  inPersonReminder: { enabled: s.inPersonReminder.enabled, hours: String(s.inPersonReminder.hours) },
})

/** /admin/settings/attendance — F1.07 Attendance & Zoom. */
export function AttendanceSettingsPage() {
  const query = useAttendanceSettings()
  return (
    <>
      <SettingsTitle title="Attendance & Zoom" description="Online attendance comes from Zoom automatically. Trainers mark in-person sessions by hand." />
      <SettingsLoader query={query}>{(data) => <AttendanceForm settings={data.settings} />}</SettingsLoader>
    </>
  )
}

function AttendanceForm({ settings }: { settings: AttendanceSettings }) {
  const save = useSaveAttendanceSettings()
  const form = useSettingsForm(toDraft(settings))
  const { draft, set, errors } = form

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const missing: Record<string, string> = {}
    if (!draft.presentMinPct) missing.presentMinPct = 'Enter a percentage.'
    if (!draft.late.minutes) missing['late.minutes'] = 'Enter minutes.'
    if (!draft.recordings.days) missing['recordings.days'] = 'Enter days.'
    if (!draft.inPersonReminder.hours) missing['inPersonReminder.hours'] = 'Enter hours.'
    if (Object.keys(missing).length) return form.setErrors(missing)
    await form.save(
      async () =>
        toDraft(
          (
            await save.mutateAsync({
              joinLinks: draft.joinLinks,
              presentMinPct: Number(draft.presentMinPct),
              late: { enabled: draft.late.enabled, minutes: Number(draft.late.minutes) },
              recordings: { shared: draft.recordings.shared, days: Number(draft.recordings.days) },
              inPersonReminder: { enabled: draft.inPersonReminder.enabled, hours: Number(draft.inPersonReminder.hours) },
            })
          ).settings as AttendanceSettings,
        ),
      { tone: 'success', title: 'Attendance settings saved' },
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {form.notice && <AlertBanner tone={form.notice.tone} title={form.notice.title} />}

      <Panel aria-labelledby="zoom-title" className="gap-0">
        <PanelHeader id="zoom-title" title="Zoom" />
        <div className="flex items-center gap-3 border-b border-default py-3.5 max-md:flex-wrap">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <rect x="3" y="6" width="13" height="12" rx="2" />
              <path d="M16 10.5 21 7.5v9l-5-3" />
            </svg>
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-body-strong text-primary">
              {settings.zoom.connected ? `Connected to ${settings.zoom.email ?? 'Zoom'}` : 'Zoom isn’t connected yet'}
            </span>
            <span className="text-caption text-secondary">
              {settings.zoom.connected
                ? 'Attendance imports when each meeting ends.'
                : 'Connecting your organisation’s Zoom account comes in a later update. Until then, trainers mark attendance on the session register.'}
            </span>
          </div>
          <Badge tone={settings.zoom.connected ? 'success' : 'neutral'}>{settings.zoom.connected ? 'Connected' : 'Not connected'}</Badge>
        </div>
        <RadioList
          label="How participants join"
          value={draft.joinLinks}
          onChange={(joinLinks) => set({ joinLinks })}
          options={[
            {
              value: 'personal',
              label: 'A personal join link for each participant',
              help: 'Recommended. Zoom registers each participant, so attendance matches by email and rarely needs review. Links are emailed and shown on their session page.',
            },
            {
              value: 'shared',
              label: 'One shared link per session',
              help: 'Simpler, but anyone who joins with a different name or email lands in the review list.',
            },
          ]}
        />
      </Panel>

      <SettingsSection title="Counting attendance from Zoom">
        <SettingRow
          title="Present"
          description="In the meeting for at least this share of the session."
          error={errors.presentMinPct}
          value={
            <NumberBox
              name="Present"
              label="At least"
              unit="%"
              value={draft.presentMinPct}
              invalid={Boolean(errors.presentMinPct)}
              onChange={(presentMinPct) => set({ presentMinPct })}
            />
          }
          always
        />
        <SettingRow
          title="Mark late arrivals"
          description="Joined after this many minutes. Late still counts as present."
          error={errors['late.minutes']}
          value={
            <NumberBox
              name="Mark late arrivals"
              label="Minutes"
              value={draft.late.minutes}
              disabled={!draft.late.enabled}
              invalid={Boolean(errors['late.minutes'])}
              onChange={(minutes) => set({ late: { ...draft.late, minutes } })}
            />
          }
          on={draft.late.enabled}
          onToggle={(enabled) => set({ late: { ...draft.late, enabled } })}
        />
        <p className="pt-3 text-caption text-secondary">
          Participants are matched by email. Zoom attendees who can’t be matched go to a review list on the session. Personal join links make this rare.
        </p>
      </SettingsSection>

      <SettingsSection title="Session recordings" description="From Zoom cloud recording on your organisation’s account.">
        <SettingRow
          title="Share recordings with participants"
          description="They appear on the session page when Zoom finishes processing. Streaming only, no downloads."
          on={draft.recordings.shared}
          onToggle={(shared) => set({ recordings: { ...draft.recordings, shared } })}
        />
        <SettingRow
          title="Keep available for"
          description="Days after each session. Recordings stay in Zoom for admins after this."
          error={errors['recordings.days']}
          value={
            <NumberBox
              name="Keep available for"
              label="Days"
              value={draft.recordings.days}
              disabled={!draft.recordings.shared}
              invalid={Boolean(errors['recordings.days'])}
              onChange={(days) => set({ recordings: { ...draft.recordings, days } })}
            />
          }
        />
        <div className="pt-3">
          <AlertBanner tone="info" title="Participants are told sessions are recorded">
            A notice shows on every online session and in the welcome screen. Zoom also announces recording when it starts.
          </AlertBanner>
        </div>
      </SettingsSection>

      <SettingsSection title="In-person sessions" description="Trainers mark attendance by hand on the session register, on phone or desktop.">
        <SettingRow
          title="Remind the trainer"
          description="If attendance isn’t recorded within this many hours of the session ending."
          error={errors['inPersonReminder.hours']}
          value={
            <NumberBox
              name="Remind the trainer"
              label="Hours"
              value={draft.inPersonReminder.hours}
              disabled={!draft.inPersonReminder.enabled}
              invalid={Boolean(errors['inPersonReminder.hours'])}
              onChange={(hours) => set({ inPersonReminder: { ...draft.inPersonReminder, hours } })}
            />
          }
          on={draft.inPersonReminder.enabled}
          onToggle={(enabled) => set({ inPersonReminder: { ...draft.inPersonReminder, enabled } })}
        />
      </SettingsSection>

      <SettingsSection title="Edits">
        <SettingRow
          title="Admins and trainers can edit attendance"
          description="A reason is required and every edit is logged with who, when and why."
          always
        />
      </SettingsSection>

      <SaveBar changed={form.changed} saving={save.isPending} onDiscard={form.discard} />
    </form>
  )
}
