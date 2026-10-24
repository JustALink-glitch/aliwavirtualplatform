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
  trainer: { id: string; name: string; isLead: boolean } | null
  series: { id: string; weekdays: number[]; sessions: number } | null
  number: number | null
  total: number
  expected: number
  attendance: { recorded: number; present: number }
  report: { submittedAt: string | null; dueAt: string }
  cancelled: { at: string; reason: string | null; by: string | null } | null
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
    queryFn: ({ signal }) => api<{ session: Session }>(`/v1/sessions/${id}`, { signal }),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  })
}

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
