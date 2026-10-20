import clsx from 'clsx'
import type { ReactNode } from 'react'
import { InfoCircleIcon } from './icons'

const tones = {
  info: { box: 'border-info bg-info-bg', title: 'text-info-fg' },
  success: { box: 'border-success bg-success-bg', title: 'text-success-fg' },
  warning: { box: 'border-warning bg-warning-bg', title: 'text-warning-fg' },
  error: { box: 'border-error bg-error-bg', title: 'text-error-fg' },
}

/** Alert banner (Figma 17:396), four tones. */
export function AlertBanner({
  tone = 'info',
  title,
  children,
}: {
  tone?: keyof typeof tones
  title: string
  children?: ReactNode
}) {
  const style = tones[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={clsx('flex w-full items-start gap-3 rounded-md border py-3 pr-3 pl-4', style.box)}
    >
      <InfoCircleIcon size={18} className={clsx('shrink-0', style.title)} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-body">
        <p className={clsx('text-body-strong', style.title)}>{title}</p>
        {children && <div className="text-primary">{children}</div>}
      </div>
    </div>
  )
}
