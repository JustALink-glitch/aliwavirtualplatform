import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type SessionStatus = 'scheduled' | 'in_progress' | 'held' | 'cancelled'
export type SessionMode = 'online' | 'in_person'

export interface Session {
  id: string
  title: string
  course: { id: string; name: string }
  cohort: { id: string; name: string; status: string }
  startsAt: string
  endsAt: string
  status: SessionStatus
  mode: SessionMode
  location: string | null
  joinUrl: string | null
  zoomMeetingId: string | null
  /** Where Zoom is with this session (C1.03, C2.01). */
  zoom?: { managed: boolean; pending: boolean; problem: string | null; importedAt: string | null; unmatched: number }
  trainer: { id: string; name: string; isLead: boolean } | null
  series: { id: string; weekdays: number[]; sessions: number } | null
  number: number | null
  total: number
  expected: number
  attendance: { recorded: number; present: number }
  report: { submittedAt: string | null; dueAt: string }
  cancelled: { at: string; reason: string | null; by: string | null } | null
}

/** What the signed-in person can do with a session (§02 permission matrix). */
export interface SessionPermissions {
  schedule: boolean
  attendance: boolean
  resources: boolean
  report: boolean
}

export interface SessionResource {
  id: string
  kind: 'file' | 'link'
  name: string
  url: string | null
  size: number | null
  type: string | null
  wholeCourse: boolean
  visible: boolean
  addedBy: string | null
  addedAt: string
}

export interface SessionDetail {
  session: Session
  can: SessionPermissions
  resources: SessionResource[]
}

export interface ScheduleOption {
  id: string
  name: string
  status: string
  startsOn: string
  endsOn: string
  courses: { id: string; courseId: string; name: string; trainers: { id: string; firstName: string; lastName: string; isLead: boolean; status: string }[] }[]
}

export interface SessionList {
  timeZone: string
  hasAny: boolean
  sessions: Session[]
  attendanceToConfirm: Session[]
}

export interface ScheduleInput {
  cohortId: string
  courseId: string
  trainerMemberId: string | null
  date: string
  start: string
  end: string
  repeat: { weekdays: number[]; count?: number; until?: string } | null
  mode: SessionMode
  location: string
  joinUrl: string
}

export interface EditInput {
  scope: 'this' | 'following' | 'all'
  date: string
  start: string
  end: string
  trainerMemberId: string | null
  mode: SessionMode
  location: string
  joinUrl: string
  notify: boolean
}

const keys = {
  all: ['sessions'] as const,
  list: (params: Record<string, string | undefined>) => ['sessions', 'list', params] as const,
  detail: (id: string) => ['sessions', 'detail', id] as const,
}

export function useSessions(params: { from?: string; to?: string; cohortId?: string }) {
  const query = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => Boolean(e[1]))).toString()
  return useQuery({
    queryKey: keys.list(params),
    queryFn: ({ signal }) => api<SessionList>(`/v1/sessions${query ? `?${query}` : ''}`, { signal }),
  })
}

export function useSession(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: keys.detail(id),
    queryFn: ({ signal }) => api<SessionDetail>(`/v1/sessions/${id}`, { signal }),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  })
}

/** Cohorts and courses the signed-in person can schedule in (C1.02, T3.03). */
export const useSessionOptions = () =>
  useQuery({ queryKey: [...keys.all, 'options'], queryFn: ({ signal }) => api<{ cohorts: ScheduleOption[] }>('/v1/sessions/options', { signal }) })

/** Sessions change cohort delivery numbers, so refresh cohort lists too. */
function useSessionMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await Promise.all([keys.all, ['cohorts'], ['programmes']].map((queryKey) => client.invalidateQueries({ queryKey })))
    },
  })
}

export const useScheduleSessions = () =>
  useSessionMutation((input: ScheduleInput) => api<{ created: number; firstSessionId: string }>('/v1/sessions', { method: 'POST', body: input }))

export const useEditSession = (id: string) =>
  useSessionMutation((input: EditInput) => api<{ updated: number; emailed: number }>(`/v1/sessions/${id}`, { method: 'PATCH', body: input }))

export const useCancelSession = (id: string) =>
  useSessionMutation((input: { reason: string; notify: boolean }) =>
    api<{ cancelled: true; emailed: number }>(`/v1/sessions/${id}/cancel`, { method: 'POST', body: input }),
  )

export interface ResourceInput {
  kind: 'file' | 'link'
  name: string
  url?: string
  path?: string
  scope: 'session' | 'course'
  visible: boolean
}

export const useAddResource = (sessionId: string) =>
  useSessionMutation((input: ResourceInput) => api<{ resource: { id: string } }>(`/v1/sessions/${sessionId}/resources`, { method: 'POST', body: input }))

/** "Online · Zoom", "Online", "Lab 2 · Yaba hub". */
export function whereLabel(session: Pick<Session, 'mode' | 'location' | 'joinUrl' | 'zoomMeetingId'>): string {
  if (session.mode === 'in_person') return session.location ?? 'In person'
  if (session.zoomMeetingId || session.joinUrl?.includes('zoom.us')) return 'Online · Zoom'
  if (session.joinUrl?.includes('meet.google.com')) return 'Online · Google Meet'
  if (session.joinUrl?.includes('teams.microsoft.com')) return 'Online · Teams'
  return 'Online'
}

/** The moment has passed. */
export const isPast = (value: string) => Date.parse(value) < Date.now()
