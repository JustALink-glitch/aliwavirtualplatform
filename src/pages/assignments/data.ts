import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatDay, formatTime } from '@/lib/format'

export type Scale = 'points' | 'percentage' | 'letter' | 'pass_fail' | 'rubric'
export type SubmissionType = 'file' | 'link' | 'text'
export type LatePolicy = 'accept_late' | 'closed'
export type AssignmentStatus = 'draft' | 'open' | 'closed'
export type ParticipantStatus = 'not_submitted' | 'overdue' | 'submitted' | 'late' | 'graded'
export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'] as const
export type Letter = (typeof LETTERS)[number]

export interface AssignmentSummary {
  id: string
  title: string
  status: AssignmentStatus
  dueAt: string
  publishedAt: string | null
  gradingScale: Scale
  maxPoints: number | null
  criteriaCount: number
  scaleLabel: string
  latePolicy: LatePolicy
  submissionTypes: SubmissionType[]
  course: { id: string; name: string }
  cohort: { id: string; name: string }
  programme: { id: string; name: string }
  cohortCourseId: string
  setBy: { id: string; name: string; email: string | null } | null
  counts: {
    expected: number
    submitted: number
    graded: number
    toGrade: number
    late: number
    overdue: number
  }
  canEdit: boolean
  canGrade: boolean
}

export interface Criterion {
  id: string
  title: string
  description: string | null
}

export interface AssignmentDetail extends AssignmentSummary {
  brief: string | null
  dueDate: string
  dueTime: string
  criteria: Criterion[]
  links: { name: string; url: string }[]
  files: { id: string; name: string; size: number }[]
  locked: boolean
}

export interface ParticipantRow {
  memberId: string
  name: string
  email: string
  status: ParticipantStatus
  submittedAt: string | null
  grade: string | null
}

export interface SubmissionView {
  timeZone: string
  assignment: AssignmentSummary & { criteria: Criterion[] }
  participant: {
    id: string
    name: string
    email: string
    status: ParticipantStatus
  }
  submission: {
    submittedAt: string
    late: boolean
    text: string | null
    link: string | null
    note: string | null
    files: { id: string; name: string; size: number; type: string | null }[]
  } | null
  grade: {
    points: number | null
    percentage: number | null
    letter: Letter | null
    passed: boolean | null
    rubric: { criterionId: string; score: number }[]
    feedback: string | null
    display: string | null
    gradedAt: string
    gradedBy: string | null
  } | null
  queue: {
    toGrade: number
    position: number | null
    previousMemberId: string | null
    nextMemberId: string | null
  }
}

export interface AssignmentInput {
  cohortCourseId: string
  title: string
  brief: string
  links: { url: string }[]
  files: ({ id: string } | { path: string; name: string })[]
  dueDate: string
  dueTime: string
  submissionTypes: SubmissionType[]
  latePolicy: LatePolicy
  gradingScale: Scale
  maxPoints: number | null
  criteria: { title: string; description: string }[]
  publish: boolean
}

export interface GradeInput {
  points?: number
  percentage?: number
  letter?: Letter
  passed?: boolean
  rubric?: { criterionId: string; score: number }[]
  feedback: string
}

const keys = {
  all: ['assignments'] as const,
  detail: (id: string) => ['assignments', 'detail', id] as const,
  submission: (id: string, memberId: string) => ['assignments', 'submission', id, memberId] as const,
}

export function useAssignments() {
  return useQuery({
    queryKey: [...keys.all, 'list'],
    queryFn: ({ signal }) =>
      api<{
        timeZone: string
        canCreate: boolean
        assignments: AssignmentSummary[]
      }>('/v1/assignments', { signal }),
  })
}

export function useAssignmentOptions() {
  return useQuery({
    queryKey: [...keys.all, 'options'],
    queryFn: ({ signal }) =>
      api<{
        timeZone: string
        scales: Scale[]
        courses: {
          id: string
          courseName: string
          cohort: { id: string; name: string }
          programmeName: string
        }[]
      }>('/v1/assignments/options', { signal }),
  })
}

const noRetryOn404 = (count: number, error: unknown) => (error as { status?: number }).status !== 404 && count < 2

export function useAssignment(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: keys.detail(id),
    queryFn: ({ signal }) =>
      api<{
        timeZone: string
        assignment: AssignmentDetail
        participants: ParticipantRow[]
        queue: string[]
      }>(`/v1/assignments/${id}`, { signal }),
    retry: noRetryOn404,
  })
}

export function useSubmission(id: string, memberId: string) {
  return useQuery({
    queryKey: keys.submission(id, memberId),
    queryFn: ({ signal }) =>
      api<SubmissionView>(`/v1/assignments/${id}/submissions/${memberId}`, {
        signal,
      }),
    retry: noRetryOn404,
  })
}

function useAssignmentMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: fn,
    // Refresh lists that aren't on screen too, so the next page never shows stale data first.
    onSuccess: () => client.invalidateQueries({ queryKey: keys.all, refetchType: 'all' }),
  })
}

export const useCreateAssignment = () =>
  useAssignmentMutation((input: AssignmentInput) =>
    api<{ assignment: { id: string } }>('/v1/assignments', {
      method: 'POST',
      body: input,
    }),
  )

export const useEditAssignment = (id: string) =>
  useAssignmentMutation((input: AssignmentInput) =>
    api<{ ok: true }>(`/v1/assignments/${id}`, {
      method: 'PATCH',
      body: input,
    }),
  )

export const useSaveGrade = (id: string, memberId: string) =>
  useAssignmentMutation((input: GradeInput) =>
    api<{ ok: true }>(`/v1/assignments/${id}/submissions/${memberId}/grade`, {
      method: 'PUT',
      body: input,
    }),
  )

export const scaleName: Record<Scale, string> = {
  points: 'Points',
  percentage: 'Percentage',
  letter: 'Letter grade',
  pass_fail: 'Pass / Fail',
  rubric: 'Rubric',
}

/** "Points · out of 100", "Rubric · score each criterion 1–4" (T6.04 Grade panel). */
export function scaleHint(a: { gradingScale: Scale; maxPoints: number | null }): string {
  switch (a.gradingScale) {
    case 'points':
      return `Points · out of ${a.maxPoints}`
    case 'percentage':
      return 'Percentage · 0–100'
    case 'letter':
      return 'Letter grade · A to F'
    case 'pass_fail':
      return 'Pass / Fail'
    case 'rubric':
      return 'Rubric · score each criterion 1–4'
  }
}

export const statusLabel: Record<ParticipantStatus, string> = {
  not_submitted: 'Not submitted',
  overdue: 'Overdue',
  submitted: 'Submitted',
  late: 'Late',
  graded: 'Graded',
}

export const statusTone = {
  not_submitted: 'neutral',
  overdue: 'error',
  submitted: 'info',
  late: 'warning',
  graded: 'success',
} as const satisfies Record<ParticipantStatus, string>

/** "Wed 21 Oct, 23:59" in the organisation's time zone. */
export const formatDue = (at: string, timeZone?: string) => `${formatDay(at, timeZone)}, ${formatTime(at, timeZone)}`

/** "on time" / "late" after a submission time (T6.04). */
export const submittedLine = (s: { submittedAt: string; late: boolean }, timeZone?: string) =>
  `Submitted ${formatDue(s.submittedAt, timeZone)} · ${s.late ? 'late' : 'on time'}`
