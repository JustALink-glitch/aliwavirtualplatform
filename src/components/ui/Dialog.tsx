import clsx from 'clsx'
import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * Dialog (§09 Overlays): radius 16, 24px padding, title + description, body, actions on the right.
 * Uses the native <dialog> so focus is trapped and Escape closes it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  width = 520,
  children,
  actions,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  width?: 440 | 520
  children?: ReactNode
  actions: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (event.target === event.currentTarget) onClose()
      }}
      style={{ width }}
      className={clsx(
        'm-auto max-w-[calc(100vw-32px)] rounded-xl bg-surface p-0 text-primary shadow-[var(--shadow-dialog)]',
        'backdrop:bg-scrim max-md:mb-0 max-md:w-full! max-md:max-w-full max-md:rounded-b-none',
      )}
    >
      {open && (
        <div className="flex flex-col gap-4 p-6 max-md:p-4">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-heading-group text-primary">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-body text-secondary">
                {description}
              </p>
            )}
          </div>
          {children}
          <div className="flex justify-end gap-3 pt-2 max-md:flex-col-reverse max-md:[&>*]:h-11 max-md:[&>*]:w-full">{actions}</div>
        </div>
      )}
    </dialog>
  )
}
