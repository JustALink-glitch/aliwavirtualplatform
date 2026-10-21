import clsx from 'clsx'

const tones = [
  'bg-brand-subtle text-brand-text',
  'bg-success-bg text-success-fg',
  'bg-warning-bg text-warning-fg',
  'bg-info-bg text-info-fg',
  'bg-neutral-bg text-neutral-fg',
] as const

/** A stable tone per person, so the same trainer keeps the same colour everywhere. */
function toneFor(seed: string): string {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return tones[Math.abs(hash) % tones.length]!
}

/** Avatar (Figma 13:70). 24px in table rows, 32px in the top bar and lists. */
export function Avatar({ initials, seed, size = 24, className }: { initials: string; seed?: string; size?: 24 | 32; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium select-none',
        size === 24 ? 'size-6 text-[11px] leading-[14px]' : 'size-8 text-caption-strong',
        seed ? toneFor(seed) : tones[0],
        className,
      )}
    >
      {initials}
    </span>
  )
}
