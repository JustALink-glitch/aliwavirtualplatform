import { env } from './env'
import { supabase } from './supabase'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    /** Server errors (500) carry the request id the API logged it under. */
    readonly requestId?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** X1.02 A short reference people can quote: the first 8 characters of the request id, e.g. "7F3K-2Q9X". */
export function errorReference(requestId: string): string {
  const s = requestId
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 8)
    .toUpperCase()
  return s.length > 4 ? `${s.slice(0, 4)}-${s.slice(4)}` : s
}

let sessionExpired: (() => void) | null = null
/** X1.03 Called when the API turns down a token the browser still holds: the session has ended. */
export function onSessionExpired(handler: (() => void) | null) {
  sessionExpired = handler
}

/** Calls the Synqop API with the current user's access token. */
export async function api<T>(path: string, options: { method?: Method; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const response = await fetch(`${env.apiUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : null,
    signal: options.signal ?? null,
  })

  const payload: unknown = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && token) sessionExpired?.()
    const error = (payload as { error?: { code?: string; message?: string; details?: unknown; requestId?: string } } | null)?.error
    throw new ApiError(response.status, error?.code ?? 'unknown_error', error?.message ?? 'Something went wrong. Try again.', error?.details, error?.requestId)
  }
  return payload as T
}

/** Downloads a file the API streams (e.g. a generated report) and saves it as `fileName`. */
export async function downloadApiFile(path: string, fileName: string): Promise<void> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const response = await fetch(`${env.apiUrl}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null
    throw new ApiError(response.status, payload?.error?.code ?? 'unknown_error', payload?.error?.message ?? 'The download didn’t start. Try again.')
  }
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  setTimeout(() => {
    link.remove()
    URL.revokeObjectURL(url)
  }, 10_000)
}
