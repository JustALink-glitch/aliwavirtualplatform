import { useState } from 'react'
import { ApiError } from '@/lib/api'

export type Notice = { tone: 'success' | 'warning' | 'error'; title: string; body?: string }

/** Saved value, draft, field errors and the banner — the same on every settings page. */
export function useSettingsForm<D>(initial: D) {
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<Notice | null>(null)
  const [saving, setSaving] = useState(false)
  const changed = JSON.stringify(draft) !== JSON.stringify(saved)

  const set = (patch: Partial<D>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setErrors({})
    setNotice(null)
  }

  const discard = () => {
    setDraft(saved)
    setErrors({})
    setNotice(null)
  }

  /** Runs the save; the draft becomes what the server answered. */
  async function save(run: () => Promise<D>, success: Notice) {
    setSaving(true)
    try {
      const next = await run()
      setSaved(next)
      setDraft(next)
      setNotice(success)
      return true
    } catch (error) {
      if (error instanceof ApiError && Array.isArray(error.details))
        setErrors(Object.fromEntries((error.details as { field: string; message: string }[]).map((d) => [d.field, d.message])))
      setNotice({ tone: 'error', title: error instanceof ApiError && error.status < 500 ? error.message : 'Your changes weren’t saved. Try again.' })
      return false
    } finally {
      setSaving(false)
    }
  }

  return { saved, draft, set, setDraft, errors, setErrors, notice, setNotice, saving, changed, discard, save }
}
