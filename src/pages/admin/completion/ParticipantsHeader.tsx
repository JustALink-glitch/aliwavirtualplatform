import type { ReactNode } from 'react'
import { PageHeader } from '@/components/ui/Page'
import { Tabs } from '@/components/ui/Tabs'
import { plural } from '@/lib/format'
import { useParticipants } from '@/pages/admin/participants/data'
import { useCertificates } from './data'

/** "Participants" header with the Participants | Certificates | Outcomes tabs (B1.01, D2.01, D3.01). */
export function ParticipantsHeader({ actions }: { actions?: ReactNode }) {
  const participants = useParticipants()
  const certificates = useCertificates()
  const summary = participants.data?.summary
  const total = participants.data?.participants.length
  return (
    <>
      <PageHeader
        title="Participants"
        description={
          summary && total
            ? `${plural(summary.inActiveCohorts, 'person', 'people')} in active cohorts · ${summary.inUpcomingCohorts} enrolled in upcoming cohorts.`
            : 'People enrolled in your cohorts.'
        }
        actions={actions}
      />
      <Tabs
        label="Participants"
        items={[
          { label: 'Participants', to: '/admin/participants', end: true, ...(total !== undefined && { count: total }) },
          { label: 'Certificates', to: '/admin/participants/certificates', ...(certificates.data && { count: certificates.data.counts.eligible }) },
          { label: 'Outcomes', to: '/admin/participants/outcomes' },
        ]}
      />
    </>
  )
}
