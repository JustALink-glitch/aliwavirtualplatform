import logo from '@/assets/synqop-logo.svg'
import { formatDate } from '@/lib/format'
import type { Certificate } from './data'

/** The certificate as printed (P7.02, F1.05 preview). Prints on its own via the .print-certificate rule. */
export function CertificateCard({
  certificate,
  preview = false,
}: {
  certificate: Omit<Certificate, 'id' | 'issuedAt' | 'participant'> & { participant: { name: string } }
  preview?: boolean
}) {
  return (
    <section
      aria-label={preview ? 'Certificate preview' : 'Certificate'}
      className={
        preview
          ? 'flex flex-col items-center gap-2 rounded-md border border-default bg-canvas px-6 py-7 text-center'
          : 'print-certificate flex flex-col items-center rounded-lg border border-default bg-surface px-6 py-12 text-center shadow-[0_1px_2px_rgb(15_23_41/0.04),0_4px_12px_-2px_rgb(15_23_41/0.03)] max-md:py-8'
      }
    >
      <div className="flex max-w-[560px] flex-col items-center gap-2 print:mt-[22vh]">
        {!preview && <img src={logo} alt="Synqop" className="mb-3 h-5 w-auto" />}
        <p className={preview ? 'text-heading-section text-primary' : 'text-caption text-secondary'}>{certificate.title}</p>
        <p className="text-heading-group text-primary">{certificate.participant.name}</p>
        <p className="text-body text-primary">
          has completed {certificate.programme} · {certificate.cohort.name}
        </p>
        <p className="text-caption text-secondary">
          {certificate.organisation} · {formatDate(certificate.cohort.endsOn, { year: true })}
        </p>
        {!preview && certificate.signedBy && <p className="pt-1 text-body-strong text-primary">{certificate.signedBy}</p>}
        {!preview && certificate.code && <p className="text-caption text-muted">Certificate ID {certificate.code}</p>}
      </div>
    </section>
  )
}
