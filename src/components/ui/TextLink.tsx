import clsx from 'clsx'
import { Link, type LinkProps } from 'react-router'

/** Link (Figma 14:98): Caption/Strong in brand text colour. */
export function TextLink({ className, ...props }: LinkProps) {
  return (
    <Link
      {...props}
      className={clsx('rounded-xs text-caption-strong text-brand-text hover:underline focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none', className)}
    />
  )
}

/** "Already have an account? Sign in" — Body secondary text followed by a link. */
export function Prompt({ text, to, label }: { text: string; to: LinkProps['to']; label: string }) {
  return (
    <p className="flex items-center gap-1.5 text-body text-secondary">
      {text}
      <TextLink to={to}>{label}</TextLink>
    </p>
  )
}
