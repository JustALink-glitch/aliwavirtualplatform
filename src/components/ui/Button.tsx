import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * Button (Figma 10:121). One Primary per view.
 * md = 36px (default control), lg = 44px (onboarding actions on T1/P1).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'lg'
  icon?: ReactNode
  fullWidth?: boolean
}) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'inline-flex items-center justify-center rounded-md text-label-button whitespace-nowrap transition-colors',
        'focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        size === 'md' ? 'h-9 gap-1.5 pr-4 pl-3' : 'h-11 gap-2 pr-5 pl-4',
        variant === 'primary'
          ? 'bg-brand text-on-brand enabled:hover:bg-brand-hover'
          : 'border border-strong bg-surface text-primary enabled:hover:bg-surface-hover',
        fullWidth && 'w-full',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}
