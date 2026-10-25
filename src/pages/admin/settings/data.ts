import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CompletionRule } from '@/pages/admin/completion/data'
import type { Rules } from '@/pages/admin/attention/data'

export interface CompletionSettings extends CompletionRule {
  signedBy: string
  certificateTitle: string
  defaultOutcomes: string[]
  organisation: string
  sample: { name: string; programme: string; cohort: string; endsOn: string } | null
}

export interface AttentionRuleSettings extends Rules {
  trainersSee: boolean
  clearAutomatically: boolean
  trainersCanResolve: boolean
  flaggedNow: number
}

const keys = { all: ['settings'] as const }

export const useCompletionSettings = () =>
  useQuery({ queryKey: [...keys.all, 'completion'], queryFn: ({ signal }) => api<{ settings: CompletionSettings }>('/v1/settings/completion', { signal }) })

export const useAttentionRuleSettings = () =>
  useQuery({
    queryKey: [...keys.all, 'attention-rules'],
    queryFn: ({ signal }) => api<{ settings: AttentionRuleSettings }>('/v1/settings/attention-rules', { signal }),
  })

/** Saves and puts the server's answer straight into the cache, so the form keeps what was saved. */
function useSave<T>(path: string, key: string, related: string[][]) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (body: T) => api<{ settings: T }>(path, { method: 'PUT', body }),
    onSuccess: (data) => {
      client.setQueryData([...keys.all, key], data)
      for (const queryKey of related) void client.invalidateQueries({ queryKey, refetchType: 'all' })
    },
  })
}

export const useSaveCompletionSettings = () => useSave<CompletionSettings>('/v1/settings/completion', 'completion', [['completion'], ['programmes'], ['my']])
export const useSaveAttentionRules = () => useSave<AttentionRuleSettings>('/v1/settings/attention-rules', 'attention-rules', [['attention']])

export interface ReportSettingsQuestion {
  id: string | null
  prompt: string
  multiple: boolean
  options: string[]
}

export interface ReportSettings {
  dueHours: number
  remind: boolean
  overdueOnOverview: boolean
  questions: ReportSettingsQuestion[]
}

export const useReportSettings = () =>
  useQuery({
    queryKey: [...keys.all, 'session-reports'],
    queryFn: ({ signal }) => api<{ settings: ReportSettings }>('/v1/settings/session-reports', { signal }),
  })

export const useSaveReportSettings = () => useSave<ReportSettings>('/v1/settings/session-reports', 'session-reports', [['reports'], ['sessions']])
