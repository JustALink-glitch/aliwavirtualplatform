import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'
import type { Role } from '@/lib/roles'

export interface Me {
  user: { id: string; email: string | null }
  membership: { id: string; organisationId: string; role: Role }
}

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  /** Signed in to Supabase, but the API found no active membership (deactivated, or invite not accepted). */
  | { status: 'no-access'; error: Error }
  | { status: 'signed-in'; session: Session; me: Me }

export interface AuthContextValue {
  state: AuthState
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
