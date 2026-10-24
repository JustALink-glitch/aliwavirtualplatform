import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Choice'
import { Dialog } from '@/components/ui/Dialog'
import { DetailList } from '@/components/ui/FormLayout'
import { ChartIcon, CheckCircleIcon, ChevronRightIcon, InfoTriangleIcon } from '@/components/ui/icons'
import { Metrics } from '@/components/ui/Metrics'
import { Badge, EmptyState, FilterChips, Panel } from '@/components/ui/Page'
import { Cell, Row, Table, TableFooter, type Column } from '@/components/ui/Table'
import { ApiError } from '@/lib/api'
import { formatDate, formatDay, plural, todayIn } from '@/lib/format'
import { paginate } from '@/lib/paginate'
import { initials } from '@/lib/people'
import { useCertificates, useIssueCertificates, type CertificateRow, type CertificatesResponse, type CompletionStatus } from './data'
import { ParticipantsHeader } from './ParticipantsHeader'

type Filter = 'all' | CompletionStatus

const columns: Column[] = [
  { label: 'Participant' },
  { label: 'Cohort', width: 220 },
  { label: 'Cohort ended', width: 150, hideBelow: 'lg' },
  { label: 'Certificate', width: 150 },
  { label: 'Issued', width: 130, hideBelow: 'xl' },
  { label: '', width: 110, align: 'right' },
]

const certificateBadge: Record<CompletionStatus, { tone: 'info' | 'success' | 'neutral' | 'warning'; label: string }> = {
  eligible: { tone: 'info', label: 'Eligible' },
  issued: { tone: 'success', label: 'Issued' },
  not_yet: { tone: 'neutral', label: 'Not yet eligible' },
  not_completed: { tone: 'warning', label: 'Not completed' },
}

const order: Record<CompletionStatus, number> = { eligible: 0, issued: 1, not_completed: 2, not_yet: 3 }

/** /admin/participants/certificates — D2.01 Certificates. */
export function CertificatesPage() {
  const query = useCertificates()
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)
  const [issuing, setIssuing] = useState<string[] | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const data = query.data
  const eligible = data?.enrolments.filter((e) => e.status === 'eligible') ?? []

  return (
    <>
      <ParticipantsHeader
        actions={
          <Button icon={<CheckCircleIcon size={16} />} disabled={!eligible.length} onClick={() => setIssuing(eligible.map((e) => e.enrolmentId))}>
            {eligible.length ? `Issue ${plural(eligible.length, 'certificate')}` : 'Issue certificates'}
          </Button>
        }
      />
      {notice && (
        <AlertBanner tone="success" title={notice}>
          They can download it from Grades & feedback.
        </AlertBanner>
      )}
      {query.isPending ? (
        <Panel aria-busy="true" aria-label="Loading certificates" className="h-[240px]">
          <span className="sr-only">Loading certificates</span>
        </Panel>
      ) : query.isError ? (
        <Panel>
          <StatePanel
            kind="error"
            title="Couldn’t load certificates"
            description="Check your connection and try again."
            action={{ label: 'Try again', onClick: () => void query.refetch() }}
          />
        </Panel>
      ) : (
        <CertificatesBody
          data={query.data}
          filter={filter}
          page={page}
          onFilter={(f) => {
            setFilter(f)
            setPage(1)
          }}
          onPage={setPage}
          onIssue={(id) => setIssuing([id])}
        />
      )}
      {data && issuing && (
        <IssueCertificatesDialog
          data={data}
          candidates={eligible}
          initial={issuing}
          onClose={() => setIssuing(null)}
          onDone={(count) => {
            setIssuing(null)
            setNotice(`${plural(count, 'certificate')} issued`)
          }}
        />
      )}
    </>
  )
}

