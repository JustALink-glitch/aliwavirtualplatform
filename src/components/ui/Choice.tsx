import clsx from 'clsx'
import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

/** Checkbox (16px box, radius 4, brand when checked) with a 13px label. */
export function Checkbox({ label, className, ...input }: { label: ReactNode } & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return (
    <label className={clsx('inline-flex w-fit cursor-pointer items-center gap-2 text-body text-primary has-disabled:cursor-not-allowed has-disabled:text-disabled', className)}>
      <input
        type="checkbox"
        {...input}
        className="peer size-4 shrink-0 cursor-pointer appearance-none rounded-xs border border-strong bg-surface checked:border-brand checked:bg-brand focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundImage: input.checked
            ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='white' d='M19.31 5.77C19.72 5.39 20.35 5.41 20.73 5.81C21.11 6.22 21.09 6.85 20.69 7.23L9.04 18.23C8.65 18.59 8.05 18.59 7.67 18.23L3.31 14.12C2.91 13.74 2.89 13.1 3.27 12.7C3.65 12.3 4.29 12.28 4.69 12.66L8.35 16.12L19.31 5.77Z'/%3E%3C/svg%3E\")"
            : undefined,
          backgroundSize: '12px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {label}
    </label>
  )
}

/** Radio group laid out in a row (A3.07 Delivery). */
export function RadioGroup<T extends string>({
  label,
  description,
  options,
  value,
  onChange,
}: {
  label: string
  description?: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  const name = useId()
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">{label}</legend>
      {description && <p className="text-caption text-secondary">{description}</p>}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {options.map((option) => (
          <label key={option.value} className="inline-flex cursor-pointer items-center gap-2 text-body text-primary">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-strong bg-surface checked:border-[5px] checked:border-brand focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
