import { useLocation } from 'react-router'

/** Where session screens live: C1/C2 under Courses & sessions for admins, T3/T4 under My sessions for trainers. */
export function sessionPaths(area: 'admin' | 'trainer') {
  return area === 'trainer'
    ? {
        area,
        list: '/trainer/sessions',
        listLabel: 'My sessions',
        session: (id: string) => `/trainer/sessions/${id}`,
        newSession: (cohortId?: string) => `/trainer/sessions/new${cohortId ? `?cohort=${cohortId}` : ''}`,
        cohort: (id: string) => `/trainer/cohorts/${id}`,
        cohortSessions: (id: string) => `/trainer/cohorts/${id}/sessions`,
        trainer: null as ((id: string) => string) | null,
      }
    : {
        area,
        list: '/admin/courses',
        listLabel: 'Courses & sessions',
        session: (id: string) => `/admin/courses/sessions/${id}`,
        newSession: (cohortId?: string) => `/admin/courses/sessions/new${cohortId ? `?cohort=${cohortId}` : ''}`,
        cohort: (id: string) => `/admin/cohorts/${id}`,
        cohortSessions: (id: string) => `/admin/cohorts/${id}/sessions`,
        trainer: (id: string) => `/admin/trainers/${id}`,
      }
}

/** The session paths for the area this page is shown in. */
export function useSessionPaths() {
  const { pathname } = useLocation()
  return sessionPaths(pathname.startsWith('/trainer') ? 'trainer' : 'admin')
}