function CertificatesBody({
  data,
  filter,
  page,
  onFilter,
  onPage,
  onIssue,
}: {
  data: CertificatesResponse
  filter: Filter
  page: number
  onFilter: (f: Filter) => void
  onPage: (page: number) => void
  onIssue: (enrolmentId: string) => void
}) {
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const all = [...data.enrolments].sort((a, b) => order[a.status] - order[b.status] || a.cohort.endsOn.localeCompare(b.cohort.endsOn))
  const visible = all.filter((e) => filter === 'all' || e.status === filter)
  const paged = paginate(visible, page)
  const count = (s: CompletionStatus) => all.filter((e) => e.status === s).length
  const { counts } = data
  const rate = counts.inEndedCohorts ? Math.round((counts.completed / counts.inEndedCohorts) * 100) : null

  return (
    <>
      <AlertBanner tone="info" title="Completion rule">
        {data.rule.sentence} Change it in{' '}
        <Link to="/admin/settings/completion" className="text-brand-text hover:underline">
          Settings › Completion & certificates
        </Link>
        .
      </AlertBanner>
      <Metrics
        items={[
          {
            label: 'Eligible, not issued',
            icon: <InfoTriangleIcon size={18} />,
            value: counts.eligible,
            context: counts.eligible ? 'Waiting for an admin' : 'No one waiting',
          },
          { label: 'Issued', icon: <CheckCircleIcon size={18} />, value: counts.issuedThisYear, context: 'All cohorts, this year' },
          {
            label: 'Completion rate',
            icon: <ChartIcon size={18} />,
            value: rate === null ? '—' : `${rate}%`,
            context: counts.inEndedCohorts ? `${counts.completed} of ${counts.inEndedCohorts} in completed cohorts` : 'No cohort has ended yet',
          },
        ]}
      />
      {all.length === 0 ? (
        <Panel className="py-12">
          <EmptyState
            icon={<CheckCircleIcon size={24} />}
            title="No one to certify yet"
            body="When participants are enrolled in a cohort, they show here with where they stand against the completion rule. Certificates can be issued once their cohort ends."
          />
        </Panel>
      ) : (
        <>
          <FilterChips
            label="Certificate"
            value={filter}
            onChange={onFilter}
            options={[
              { value: 'all', label: 'All', count: all.length },
              { value: 'eligible', label: 'Eligible', count: count('eligible') },
              { value: 'issued', label: 'Issued', count: count('issued') },
              { value: 'not_yet', label: 'Not yet eligible', count: count('not_yet') },
              ...(count('not_completed') ? [{ value: 'not_completed' as const, label: 'Not completed', count: count('not_completed') }] : []),
            ]}
          />
          <Panel className="gap-0 max-md:py-2">
            {visible.length === 0 ? (
              <p role="status" className="p-8 text-center text-body text-secondary">
                No one here right now.
              </p>
            ) : (
              <>
                <div className="max-md:hidden">
                  <Table columns={columns}>
                    {paged.rows.map((e) => (
                      <Row key={e.enrolmentId} to={`/admin/participants/${e.participant.id}`}>
                        <Cell>
                          <span className="flex min-w-0 items-center gap-3">
                            <Avatar initials={initials(e.participant.name)} seed={e.participant.id} />
                            <span className="truncate text-body-strong text-primary">{e.participant.name}</span>
                          </span>
                        </Cell>
                        <Cell className="truncate">{e.cohort.name}</Cell>
                        <Cell hideBelow="lg" className="tabular-nums">
                          {e.cohort.ended ? formatDate(e.cohort.endsOn) : <span className="text-secondary">Ends {formatDate(e.cohort.endsOn)}</span>}
                        </Cell>
                        <Cell>
                          <Badge tone={certificateBadge[e.status].tone}>{certificateBadge[e.status].label}</Badge>
                        </Cell>
                        <Cell hideBelow="xl" className="tabular-nums">
                          {e.certificate ? formatDay(e.certificate.issuedAt, timeZone) : <span className="text-muted">—</span>}
                        </Cell>
                        <Cell align="right">
                          <RowAction row={e} onIssue={onIssue} />
                        </Cell>
                      </Row>
                    ))}
                  </Table>
                </div>
                <ul className="md:hidden">
                  {paged.rows.map((e) => (
                    <li key={e.enrolmentId} className="flex items-center gap-3 border-b border-default py-3 last:border-b-0">
                      <Avatar size={32} initials={initials(e.participant.name)} seed={e.participant.id} />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate text-body-strong text-primary">{e.participant.name}</span>
                        <span className="truncate text-caption text-secondary">
                          {e.cohort.name} · {e.cohort.ended ? `ended ${formatDate(e.cohort.endsOn)}` : `ends ${formatDate(e.cohort.endsOn)}`}
                        </span>
                        <span>
                          <Badge tone={certificateBadge[e.status].tone}>{certificateBadge[e.status].label}</Badge>
                        </span>
                      </span>
                      <RowAction row={e} onIssue={onIssue} />
                    </li>
                  ))}
                </ul>
              </>
            )}
            <TableFooter summary={plural(visible.length, 'participant')} page={paged.page} pageCount={paged.pageCount} onPage={onPage} />
          </Panel>
        </>
      )}
    </>
  )
}

