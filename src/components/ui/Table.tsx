import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

export interface Column {
  label: string
  /** Fixed width in px; the first flexible column takes the rest. */
  width?: number
  align?: 'right'
  /** Hide below this breakpoint to keep the table readable on tablets. */
  hideBelow?: 'lg' | 'xl'
}

const hide = { lg: 'max-lg:hidden', xl: 'max-xl:hidden' }

/**
 * Data table (§09): subtle header row (32px, 12 Medium), rows with a bottom border, 10px/12px padding.
 * Rows open their `to` link when clicked; the first cell should hold a real <Link> for keyboards.
 */
export function Table({ columns, children, className }: { columns: Column[]; children: ReactNode; className?: string }) {
  return (
    <table className={clsx('w-full table-fixed border-separate border-spacing-0', className)}>
      <thead>
        <tr className="bg-surface-subtle">
          {columns.map((column, index) => (
            <th
              key={column.label || index}
              scope="col"
              style={column.width ? { width: column.width } : undefined}
              className={clsx(
                'h-8 px-3 text-left text-caption-strong font-medium whitespace-nowrap text-secondary',
                index === 0 && 'rounded-l-sm',
                index === columns.length - 1 && 'rounded-r-sm',
                column.align === 'right' && 'text-right',
                column.hideBelow && hide[column.hideBelow],
              )}
            >
              {column.label || <span className="sr-only">Actions</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  )
}

export function Row({ to, children }: { to?: string; children: ReactNode }) {
  const navigate = useNavigate()
  return (
    <tr
      onClick={to ? () => navigate(to) : undefined}
      className={clsx(
        '[&>td]:border-b [&>td]:border-default [&>td]:px-3 [&>td]:py-2.5 [&>td]:align-middle last:[&>td]:border-b-0',
        to && 'cursor-pointer hover:bg-surface-hover',
      )}
    >
      {children}
    </tr>
  )
}

export function Cell({ children, align, hideBelow, className }: { children: ReactNode; align?: 'right'; hideBelow?: 'lg' | 'xl'; className?: string }) {
  return <td className={clsx('text-body text-primary', align === 'right' && 'text-right tabular-nums', hideBelow && hide[hideBelow], className)}>{children}</td>
}

/** Two-line cell: 13 Medium primary over 12 Regular secondary. */
export function Stacked({ primary, secondary, muted }: { primary: ReactNode; secondary?: ReactNode; muted?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className={clsx('truncate text-body-strong', muted ? 'text-muted' : 'text-primary')}>{primary}</span>
      {secondary && <span className="truncate text-caption text-secondary">{secondary}</span>}
    </div>
  )
}

/** Table footer: summary on the left, page count and arrows on the right. */
export function TableFooter({
  summary,
  page,
  pageCount,
  onPage,
}: {
  summary: ReactNode
  page: number
  pageCount: number
  onPage: (page: number) => void
}) {
  const button =
    'inline-flex size-9 items-center justify-center rounded-md border border-default bg-surface text-icon enabled:hover:bg-surface-hover disabled:text-disabled focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none'
  return (
    <footer className="flex h-[52px] items-center gap-2 border-t border-default max-md:h-auto max-md:pt-3">
      <p className="flex-1 text-caption text-secondary">{summary}</p>
      <p className="text-caption-strong text-primary">
        Page {page} of {pageCount}
      </p>
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className={button}>
        <ChevronLeftIcon size={16} />
      </button>
      <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPage(page + 1)} className={button}>
        <ChevronRightIcon size={16} />
      </button>
    </footer>
  )
}
