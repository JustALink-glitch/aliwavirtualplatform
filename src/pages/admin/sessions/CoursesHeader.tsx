import type { ReactNode } from 'react'
import { PageHeader } from '@/components/ui/Page'
import { Tabs } from '@/components/ui/Tabs'

/** "Courses & sessions" header with the Sessions | Courses tabs (C1.01, A2.01). */
export function CoursesHeader({ tab, actions, courseCount }: { tab: 'sessions' | 'courses'; actions?: ReactNode; courseCount?: number }) {
  return (
    <>
      <PageHeader
        title="Courses & sessions"
        description={tab === 'sessions' ? 'Everything scheduled across your cohorts.' : 'Courses belong to a programme and run in each of its cohorts.'}
        actions={actions}
      />
      <Tabs
        label="Courses and sessions"
        items={[
          { label: 'Sessions', to: '/admin/courses', end: true },
          { label: 'Courses', to: '/admin/courses/library', ...(courseCount !== undefined && { count: courseCount }) },
        ]}
      />
    </>
  )
}
