import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { areaForRole, homePath, type Area } from '@/lib/roles'
import { useAuth } from './useAuth'
import { StatePanel } from '@/components/StatePanel'

/**
 * Gate for an app area. Signed-out users go to sign-in; signed-in users in the wrong
 * area go to their own home. This is a convenience — the API enforces every permission.
 */
export function RequireArea({ area, children }: { area: Area; children: ReactNode }) {
  const { state, signOut } = useAuth()
  const location = useLocation()

  if (state.status === 'loading') {
    return <div aria-busy="true" aria-label="Loading" className="min-h-dvh bg-canvas" />
  }
  if (state.status === 'signed-out') {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }
  if (state.status === 'no-access') {
    return (
      <StatePanel
        kind="restricted"
        title="No access to an organisation"
        description="This account isn't active in any Synqop organisation. If you were invited, use the link in your invitation email, or ask your administrator."
        action={{ label: 'Sign out', onClick: signOut }}
      />
    )
  }
  const role = state.me.membership.role
  if (areaForRole(role) !== area) return <Navigate to={homePath(role)} replace />
  return children
}
