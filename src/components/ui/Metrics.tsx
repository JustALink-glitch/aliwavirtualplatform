import type { ReactNode } from 'react'

export interface Metric {
  label: string
  value: ReactNode
  context: ReactNode
  icon: ReactNode
}

/** Metric strip (A1.02, A3.02): one panel, four metrics separated by dividers. */
export function Metrics({ items }: { items: Metric[] }) {
  return (
    <section
      aria-label="Summary"
      // 1px gaps over the border colour draw the dividers in every layout (4 → 2 → 1 columns).
      className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-default bg-default shadow-[0_1px_2px_rgb(15_23_41/0.04),0_4px_12px_-2px_rgb(15_23_41/0.03)] max-lg:grid-cols-2 max-md:grid-cols-1"
    >
      {items.map((item) => (
        <div key={item.label} className="flex gap-3 bg-surface px-5 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-icon-brand">{item.icon}</span>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-caption-strong text-secondary">{item.label}</span>
            <span className="text-metric-large text-primary">{item.value}</span>
            <span className="text-caption text-secondary">{item.context}</span>
          </div>
        </div>
      ))}
    </section>
  )
}
