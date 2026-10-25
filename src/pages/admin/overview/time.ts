import { todayIn } from '@/lib/format'

/** "today", "yesterday", "5 days ago" — when a flag was raised (O1.01). */
export function daysAgo(value: string): string {
  const days = Math.floor((Date.now() - Date.parse(value)) / 86400000)
  return days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`
}

export { todayIn }