function RowAction({ row, onIssue }: { row: CertificateRow; onIssue: (id: string) => void }) {
  const style = 'inline-flex h-9 items-center gap-1 text-caption-strong text-brand-text hover:underline focus-visible:underline focus-visible:outline-none'
  if (row.status === 'eligible') {
    return (
      <button
        type="button"
        className={style}
        onClick={(event) => {
          event.stopPropagation()
          onIssue(row.enrolmentId)
        }}
      >
        Issue
        <ChevronRightIcon size={14} />
      </button>
    )
  }
  if (row.certificate) {
    return (
      <Link to={`/admin/participants/certificates/${row.certificate.id}`} onClick={(event) => event.stopPropagation()} className={style}>
        Download
        <ChevronRightIcon size={14} />
      </Link>
    )
  }
  return null
}

/** D2.02 Issue certificates: tick who gets one; title, signatory and date come from Settings. */
export function IssueCertificatesDialog({
  data,
  candidates,
  initial,
  onClose,
  onDone,
}: {
  data: CertificatesResponse
  candidates: CertificateRow[]
  initial: string[]
  onClose: () => void
  onDone: (count: number) => void
}) {
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const issue = useIssueCertificates()
  const [selected, setSelected] = useState<string[]>(initial)
  const [notify, setNotify] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // One person from the row, or everyone eligible from the header.
  const list = initial.length === 1 ? candidates.filter((c) => c.enrolmentId === initial[0]) : candidates
  const cohorts = [...new Set(list.map((c) => c.cohort.id))]
  const first = list[0]
  const allChecked = list.length > 0 && list.every((c) => selected.includes(c.enrolmentId))
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  async function submit() {
    setError(null)
    try {
      const result = await issue.mutateAsync({ enrolmentIds: selected, notify })
      onDone(result.issued)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Couldn’t issue certificates. Try again.')
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={selected.length ? `Issue ${plural(selected.length, 'certificate')}` : 'Issue certificates'}
      description={cohorts.length === 1 && first ? `${first.cohort.name} · ${first.cohort.programmeName}` : `${plural(cohorts.length, 'cohort')}`}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={!selected.length || issue.isPending}>
            {issue.isPending ? 'Issuing…' : selected.length ? `Issue ${plural(selected.length, 'certificate')}` : 'Issue certificates'}
          </Button>
        </>
      }
    >
      {error && <AlertBanner tone="error" title={error} />}
      <fieldset className="flex max-h-[240px] flex-col gap-2.5 overflow-y-auto">
        <legend className="sr-only">Participants</legend>
        {list.length > 1 && (
          <Checkbox label={`Select all ${list.length}`} checked={allChecked} onChange={() => setSelected(allChecked ? [] : list.map((c) => c.enrolmentId))} />
        )}
        {list.map((c) => (
          <Checkbox
            key={c.enrolmentId}
            checked={selected.includes(c.enrolmentId)}
            onChange={() => toggle(c.enrolmentId)}
            label={cohorts.length > 1 ? `${c.participant.name} · ${c.cohort.name}` : c.participant.name}
          />
        ))}
      </fieldset>
      <DetailList
        items={[
          { label: 'Title', value: data.certificate.title },
          {
            label: 'Signed by',
            value: data.certificate.signedBy ?? (
              <Link to="/admin/settings/completion" className="font-normal text-brand-text hover:underline">
                Add a signatory
              </Link>
            ),
          },
          { label: 'Issue date', value: formatDate(todayIn(timeZone)) },
        ]}
      />
      <Checkbox label="Email each participant a download link" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
    </Dialog>
  )
}
