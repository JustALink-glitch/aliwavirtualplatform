import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router'
import { api } from '@/lib/api'

export type ReportState = 'due' | 'overdue' | 'submitted'

export interface ReportRow {
  sessionId: string
  course: string
  cohort: { id: string; name: string }
  number: number | null
  startsAt: string
  dueAt: string
  trainer: { id: string; name: string | null } | null
  state: ReportState
  submittedAt: string | null
  draft: boolean
}

export interface ReportList {
  timeZone: string
  dueHours: number
  canWrite: boolean
  counts: { due: number; overdue: number; submitted: number; submittedThisMonth: number; onTimeThisMonth: number }
  reports: ReportRow[]
}

export interface ReportQuestion {
  id: string | null
  prompt: string
  options: string[]
  multiple: boolean
}

export interface ReportDetail {
  timeZone: string
  session: {
    id: string
    course: string
    cohort: { id: string; name: string }
    number: number | null
    startsAt: string
    endsAt: string
    attendance: { present: number; recorded: number; expected: number }
    feedback: number
  }
  trainer: { id: string; name: string | null; email: string | null } | null
  dueAt: string
  state: ReportState
  questions: ReportQuestion[]
  report: {
    summary: string
    answers: Record<string, string[]>
    submittedAt: string | null
    savedAt: string
    author: string | null
    onTime: boolean | null
  } | null
  can: { write: boolean; edit: boolean }
}

const keys = { all: ['reports'] as const }

export const useReports = () => useQuery({ queryKey: [...keys.all, 'list'], queryFn: ({ signal }) => api<ReportList>('/v1/session-reports', { signal }) })

export const useReport = (sessionId: string) =>
  useQuery({
    queryKey: [...keys.all, 'detail', sessionId],
    queryFn: ({ signal }) => api<ReportDetail>(`/v1/session-reports/${sessionId}`, { signal }),
    retry: (count, error) => (error as { status?: number }).status !== 404 && count < 2,
  })

function useReportMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: keys.all, refetchType: 'all' })
      void client.invalidateQueries({ queryKey: ['sessions'], refetchType: 'all' })
      void client.invalidateQueries({ queryKey: ['trainer'], refetchType: 'all' })
    },
  })
}

export const useSaveReport = (sessionId: string) =>
  useReportMutation((input: { answers: { questionId: string; choices: string[] }[]; summary: string; submit: boolean }) =>
    api<{ saved: true; submitted: boolean }>(`/v1/session-reports/${sessionId}`, { method: 'PUT', body: input }),
  )

export const useRemind = (sessionId: string) =>
  useReportMutation(() => api<{ sent: true; to: string }>(`/v1/session-reports/${sessionId}/remind`, { method: 'POST', body: {} }))

/** Session reports live under Courses & sessions for admins (C3) and under Session reports for trainers (T5). */
export function useReportPaths() {
  const { pathname } = useLocation()
  const trainer = pathname.startsWith('/trainer')
  return trainer
    ? {
        trainer,
        list: '/trainer/reports',
        listLabel: 'Session reports',
        report: (id: string) => `/trainer/reports/${id}`,
        session: (id: string) => `/trainer/sessions/${id}`,
      }
    : {
        trainer,
        list: '/admin/courses/reports',
        listLabel: 'Session reports',
        report: (id: string) => `/admin/courses/reports/${id}`,
        session: (id: string) => `/admin/courses/sessions/${id}`,
      }
}

export const reportBadge: Record<ReportState, { tone: 'warning' | 'error' | 'success'; label: string }> = {
  due: { tone: 'warning', label: 'Due' },
  overdue: { tone: 'error', label: 'Overdue' },
  submitted: { tone: 'success', label: 'Submitted' },
}
