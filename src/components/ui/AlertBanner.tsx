import clsx from 'clsx'
import type { ReactNode } from 'react'
import { InfoCircleIcon, InfoTriangleIcon } from './icons'

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
  // Errors and warnings use the triangle (S1.04x); info and success use the circle.
  const Icon = tone === 'error' || tone === 'warning' ? InfoTriangleIcon : InfoCircleIcon
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={clsx('flex w-full items-start gap-3 rounded-md border py-3 pr-3 pl-4', style.box)}
    >
      <Icon size={18} className={clsx('shrink-0', style.title)} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-body">
        <p className={clsx('text-body-strong', style.title)}>{title}</p>
        {children && <div className="text-primary">{children}</div>}
      </div>
    </div>
  )
}
