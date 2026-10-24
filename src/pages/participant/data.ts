import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Criterion, Scale, SubmissionType } from '@/pages/assignments/data'

export type MyStatus = 'not_submitted' | 'overdue' | 'closed' | 'submitted' | 'late' | 'graded'

export interface MyAssignment {
  id: string
  title: string
  course: { id: string; name: string }
  cohort: { id: string; name: string }
  trainer: string | null
  dueAt: string
  status: MyStatus
  submittedAt: string | null
  gradingScale: Scale
  maxPoints: number | null
  scaleLabel: string
  grade: string | null
  gradedAt: string | null
}

export interface MyAssignmentDetail extends MyAssignment {
  brief: string | null
  submissionTypes: SubmissionType[]
  latePolicy: 'accept_late' | 'closed'
  links: { name: string; url: string }[]
  files: { id: string; name: string; size: number }[]
  criteria: Criterion[]
  canSubmit: boolean
  cantSubmitBecause: 'graded' | 'replace_closed' | 'closed' | 'enrolment' | null
}

export interface MySubmission {
  submittedAt: string
  late: boolean
  text: string | null
  link: string | null
  note: string | null
  files: { id: string; name: string; size: number; type: string | null }[]
}

export interface MyGrade {
  display: string | null
  feedback: string | null
  rubric: { criterionId: string; score: number }[]
  gradedAt: string
  gradedBy: string | null
}

export type SubmitInput =
  | { type: 'file'; file: { path: string; name: string }; note: string }
  | { type: 'link'; link: string; note: string }
  | { type: 'text'; text: string; note: string }

const keys = { all: ['my'] as const }

export function useMyAssignments() {
  return useQuery({
    queryKey: [...keys.all, 'assignments'],
    queryFn: ({ signal }) => api<{ timeZone: string; assignments: MyAssignment[] }>('/v1/my/assignments', { signal }),
  })
}

export function useMyAssignment(id: string) {
  return useQuery({
    queryKey: [...keys.all, 'assignment', id],
    queryFn: ({ signal }) =>
      api<{ timeZone: string; assignment: MyAssignmentDetail; submission: MySubmission | null; grade: MyGrade | null }>(`/v1/my/assignments/${id}`, { signal }),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  })
}

export function useMyGrades() {
  return useQuery({
    queryKey: [...keys.all, 'grades'],
    queryFn: ({ signal }) => api<{ timeZone: string; grades: (MyAssignment & { hasFeedback: boolean })[] }>('/v1/my/grades', { signal }),
  })
}

export function useSubmit(id: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: SubmitInput) => api<{ ok: true; late: boolean }>(`/v1/my/assignments/${id}/submission`, { method: 'PUT', body: input }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.all, refetchType: 'all' }),
  })
}

export const myStatusLabel: Record<MyStatus, string> = {
  not_submitted: 'Not submitted',
  overdue: 'Overdue',
  closed: 'Overdue',
  submitted: 'Submitted',
  late: 'Submitted late',
  graded: 'Graded',
}

export const myStatusTone = {
  not_submitted: 'neutral',
  overdue: 'error',
  closed: 'error',
  submitted: 'info',
  late: 'warning',
  graded: 'success',
} as const satisfies Record<MyStatus, string>

/** "A file or a link", "A file, a link or text" (P5.02 Details). */
export function submitWays(types: SubmissionType[]): string {
  const words = types.map((t) => ({ file: 'a file', link: 'a link', text: 'text' })[t])
  const sentence = words.length > 1 ? `${words.slice(0, -1).join(', ')} or ${words.at(-1)}` : (words[0] ?? '')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1)
}

/** "Points, out of 100", "Rubric, out of 12" (P5.02 Details). */
export function gradingWords(a: { gradingScale: Scale; maxPoints: number | null; criteria: Criterion[] }): string {
  switch (a.gradingScale) {
    case 'points':
      return `Points, out of ${a.maxPoints}`
    case 'percentage':
      return 'Percentage'
    case 'letter':
      return 'Letter grade, A to F'
    case 'pass_fail':
      return 'Pass / Fail'
    case 'rubric':
      return `Rubric, out of ${a.criteria.length * 4}`
  }
}

/** Due in the next `days` days (and not yet past). */
export function dueWithinDays(at: string, days: number): boolean {
  const left = new Date(at).getTime() - Date.now()
  return left > 0 && left < days * 24 * 3600 * 1000
}
