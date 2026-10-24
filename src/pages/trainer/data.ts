import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { todayIn } from '@/lib/format'
import { addDays, weekdayOf } from '@/lib/schedule'
import type { CohortSummary } from '@/pages/admin/programmes/data'
import type { Session } from '@/pages/admin/sessions/data'

export interface MyCohort {
  id: string
  name: string
  programme: string
  status: string
  startsOn: string
  endsOn: string
  course: { name: string; lead: boolean; held: number; planned: number | null }
  participants: number
  attendance: number | null
  nextSessionAt: string | null
}

export interface MyCohortDetail {
  timeZone: string
  cohort: CohortSummary
  flagged: number | null
  courses: {
    id: string
    courseId: string
    name: string
    plannedSessions: number | null
    heldSessions: number
    firstSessionAt: string | null
    mine: boolean
    trainers: { id: string; name: string; isLead: boolean }[]
  }[]
}

export const useMyCohorts = () =>
  useQuery({ queryKey: ['trainer', 'cohorts'], queryFn: ({ signal }) => api<{ timeZone: string; cohorts: MyCohort[] }>('/v1/trainer/cohorts', { signal }) })

export const useMyCohort = (id: string) =>
  useQuery({
    queryKey: ['trainer', 'cohort', id],
    queryFn: ({ signal }) => api<MyCohortDetail>(`/v1/trainer/cohorts/${id}`, { signal }),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  })

/** This week (Mon–Sun) and next, in the organisation's time zone, plus how far back "Past" reaches. */
export function weeks(timeZone?: string) {
  const today = todayIn(timeZone)
  const monday = addDays(today, 1 - weekdayOf(today))
  return {
    today,
    thisWeek: { from: monday, to: addDays(monday, 6) },
    nextWeek: { from: addDays(monday, 7), to: addDays(monday, 13) },
    pastFrom: addDays(monday, -84),
  }
}

/** The moment has passed (kept out of render for the purity rule). */
export const hasPassed = (value: string) => Date.parse(value) < Date.now()

/** Report state for a held session (T5): submitted, due, or overdue. */
export function reportState(s: Session): 'submitted' | 'due' | 'overdue' | null {
  if (s.status !== 'held') return null
  if (s.report.submittedAt) return 'submitted'
  return hasPassed(s.report.dueAt) ? 'overdue' : 'due'
}
