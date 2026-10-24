import clsx from 'clsx'

/** An attendance % in a table cell; "—" when nothing is recorded. Below 75% is the default flag line (§05). */
export function Percent({ value, threshold = 75 }: { value: number | null | undefined; threshold?: number }) {
  if (value === null || value === undefined) return <span className="text-muted">—</span>
  return <span className={clsx('text-body-strong tabular-nums', value < threshold ? 'text-warning-fg' : 'text-primary')}>{value}%</span>
}
