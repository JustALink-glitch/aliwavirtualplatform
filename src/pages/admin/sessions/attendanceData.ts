import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type Mark = 'present' | 'absent' | 'excused'

export interface RegisterRow {
  memberId: string
  name: string
  email: string
  stillEnrolled: boolean
  status: Mark | null
  source: 'zoom' | 'manual' | 'edited' | null
  joinedAt: string | null
  minutesInMeeting: number | null
  late: boolean
  note: string | null
}

export interface Register {
  status: 'scheduled' | 'in_progress' | 'held' | 'cancelled'
  counts: { present: number; absent: number; excused: number; notRecorded: number }
  expected: number
  rate: number | null
  firstSaved: { at: string; by: string | null } | null
  changes: { count: number; lastBy: string | null }
  register: RegisterRow[]
}

export type HistoryEntry =
  | { kind: 'change'; at: string; participant: string; from: Mark | null; to: Mark; by: string | null; reason: string }
  | { kind: 'register'; at: string; marked: number; present: number; absent: number; excused: number; by: string | null }

const key = (id: string) => ['sessions', 'attendance', id] as const

export function useRegister(sessionId: string) {
  return useQuery({ queryKey: key(sessionId), queryFn: ({ signal }) => api<Register>(`/v1/sessions/${sessionId}/attendance`, { signal }) })
}

export function useAttendanceHistory(sessionId: string) {
  return useQuery({
    queryKey: [...key(sessionId), 'history'],
    queryFn: ({ signal }) => api<{ entries: HistoryEntry[] }>(`/v1/sessions/${sessionId}/attendance/history`, { signal }),
  })
}

/** Attendance moves rates everywhere, so refresh sessions, cohorts, programmes and participants. */
function useAttendanceMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await Promise.all([['sessions'], ['cohorts'], ['programmes'], ['participants']].map((queryKey) => client.invalidateQueries({ queryKey })))
    },
  })
}

export const useSaveRegister = (sessionId: string) =>
  useAttendanceMutation((marks: { memberId: string; status: Mark }[]) =>
    api<{ marked: number }>(`/v1/sessions/${sessionId}/attendance`, { method: 'PUT', body: { marks } }),
  )

export const useEditMark = (sessionId: string, memberId: string) =>
  useAttendanceMutation((input: { status: Mark; reason: string }) =>
    api<{ ok: true }>(`/v1/sessions/${sessionId}/attendance/${memberId}`, { method: 'PATCH', body: input }),
  )

export const markLabel: Record<Mark, string> = { present: 'Present', absent: 'Absent', excused: 'Excused' }
export const sourceLabel = { zoom: 'Zoom', manual: 'Manual', edited: 'Edited' } as const

export function downloadCsv(name: string, rows: string[][]) {
  const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  const url = URL.createObjectURL(new Blob([rows.map((r) => r.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
