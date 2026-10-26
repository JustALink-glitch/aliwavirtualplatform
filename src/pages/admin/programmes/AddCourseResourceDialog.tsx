import clsx from 'clsx'
import { useState, type DragEvent, type FormEvent } from 'react'
import { useAuth } from '@/auth/useAuth'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Choice'
import { Dialog } from '@/components/ui/Dialog'
import { DownloadIcon } from '@/components/ui/icons'
import { SelectField, TextField } from '@/components/ui/TextField'
import { ApiError } from '@/lib/api'
import { fileSize, uploadFile } from '@/lib/files'
import { formatDay } from '@/lib/format'
import { useAddCourseResource, type CourseDetail } from './data'

const stripExtension = (name: string) => name.replace(/\.[^.]+$/, '')

/** A2.04 Add a resource: for every cohort that runs the course, or on one session. */
export function AddCourseResourceDialog({ data, onClose, onAdded }: { data: CourseDetail; onClose: () => void; onAdded: (name: string) => void }) {
  const { course: c } = data
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const add = useAddCourseResource(c.id)
  const [kind, setKind] = useState<'file' | 'link'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [participants, setParticipants] = useState(true)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [failed, setFailed] = useState<string | null>(null)
  // Upcoming sessions first: that's usually where a new resource belongs.
  const sessions = data.sessions.filter((s) => s.status !== 'cancelled')

  function choose(f: File | undefined) {
    if (!f) return
    setFile(f)
    setErrors({})
    if (!name.trim()) setName(stripExtension(f.name))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (kind === 'file' && !file) next.path = 'Choose a file.'
    if (kind === 'link' && !/^https?:\/\/\S+$/.test(url.trim())) next.url = 'Paste the full link, starting with https://'
    const title = name.trim() || (file ? stripExtension(file.name) : '')
    if (!title) next.name = 'Enter a title.'
    setErrors(next)
    setFailed(null)
    if (Object.keys(next).length) return
    setBusy(true)
    try {
      const path = kind === 'file' ? await uploadFile(`/v1/courses/${c.id}/resources/uploads`, file!) : undefined
      await add.mutateAsync({ kind, name: title, ...(kind === 'link' ? { url: url.trim() } : { path }), sessionId: sessionId || null, visible: participants })
      onAdded(title)
    } catch (error) {
      if (error instanceof ApiError && Array.isArray(error.details))
        setErrors(Object.fromEntries((error.details as { field: string; message: string }[]).map((d) => [d.field, d.message])))
      else setFailed(error instanceof Error ? error.message : 'It wasn’t added. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    choose(e.dataTransfer.files[0])
  }

  return (
    <Dialog
      open
      onClose={() => !busy && onClose()}
      title="Add a resource"
      description={`Shared with everyone in cohorts that run ${c.name}.`}
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="add-course-resource" disabled={busy}>
            {busy ? (kind === 'file' ? 'Uploading…' : 'Adding…') : 'Add resource'}
          </Button>
        </>
      }
    >
      <form id="add-course-resource" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {failed && <AlertBanner tone="error" title={failed} />}
        <div role="radiogroup" aria-label="Kind" className="flex gap-1.5">
          {(['file', 'link'] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => {
                setKind(k)
                setErrors({})
              }}
              className={clsx(
                'h-7 rounded-full border px-3 text-caption-strong transition-colors focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none',
                kind === k ? 'border-transparent bg-surface-selected text-brand-text' : 'border-default bg-surface text-secondary hover:text-primary',
              )}
            >
              {k === 'file' ? 'File' : 'Link'}
            </button>
          ))}
        </div>
        {kind === 'file' ? (
          <div className="flex flex-col gap-1.5">
            <label
              onDragOver={(e) => {
                e.preventDefault()
                setOver(true)
              }}
              onDragLeave={() => setOver(false)}
              onDrop={drop}
              className={clsx(
                'flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed px-4 py-6 text-center transition-colors focus-within:shadow-[var(--shadow-focus)]',
                errors.path ? 'border-error' : over ? 'border-brand bg-brand-subtle' : 'border-strong bg-canvas hover:bg-surface-hover',
              )}
            >
              <DownloadIcon size={20} className="text-icon-brand" />
              <span className="text-body-strong text-primary">{file ? file.name : 'Drop a file here, or browse'}</span>
              <span className="text-caption text-secondary">
                {file ? fileSize(file.size) : 'PDF, slides, documents, spreadsheets, images or video · up to 25 MB'}
              </span>
              <input type="file" className="sr-only" aria-label="Choose a file" onChange={(e) => choose(e.target.files?.[0])} />
            </label>
            {errors.path && <p className="text-caption text-error-fg">{errors.path}</p>}
          </div>
        ) : (
          <TextField label="Link" type="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} error={errors.url} />
        )}
        <TextField
          label="Title"
          value={name}
          maxLength={200}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          helper={kind === 'file' ? 'Defaults to the file name.' : undefined}
        />
        <SelectField
          label="Attach to a session"
          optional
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          error={errors.sessionId}
          helper={sessionId ? 'Only that session’s cohort sees it, on that session.' : 'Every cohort that runs the course sees it.'}
        >
          <option value="">No — the whole course</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {formatDay(s.startsAt, timeZone)} · {s.cohort}
            </option>
          ))}
        </SelectField>
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1 text-caption-strong text-primary">Visible to</legend>
          <Checkbox label="Participants" checked={participants} onChange={(e) => setParticipants(e.target.checked)} />
          <Checkbox label="Trainers" checked disabled />
        </fieldset>
      </form>
    </Dialog>
  )
}
