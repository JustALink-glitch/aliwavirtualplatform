import clsx from 'clsx'
import type { CSSProperties, InputHTMLAttributes, SelectHTMLAttributes } from 'react'
import { Filter } from 'lucide-react'
import { ChevronDownIcon, SearchIcon } from './icons'

/** Search field for a list toolbar (240px on desktop). */
export function SearchField({ className, width = 240, ...input }: InputHTMLAttributes<HTMLInputElement> & { 'aria-label': string; width?: number }) {
  return (
    <label
      className={clsx(
        'flex h-9 w-(--search-width) items-center gap-2 rounded-md border border-strong bg-surface px-3 focus-within:border-focus focus-within:shadow-[var(--shadow-focus)] max-md:w-full',
        className,
      )}
      style={{ '--search-width': `${width}px` } as CSSProperties}
    >
      <SearchIcon size={16} className="shrink-0 text-icon" />
      <input type="search" {...input} className="min-w-0 flex-1 bg-transparent text-body text-primary outline-none placeholder:text-muted" />
    </label>
  )
}

/**
 * Filter button for a list toolbar ("All cohorts", Figma: filter icon + label). A native select underneath,
 * sized to its value; the label is for screen readers.
 */
export function FilterSelect({ className, children, ...select }: SelectHTMLAttributes<HTMLSelectElement> & { 'aria-label': string }) {
  return (
    <div className={clsx('relative max-w-64 min-w-0 max-md:w-full max-md:max-w-none', className)}>
      <Filter aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-icon" />
      <select
        {...select}
        className="h-9 w-full min-w-32 cursor-pointer appearance-none truncate rounded-md border border-strong bg-surface pr-8 pl-9 text-label-button text-primary outline-none [field-sizing:content] hover:bg-surface-hover focus:border-focus focus:shadow-[var(--shadow-focus)] max-md:[field-sizing:fixed]"
      >
        {children}
      </select>
      <ChevronDownIcon size={14} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-icon" />
    </div>
  )
}
