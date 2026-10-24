import { useParams } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { Button } from '@/components/ui/Button'
import { DownloadIcon } from '@/components/ui/icons'
import { PageHeader, Panel } from '@/components/ui/Page'
import { formatDay } from '@/lib/format'
import { CertificateCard } from './CertificateCard'
import { printCertificate, useCertificate } from './data'

/** /admin/participants/certificates/:id — a certificate from D2.01, ready to download. */
export function AdminCertificatePage() {
  const { id = '' } = useParams()
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const query = useCertificate(id)
  if (query.isPending) return <div aria-busy="true" aria-label="Loading certificate" className="h-40" />
  if (query.isError) {
    return (
      <Panel>
        <StatePanel kind="no-results" title="Certificate not found" description="It may have been revoked." />
      </Panel>
    )
  }
  const { certificate } = query.data
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Certificates', to: '/admin/participants/certificates' }, { label: certificate.participant.name }]}
        title={`${certificate.participant.name}’s certificate`}
        description={`Issued ${formatDay(certificate.issuedAt, timeZone)} · ${certificate.cohort.name}`}
        actions={
          <Button icon={<DownloadIcon size={16} />} onClick={printCertificate}>
            Download PDF
          </Button>
        }
      />
      <div className="max-w-[760px]">
        <CertificateCard certificate={certificate} />
      </div>
      <p className="text-caption text-secondary">Choose “Save as PDF” in the print dialog to keep a copy.</p>
    </>
  )
}
