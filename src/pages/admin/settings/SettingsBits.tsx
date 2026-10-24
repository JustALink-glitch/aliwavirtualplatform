import { useId, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Panel, PanelHeader } from '@/components/ui/Page'
import { Switch } from '@/components/ui/Switch'

/** A section of a settings page: title, description, rows. */
export function SettingsSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Panel className="gap-0">
      <PanelHeader title={title} description={description} />
      <div className="mt-2 flex flex-col">{children}</div>
    </Panel>
  )
}

/** One setting: what it is on the left; its value and switch on the right (F1.05, F1.06). */
export function SettingRow({
  title,
  description,
  value,
  on,
  onToggle,
  always,
  disabled,
  error,
}: {
  title: string
  description?: string
  value?: ReactNode
  on?: boolean
  onToggle?: (on: boolean) => void
  /** Shown instead of a switch for things that can't be turned off. */
  always?: boolean
  disabled?: boolean
  error?: string
}) {
  return (
    <div className="flex items-center gap-4 border-b border-default py-3.5 last:border-b-0 max-md:flex-wrap">
      <div className={`flex min-w-0 flex-1 flex-col gap-0.5 ${value ? 'max-md:basis-full' : ''}`}>
        <span className="text-body-strong text-primary">{title}</span>
        {description && <span className="text-caption text-secondary">{description}</span>}
        {error && <span className="text-caption text-error-fg">{error}</span>}
      </div>
      {value}
      {always ? (
        <span className="rounded-full bg-neutral-bg px-2 py-0.5 text-caption-strong text-neutral-fg">Always on</span>
      ) : (
        onToggle && <Switch checked={Boolean(on)} onChange={onToggle} label={title} disabled={disabled} />
      )}
    </div>
  )
}

/** A small number box with its label above and a unit after the value ("At least 75%"). */
export function NumberBox({
  label,
  value,
  onChange,
  unit,
  disabled,
  invalid,
  name,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  unit?: string
  disabled?: boolean
  invalid?: boolean
  name: string
}) {
  const id = useId()
  return (
    <div className="flex w-[108px] flex-col gap-1 max-md:ml-auto">
      <label htmlFor={id} className="text-caption-strong text-primary">
        {label}
      </label>
      <span
        className={`flex h-9 items-center rounded-md border px-3 ${invalid ? 'border-error' : 'border-strong focus-within:border-focus focus-within:shadow-[var(--shadow-focus)]'} ${disabled ? 'bg-surface-hover text-disabled' : 'bg-surface'}`}
      >
        <input
          id={id}
          aria-label={`${name}: ${label}`}
          inputMode="numeric"
          value={value}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
          className="w-full min-w-0 bg-transparent text-body text-primary tabular-nums outline-none disabled:text-disabled"
        />
        {unit && <span className="text-body text-secondary">{unit}</span>}
      </span>
    </div>
  )
}

/** Discard / Save changes at the bottom of a settings page. */
export function SaveBar({ changed, saving, onDiscard }: { changed: boolean; saving: boolean; onDiscard: () => void }) {
  return (
    <div className="flex justify-end gap-3 max-md:flex-col-reverse max-md:[&>*]:h-11">
      <Button variant="secondary" onClick={onDiscard} disabled={!changed || saving}>
        Discard
      </Button>
      <Button type="submit" disabled={!changed || saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    </div>
  )
}
