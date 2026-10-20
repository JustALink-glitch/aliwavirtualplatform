import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { AuthContext, type AuthContextValue, type AuthState, type Me } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next) queryClient.clear()
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
    else if (me.isError) state = { status: 'no-access', error: me.error }
    else if (!me.data) state = { status: 'loading' }
    else state = { status: 'signed-in', session, me: me.data }

    return {
      state,
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }
  }, [session, me.data, me.isError, me.error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
