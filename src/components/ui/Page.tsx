import clsx from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRightIcon } from './icons'

/** Page header (§09 Layout): optional breadcrumb, title (+ badge), description, actions on the right. */
export function PageHeader({
  title,
  badge,
  description,
  breadcrumb,
  actions,
}: {
  title: string
  badge?: ReactNode
  description?: ReactNode
  breadcrumb?: { label: string; to?: string }[]
  actions?: ReactNode
}) {
  return (
    <header className="flex items-end gap-4 max-md:flex-col max-md:items-stretch max-md:gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {breadcrumb && (
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-body text-secondary">
              {breadcrumb.map((crumb, index) => (
                <li key={crumb.label} className="flex min-w-0 items-center gap-1.5">
                  {index > 0 && <ChevronRightIcon size={12} className="shrink-0 text-icon-muted" />}
                  {crumb.to ? (
                    <Link to={crumb.to} className="truncate hover:text-primary hover:underline">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="truncate">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-page-title break-words text-primary">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-body text-secondary max-md:text-body-large">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2 max-md:[&>*]:h-11 max-md:[&>*]:flex-1">{actions}</div>}
    </header>
  )
}

/** Panel: the one container the designs use for tables, lists and sections (radius 12, Elevation/1). */
export function Panel({ className, children, ...props }: { className?: string; children: ReactNode } & HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...props}
      className={clsx(
        'flex flex-col gap-2 rounded-lg border border-default bg-surface px-panel py-4',
        'shadow-[0_1px_2px_rgb(15_23_41/0.04),0_4px_12px_-2px_rgb(15_23_41/0.03)]',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function PanelHeader({ title, description, id }: { title: string; description?: string; id?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 id={id} className="text-heading-section text-primary">
        {title}
      </h2>
      {description && <p className="text-caption text-secondary">{description}</p>}
    </div>
  )
}

/** State panel · Empty (§09): icon tile, title, body, actions. */
export function EmptyState({
  icon,
  title,
  body,
  actions,
}: {
  icon: ReactNode
  title: string
  body: ReactNode
  actions?: ReactNode
}) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 p-8 text-center max-md:px-2">
      <span className="flex size-12 items-center justify-center rounded-lg bg-brand-subtle text-icon-brand">{icon}</span>
      <h2 className="text-heading-section text-primary">{title}</h2>
      <p className="max-w-[520px] text-body text-secondary">{body}</p>
      {actions && <div className="flex flex-wrap justify-center gap-2 pt-2">{actions}</div>}
    </div>
  )
}

const badgeTones = {
  success: 'bg-success-bg text-success-fg',
  neutral: 'bg-neutral-bg text-neutral-fg',
  warning: 'bg-warning-bg text-warning-fg',
  error: 'bg-error-bg text-error-fg',
  info: 'bg-info-bg text-info-fg',
}

/** Badge (status): dot + label, 22px. */
export function Badge({ tone, children }: { tone: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full px-2 text-caption-strong whitespace-nowrap', badgeTones[tone])}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

/** Filter chips (single choice) with counts, as on B2.01. */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string; count?: number }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={clsx(
              'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-caption-strong transition-colors',
              'focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none',
              selected ? 'bg-brand-subtle text-brand-text' : 'border border-default bg-surface text-secondary hover:bg-surface-hover',
            )}
          >
            {option.label}
            {option.count !== undefined && <span className={selected ? 'text-brand-text' : 'text-muted'}>{option.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
