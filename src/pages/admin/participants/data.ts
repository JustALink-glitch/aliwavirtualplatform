import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ParticipantRow } from '@/lib/csv'
import type { CohortStatus } from '@/pages/admin/programmes/data'

export type EnrolmentStatus = 'active' | 'deferred' | 'withdrawn' | 'transferred' | 'completed'
export type MemberStatus = 'invited' | 'active' | 'deactivated'

export interface ParticipantSummary {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  status: MemberStatus
  invitedAt: string | null
  joinedAt: string | null
  invitationExpiresAt: string | null
  lastSignInAt: string | null
  enrolment: {
    id: string
    status: EnrolmentStatus
    enrolledAt: string
    cohort: { id: string; name: string; status: CohortStatus }
    programmeName: string
  } | null
}

export interface Enrolment {
  id: string
  status: EnrolmentStatus
  reason: string | null
  note: string | null
  effectiveOn: string | null
  changedAt: string
  enrolledAt: string
  cohort: { id: string; name: string; status: CohortStatus }
  programme: { id: string; name: string }
  trainers: string[]
}

export interface HistoryEntry {
  action: string
  at: string
  data: Record<string, unknown>
  actor: string | null
}

export interface ParticipantDetail {
  participant: Omit<ParticipantSummary, 'enrolment'> & { invitationSentAt: string | null }
  enrolments: Enrolment[]
  history: HistoryEntry[]
}

export interface ReviewedRow {
  row: number
  fullName: string
  email: string
  phone: string | null
  status: 'ready' | 'error'
  message: string | null
}

export interface ImportResult {
  cohort: { id: string; name: string }
  added: number
  invited: number
  emailed: number
  invitationExpiresAt: string
  skipped: ReviewedRow[]
  importedAt: string
}

const keys = {
  all: ['participants'] as const,
  list: (cohortId?: string) => ['participants', 'list', cohortId ?? 'all'] as const,
  detail: (id: string) => ['participants', 'detail', id] as const,
}

export function useParticipants(cohortId?: string) {
  return useQuery({
    queryKey: keys.list(cohortId),
    queryFn: ({ signal }) =>
      api<{ participants: ParticipantSummary[]; summary: { inActiveCohorts: number; inUpcomingCohorts: number } }>(
        `/v1/participants${cohortId ? `?cohortId=${cohortId}` : ''}`,
        { signal },
      ),
  })
}

export function useParticipant(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: ({ signal }) => api<ParticipantDetail>(`/v1/participants/${id}`, { signal }),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  })
}

/** Participant changes also move cohort counts, so refresh those lists too. */
function useParticipantMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await Promise.all([keys.all, ['cohorts'], ['programmes'], ['members']].map((queryKey) => client.invalidateQueries({ queryKey })))
    },
  })
}

export interface AddParticipantInput {
  fullName: string
  email: string
  phone: string
  cohortId: string
}

export const useAddParticipant = () =>
  useParticipantMutation((input: AddParticipantInput) =>
    api<{ participant: { id: string }; invited: boolean; emailSent: boolean | null }>('/v1/participants', { method: 'POST', body: input }),
  )

export const useImportPreview = () =>
  useMutation({
    mutationFn: (input: { cohortId: string; fileName: string; rows: ParticipantRow[] }) =>
      api<{ cohort: { id: string; name: string }; rows: ReviewedRow[] }>('/v1/participants/import/preview', { method: 'POST', body: input }),
  })

export const useImport = () =>
  useParticipantMutation((input: { cohortId: string; fileName: string; rows: ParticipantRow[]; sendEmails: boolean }) =>
    api<ImportResult>('/v1/participants/import', { method: 'POST', body: input }),
  )

export const useEditParticipant = (id: string) =>
  useParticipantMutation((input: { fullName: string; email: string; phone: string }) =>
    api<{ emailSent: boolean | null }>(`/v1/participants/${id}`, { method: 'PATCH', body: input }),
  )

export const useResendParticipantInvitation = (id: string) =>
  useParticipantMutation(() => api<{ emailSent: boolean }>(`/v1/members/${id}/invitation`, { method: 'POST' }))

export type EnrolmentChange =
  | { kind: 'defer'; reason: string; note: string; toCohortId: string | null; effectiveOn: string; notify: boolean }
  | { kind: 'withdraw'; reason: string; note: string; effectiveOn: string; notify: boolean }
  | { kind: 'transfer'; toCohortId: string; reason: string; notify: boolean }

export const useChangeEnrolment = (participantId: string, enrolmentId: string) =>
  useParticipantMutation(({ kind, ...body }: EnrolmentChange) =>
    api<{ ok: true }>(`/v1/participants/${participantId}/enrolments/${enrolmentId}/${kind}`, { method: 'POST', body }),
  )

export const enrolmentLabel: Record<EnrolmentStatus, string> = {
  active: 'Active',
  deferred: 'Deferred',
  withdrawn: 'Withdrawn',
  transferred: 'Transferred',
  completed: 'Completed',
}

/** The invitation link has passed its 72 hours (or there is no live link). */
export const linkExpired = (expiresAt: string | null) => !expiresAt || Date.parse(expiresAt) <= Date.now()

/** Reasons offered when deferring or withdrawing (B1.05a/b). "Other" asks for a note. */
export const DEFER_REASONS = ['Work commitments', 'Personal or family reasons', 'Health', 'Financial reasons', 'Relocation', 'Other']
export const WITHDRAW_REASONS = [
  'Found employment',
  'Work commitments',
  'Personal or family reasons',
  'Health',
  'Financial reasons',
  'Lost contact',
  'Programme not a good fit',
  'Other',
]
