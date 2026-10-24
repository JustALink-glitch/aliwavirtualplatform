import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type CompletionStatus = 'not_yet' | 'eligible' | 'issued' | 'not_completed'

export interface Criterion {
  enabled: boolean
  needed: number
  value: number | null
  met: boolean | null
  detail: string
}

export interface CompletionRule {
  attendance: { enabled: boolean; minPct: number }
  submissions: { enabled: boolean; minPct: number }
  grade: { enabled: boolean; minPct: number }
  requiresApproval: boolean
  autoIssue: boolean
}

export interface CohortRef {
  id: string
  name: string
  endsOn: string
  ended: boolean
  programmeId: string
  programmeName: string
}

export interface CertificateRow {
  enrolmentId: string
  participant: { id: string; name: string }
  cohort: CohortRef
  status: CompletionStatus
  certificate: { id: string; code: string; issuedAt: string; title: string | null } | null
}

export interface CertificatesResponse {
  rule: CompletionRule & { sentence: string }
  certificate: { title: string; signedBy: string | null; organisation: string }
  counts: { eligible: number; issuedThisYear: number; completed: number; inEndedCohorts: number }
  enrolments: CertificateRow[]
}

export interface Certificate {
  id: string
  code: string
  title: string
  issuedAt: string
  participant: { id: string; name: string }
  programme: string
  cohort: { id: string; name: string; endsOn: string }
  organisation: string
  signedBy: string | null
}

export interface OutcomesResponse {
  programmes: { id: string; name: string }[]
  programmeId: string | null
  cohorts: { id: string; name: string; endsOn: string }[]
  cohortId: string | null
  options: { id: string; label: string; count: number }[]
  completed: number
  notRecorded: number
  outcomes: {
    id: string
    participant: { id: string; name: string }
    cohort: string
    option: { id: string; label: string }
    organisationName: string | null
    roleTitle: string | null
    notes: string | null
    achievedOn: string | null
    recordedAt: string
  }[]
  people: { enrolmentId: string; name: string; cohort: string; recorded: boolean }[]
}

export interface OutcomeInput {
  enrolmentId: string
  optionId: string
  organisationName: string
  roleTitle: string
  achievedOn: string
  notes: string
}

const keys = { all: ['completion'] as const }

export const useCertificates = () =>
  useQuery({
    queryKey: [...keys.all, 'certificates'],
    queryFn: ({ signal }) => api<CertificatesResponse>('/v1/completion/certificates', { signal }),
  })

export const useCertificate = (id: string) =>
  useQuery({
    queryKey: [...keys.all, 'certificate', id],
    queryFn: ({ signal }) => api<{ certificate: Certificate }>(`/v1/completion/certificates/${id}`, { signal }),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  })

export const useOutcomes = (programmeId: string, cohortId: string) =>
  useQuery({
    queryKey: [...keys.all, 'outcomes', programmeId, cohortId],
    queryFn: ({ signal }) => {
      const params = new URLSearchParams()
      if (programmeId) params.set('programmeId', programmeId)
      if (cohortId) params.set('cohortId', cohortId)
      return api<OutcomesResponse>(`/v1/completion/outcomes${params.size ? `?${params}` : ''}`, { signal })
    },
    placeholderData: (previous) => previous,
  })

function useCompletionMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: keys.all, refetchType: 'all' })
      void client.invalidateQueries({ queryKey: ['participants'], refetchType: 'all' })
    },
  })
}

export const useIssueCertificates = () =>
  useCompletionMutation((input: { enrolmentIds: string[]; notify: boolean }) =>
    api<{ issued: number }>('/v1/completion/certificates', { method: 'POST', body: input }),
  )

export const useRecordOutcome = () =>
  useCompletionMutation((input: OutcomeInput) => api<{ outcome: { id: string } }>('/v1/completion/outcomes', { method: 'POST', body: input }))

/** "83% (5 of 6 sessions)" style lines for P7.01. */
export const pctText = (c: Criterion) => (c.value === null ? 'Nothing to measure yet' : `${c.value}%`)

/** Opens the browser's print dialog; "Save as PDF" gives the file (D2, P7.02). */
export const printCertificate = () => window.print()
