import clsx from 'clsx'
import type { CSSProperties, InputHTMLAttributes } from 'react'
import { SearchIcon } from './icons'

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
