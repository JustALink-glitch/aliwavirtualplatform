import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface AppNotification {
  id: string
  event: string
  title: string
  body: string | null
  link: string | null
  readAt: string | null
  createdAt: string
}

const keys = { notifications: ['notifications'] as const, search: (q: string) => ['search', q] as const }

/** G1.01 The bell. Checks again every minute and when the window gets focus. */
export const useNotifications = (limit = 20) =>
  useQuery({
    queryKey: [...keys.notifications, limit],
    queryFn: ({ signal }) => api<{ unread: number; notifications: AppNotification[] }>(`/v1/notifications?limit=${limit}`, { signal }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

export function useMarkRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string | 'all') =>
      id === 'all' ? api('/v1/notifications/read-all', { method: 'POST' }) : api(`/v1/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.notifications }),
  })
}

export type SearchKind = 'participants' | 'cohorts' | 'courses' | 'programmes' | 'trainers' | 'sessions' | 'interventions'
export interface SearchGroup {
  kind: SearchKind
  label: string
  items: { id: string; title: string; subtitle: string; link: string }[]
}

/** G1.02 Search. Needs two characters; keeps the last results on screen while the next ones load. */
export const useSearch = (q: string) =>
  useQuery({
    queryKey: keys.search(q),
    enabled: q.length >= 2,
    queryFn: ({ signal }) => api<{ query: string; groups: SearchGroup[] }>(`/v1/search?q=${encodeURIComponent(q)}`, { signal }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

/** "2h ago", "Yesterday", "Sat 17 Oct". */
export function notificationTime(value: string, timeZone?: string, now = Date.now()): string {
  const at = new Date(value)
  const minutes = Math.floor((now - at.getTime()) / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const ymd = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
  const today = ymd(new Date(now))
  if (ymd(at) === today && minutes < 24 * 60) return `${Math.floor(minutes / 60)}h ago`
  const yesterday = ymd(new Date(now - 86_400_000))
  if (ymd(at) === yesterday) return 'Yesterday'
  const parts = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone }).formatToParts(at)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('weekday')} ${get('day')} ${get('month')}`
}
