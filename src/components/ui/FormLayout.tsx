import type { ReactNode } from 'react'
import { Panel } from './Page'

/** Form page body (A1.03, A3.07): 640px form panel, 356px aside on wide screens. */
export function FormLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-start gap-6 max-lg:flex-col max-lg:gap-4">
      <div className="w-[640px] max-w-full min-w-0">{children}</div>
      {aside && <aside className="w-[356px] max-w-full min-w-0 shrink-0 max-lg:w-[640px]">{aside}</aside>}
    </div>
  )
}

/** A titled group of fields inside the form panel. */
export function FormSection({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="contents">
        <span className="text-heading-section text-primary">{title}</span>
      </legend>
      {description && <p className="-mt-1 text-caption text-secondary">{description}</p>}
      {children}
    </fieldset>
  )
}

/** "After you create it" — numbered next steps (A1.03, A3.07). */
export function NextSteps({ title, steps }: { title: string; steps: { title: string; description: string }[] }) {
  return (
    <Panel>
      <h2 className="text-heading-section text-primary">{title}</h2>
      <ol className="flex flex-col gap-3 pt-1">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-caption-strong text-brand-text">
              {index + 1}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-body-strong text-primary">{step.title}</span>
              <span className="text-caption text-secondary">{step.description}</span>
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  )
}

/** Label / value rows (A1.02 "Programme details"). */
export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl>
      {items.map((item) => (
        <div key={item.label} className="flex gap-4 border-b border-default py-2.5 last:border-b-0">
          <dt className="w-40 shrink-0 text-body text-secondary max-md:w-32">{item.label}</dt>
          <dd className="min-w-0 text-body-strong break-words text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
