import type { ReactNode } from 'react'
import { PageHeader } from '@/components/ui/Page'
import { Tabs } from '@/components/ui/Tabs'

const descriptions = {
  sessions: 'Everything scheduled across your cohorts.',
  courses: 'Courses belong to a programme and run in each of its cohorts.',
  assignments: 'Every assignment trainers have published, across your cohorts.',
  reports: 'Trainers report after every session. Overdue reports show here.',
}

/** "Courses & sessions" header with the Sessions | Courses | Assignments | Session reports tabs (C1.01, A2.01, C4.01, C3.01). */
export function CoursesHeader({
  tab,
  actions,
  courseCount,
  assignmentCount,
  overdueReports,
}: {
  tab: 'sessions' | 'courses' | 'assignments' | 'reports'
  actions?: ReactNode
  courseCount?: number
  assignmentCount?: number
  /** Shown on the Session reports tab when some are overdue. */
  overdueReports?: number
}) {
  return (
    <>
      <PageHeader title="Courses & sessions" description={descriptions[tab]} actions={actions} />
      <Tabs
        label="Courses and sessions"
        items={[
          { label: 'Sessions', to: '/admin/courses', end: true },
          {
            label: 'Courses',
            to: '/admin/courses/library',
            ...(courseCount !== undefined && { count: courseCount }),
          },
          { label: 'Session reports', to: '/admin/courses/reports', ...(overdueReports ? { count: overdueReports } : {}) },
          {
            label: 'Assignments',
            to: '/admin/courses/assignments',
            ...(assignmentCount !== undefined && { count: assignmentCount }),
          },
        ]}
      />
    </>
  )
}
