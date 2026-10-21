import { formatDate, plural } from '@/lib/format'
import type { CohortStatus, CohortSummary, DeliveryMode } from './data'

export const cohortStatusLabel: Record<CohortStatus, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
  completed: 'Completed',
  draft: 'Draft',
  archived: 'Archived',
}

export const deliveryOptions: { value: DeliveryMode; label: string }[] = [
  { value: 'in_person', label: 'In person' },
  { value: 'online', label: 'Online' },
  { value: 'both', label: 'Both' },
]

/** "Online", "Yaba hub", "Online and Yaba hub". */
export function deliveryLabel(mode: DeliveryMode, location: string | null): string {
  if (mode === 'online') return 'Online'
  if (mode === 'in_person') return location ?? 'In person'
  return location ? `Online and ${location}` : 'Online and in person'
}

/** Delivery cell (A1.02, A3.01): "6 of 30 sessions", or when it starts. */
export function deliverySummary(cohort: Pick<CohortSummary, 'status' | 'startsOn' | 'plannedSessions' | 'heldSessions'>): string {
  if (cohort.status === 'upcoming') return `Starts ${formatDate(cohort.startsOn)}`
  if (cohort.plannedSessions === 0) return 'No sessions planned'
  return `${cohort.heldSessions} of ${plural(cohort.plannedSessions, 'session')}`
}

/** "3 courses · Python, SQL, Machine Learning". */
export function coursesSummary(names: string[]): string {
  if (names.length === 0) return 'No courses added yet'
  return `${plural(names.length, 'course')} · ${names.join(', ')}`
}
