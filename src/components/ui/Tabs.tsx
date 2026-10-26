import clsx from 'clsx'
import { NavLink } from 'react-router'

/** Tabs (A3.02): 40px, 13 Medium, brand underline on the current tab, optional count pill. */
export function Tabs({ label, items }: { label: string; items: { label: string; to: string; count?: number; end?: boolean }[] }) {
  return (
    <nav aria-label={label} className="-mb-px flex gap-1 overflow-x-auto border-b border-default">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            clsx(
              'flex h-10 shrink-0 items-center gap-1.5 border-b-2 px-1 text-body-strong whitespace-nowrap transition-colors focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none',
              isActive ? 'border-brand text-brand-text' : 'border-transparent text-secondary hover:text-primary',
            )
          }
        >
          {item.label}
          {item.count !== undefined && (
            <span className="rounded-full bg-neutral-bg px-1.5 text-[11px] leading-[14px] font-medium text-neutral-fg">{item.count}</span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

/** Same look as Tabs, for sections inside one page (B1.04): buttons, not links. */
export function TabButtons<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string
  items: { value: T; label: string; count?: number }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div role="tablist" aria-label={label} className="-mb-px flex gap-4 overflow-x-auto border-b border-default">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          onClick={() => onChange(item.value)}
          className={clsx(
            'flex h-10 shrink-0 items-center gap-1.5 border-b-2 px-1 text-body-strong whitespace-nowrap transition-colors focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none',
            item.value === value ? 'border-brand text-brand-text' : 'border-transparent text-secondary hover:text-primary',
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="rounded-full bg-neutral-bg px-1.5 text-[11px] leading-[14px] font-medium text-neutral-fg">{item.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
