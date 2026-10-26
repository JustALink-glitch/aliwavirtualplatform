import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api, ApiError, onSessionExpired } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { AuthContext, type AuthContextValue, type AuthState, type Me, type NoAccessReason } from './useAuth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [expired, setExpired] = useState(false)
  // Set while the person signs out themselves, so that sign-out isn't shown as "session ended".
  const signingOut = useRef(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'SIGNED_IN') setExpired(false)
      // Only on a real sign-out. INITIAL_SESSION also arrives with no session for signed-out
      // visitors, and clearing then would wipe queries already in flight (e.g. an invitation lookup).
      if (event === 'SIGNED_OUT') {
        setExpired(!signingOut.current)
        signingOut.current = false
        queryClient.clear()
      }
    })
    // The API refused a token we still hold (revoked or past refresh): end the session here too.
    onSessionExpired(() => void supabase.auth.signOut({ scope: 'local' }))
    return () => {
      data.subscription.unsubscribe()
      onSessionExpired(null)
    }
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
    else if (session === null) state = { status: 'signed-out', expired }
    else if (me.isError) {
      const code = me.error instanceof ApiError ? me.error.code : ''
      const reason: NoAccessReason = code === 'no_organisation' || code === 'access_ended' ? code : 'unknown'
      state = { status: 'no-access', reason, session }
    } else if (!me.data) state = { status: 'loading' }
    else state = { status: 'signed-in', session, me: me.data }

    return {
      state,
      signOut: async () => {
        signingOut.current = true
        await supabase.auth.signOut()
      },
      refresh: async () => {
        await queryClient.invalidateQueries({ queryKey: ['me'] })
      },
    }
  }, [session, expired, me.data, me.isError, me.error, queryClient])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
