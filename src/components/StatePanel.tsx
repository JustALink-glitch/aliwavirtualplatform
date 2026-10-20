import { CircleAlert, Inbox, Lock, SearchX } from 'lucide-react'

const icons = { empty: Inbox, 'no-results': SearchX, error: CircleAlert, restricted: Lock }

/** State panel (§09 Feedback & system): Empty, No results, Error, Restricted. */
export function StatePanel({
  kind,
  title,
  description,
  action,
}: {
  kind: keyof typeof icons
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  const Icon = icons[kind]
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className="mx-auto flex max-w-sm flex-col items-center px-4 py-16 text-center">
      <Icon aria-hidden className="mb-3 size-6 text-icon-muted" />
      <h2 className="text-heading-section text-primary">{title}</h2>
      {description && <p className="mt-1 text-body text-secondary">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 h-9 rounded-md border border-strong bg-surface px-3 text-label-button text-primary hover:bg-surface-hover"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
