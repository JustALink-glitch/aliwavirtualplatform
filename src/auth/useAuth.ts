import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'
import type { Role } from '@/lib/roles'

export interface Me {
  user: { id: string; email: string | null }
  membership: {
    id: string
    organisationId: string
    role: Role
    firstName: string
    lastName: string
    phone?: string | null
    /** G1.04: set by the person; otherwise "First L.". */
    displayName?: string | null
    lastSignInAt?: string | null
  }
  organisation: { id: string; name: string; timeZone: string } | null
}

/** Why a signed-in account can't use the app (API error codes from /v1/me). */
export type NoAccessReason = 'no_organisation' | 'access_ended' | 'unknown'

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  /**
   * Signed in to Supabase, but no active membership: `no_organisation` → resume organisation set-up (R1.03a);
   * `access_ended` → deactivated (P1.04w).
   */
  | { status: 'no-access'; reason: NoAccessReason; session: Session }
  | { status: 'signed-in'; session: Session; me: Me }

export interface AuthContextValue {
  state: AuthState
  signOut: () => Promise<void>
  /** Re-fetch /v1/me, e.g. right after creating an organisation or accepting an invitation. */
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
