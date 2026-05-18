import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ROLE_HOME = {
  admin: '/admin/dashboard',
  trainer: '/trainer/dashboard',
  student: '/student/dashboard',
}

/**
 * Protects routes that require authentication.
 * - If not logged in → redirect to /login
 * - If logged in but role not allowed → redirect to their home dashboard
 * - If auth is still loading → show spinner
 *
 * @param {string[]} allowedRoles - e.g. ['admin'] or ['trainer', 'student']
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth()

  // Still resolving session from localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center font-[Manrope,sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated → go to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Role check — if allowedRoles specified, enforce it
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const home = ROLE_HOME[user.role] || '/login'
    return <Navigate to={home} replace />
  }

  return children
}
