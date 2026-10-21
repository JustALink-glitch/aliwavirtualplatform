import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// ─── Types (match the API) ───

export type ProgrammeStatus = 'draft' | 'active' | 'archived'
export type CohortStatus = 'draft' | 'upcoming' | 'active' | 'completed' | 'archived'
export type DeliveryMode = 'in_person' | 'online' | 'both'

export interface Programme {
  id: string
  name: string
  description: string | null
  status: ProgrammeStatus
  lead: { id: string; name: string | null } | null
  courseNames: string[]
  cohorts: { total: number; active: number; upcoming: number; completed: number }
  participants: number
  createdAt: string
  archivedAt: string | null
}

export interface CohortSummary {
  id: string
  programme: { id: string; name: string }
  name: string
  startsOn: string
  endsOn: string
  status: CohortStatus
  deliveryMode: DeliveryMode
  usualLocation: string | null
  courseNames: string[]
  participants: number
  plannedSessions: number
  heldSessions: number
  archivedAt: string | null
}

export interface ProgrammeCourse {
  id: string
  name: string
  plannedSessions: number | null
  defaultLead: { id: string; name: string } | null
}

export interface Course extends ProgrammeCourse {
  programme: { id: string; name: string }
  description: string | null
  cohorts: { id: string; name: string }[]
}

export interface CohortCourse {
  id: string
  courseId: string
  name: string
  plannedSessions: number | null
  heldSessions: number
  firstSessionAt: string | null
  trainers: { id: string; firstName: string; lastName: string; isLead: boolean; status: string }[]
}

export interface ProgrammeInput {
  name: string
  description: string
  leadMemberId: string | null
  outcomes: string[]
}

export interface CohortInput {
  name: string
  startsOn: string
  endsOn: string
  deliveryMode: DeliveryMode
  usualLocation: string
  courseIds: string[]
}

export interface CourseInput {
  programmeId: string
  name: string
  description: string
  plannedSessions: number | null
  defaultLeadMemberId: string | null
  cohortIds: string[]
}

// ─── Queries ───

export const keys = {
  programmes: ['programmes'] as const,
  programme: (id: string) => ['programmes', id] as const,
  cohorts: ['cohorts'] as const,
  cohort: (id: string) => ['cohorts', id] as const,
  courses: (programmeId?: string) => ['courses', programmeId ?? 'all'] as const,
}

const notFoundRetry = (count: number, error: unknown) => (error as { status?: number }).status !== 404 && count < 2

export function useProgrammes() {
  return useQuery({
    queryKey: keys.programmes,
    queryFn: ({ signal }) => api<{ programmes: Programme[]; defaultOutcomes: string[] }>('/v1/programmes', { signal }),
  })
}

export function useProgramme(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: keys.programme(id),
    queryFn: ({ signal }) =>
      api<{ programme: Programme; outcomes: string[]; cohorts: CohortSummary[]; courses: ProgrammeCourse[] }>(`/v1/programmes/${id}`, { signal }),
    retry: notFoundRetry,
  })
}

export function useCohorts() {
  return useQuery({
    queryKey: keys.cohorts,
    queryFn: ({ signal }) => api<{ cohorts: CohortSummary[] }>('/v1/cohorts', { signal }),
    select: (data) => data.cohorts,
  })
}

export function useCohort(id: string) {
  return useQuery({
    queryKey: keys.cohort(id),
    queryFn: ({ signal }) =>
      api<{ cohort: CohortSummary; courses: CohortCourse[]; programmeCourses: { id: string; name: string }[] }>(`/v1/cohorts/${id}`, { signal }),
    retry: notFoundRetry,
  })
}

export function useCourses(programmeId?: string) {
  return useQuery({
    queryKey: keys.courses(programmeId),
    queryFn: ({ signal }) => api<{ courses: Course[] }>(`/v1/courses${programmeId ? `?programmeId=${programmeId}` : ''}`, { signal }),
    select: (data) => data.courses,
  })
}

// ─── Mutations. Anything that changes the structure refreshes every list. ───

function useStructureMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await Promise.all(
        [keys.programmes, keys.cohorts, ['courses'], ['members']].map((queryKey) => client.invalidateQueries({ queryKey })),
      )
    },
  })
}

export const useCreateProgramme = () =>
  useStructureMutation((input: ProgrammeInput) => api<{ programme: Programme }>('/v1/programmes', { method: 'POST', body: input }))

export const useUpdateProgramme = (id: string) =>
  useStructureMutation((input: ProgrammeInput) => api<{ programme: Programme }>(`/v1/programmes/${id}`, { method: 'PATCH', body: input }))

export const useArchiveProgramme = (id: string) =>
  useStructureMutation(() => api<{ programme: Programme }>(`/v1/programmes/${id}/archive`, { method: 'POST' }))

export const useRestoreProgramme = (id: string) =>
  useStructureMutation(() => api<{ programme: Programme }>(`/v1/programmes/${id}/restore`, { method: 'POST' }))

export const useCreateCohort = () =>
  useStructureMutation((input: CohortInput & { programmeId: string }) => api<{ cohort: CohortSummary }>('/v1/cohorts', { method: 'POST', body: input }))

export const useUpdateCohort = (id: string) =>
  useStructureMutation((input: CohortInput) => api<{ cohort: CohortSummary }>(`/v1/cohorts/${id}`, { method: 'PATCH', body: input }))

export const useArchiveCohort = (id: string) =>
  useStructureMutation(() => api<{ cohort: CohortSummary }>(`/v1/cohorts/${id}/archive`, { method: 'POST' }))

export const useRestoreCohort = (id: string) =>
  useStructureMutation(() => api<{ cohort: CohortSummary }>(`/v1/cohorts/${id}/restore`, { method: 'POST' }))

export const useCreateCourse = () =>
  useStructureMutation((input: CourseInput) => api<{ course: { id: string } }>('/v1/courses', { method: 'POST', body: input }))
