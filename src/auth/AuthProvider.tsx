import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, ApiError } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { AuthContext, type AuthContextValue, type AuthState, type Me, type NoAccessReason } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      // Only on a real sign-out. INITIAL_SESSION also arrives with no session for signed-out
      // visitors, and clearing then would wipe queries already in flight (e.g. an invitation lookup).
      if (event === 'SIGNED_OUT') queryClient.clear()
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient])

  const me = useQuery({
    queryKey: ['me', session?.user.id],
    queryFn: ({ signal }) => api<Me>('/v1/me', { signal }),
    enabled: Boolean(session),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const value = useMemo<AuthContextValue>(() => {
    let state: AuthState
    if (session === undefined) state = { status: 'loading' }
    else if (session === null) state = { status: 'signed-out' }
    else if (me.isError) {
      const code = me.error instanceof ApiError ? me.error.code : ''
      const reason: NoAccessReason = code === 'no_organisation' || code === 'access_ended' ? code : 'unknown'
      state = { status: 'no-access', reason, session }
    }
    else if (!me.data) state = { status: 'loading' }
    else state = { status: 'signed-in', session, me: me.data }

    return {
      state,
      signOut: async () => {
        await supabase.auth.signOut()
      },
      refresh: async () => {
        await queryClient.invalidateQueries({ queryKey: ['me'] })
      },
    }
  }, [session, me.data, me.isError, me.error, queryClient])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
