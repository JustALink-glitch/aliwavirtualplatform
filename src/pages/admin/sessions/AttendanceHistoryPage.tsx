import { useParams } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { Button } from '@/components/ui/Button'
import { DownloadIcon } from '@/components/ui/icons'
import { PageHeader, Panel } from '@/components/ui/Page'
import { Cell, Row, Table, type Column } from '@/components/ui/Table'
import { formatDay, formatTime, plural } from '@/lib/format'
import { downloadCsv, markLabel, useAttendanceHistory, type HistoryEntry } from './attendanceData'
import { useSession } from './data'

const columns: Column[] = [
  { label: 'When', width: 150 },
  { label: 'Participant', width: 200 },
  { label: 'Change', width: 200 },
  { label: 'By', width: 170, hideBelow: 'lg' },
  { label: 'Reason' },
]

const describe = (e: HistoryEntry) =>
  e.kind === 'change'
    ? `${e.from ? markLabel[e.from] : 'Not recorded'} → ${markLabel[e.to]}`
    : `Register saved · ${[e.present && `${e.present} present`, e.absent && `${e.absent} absent`, e.excused && `${e.excused} excused`].filter(Boolean).join(', ')}`

/** /admin/courses/sessions/:id/attendance/history — C2.05 Attendance history. */
export function AttendanceHistoryPage() {
  const { id = '' } = useParams()
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const session = useSession(id)
  const history = useAttendanceHistory(id)
  const s = session.data?.session
  const day = s ? formatDay(s.startsAt, timeZone) : ''
  const when = (at: string) => `${formatDay(at, timeZone)}, ${formatTime(at, timeZone)}`
  const entries = history.data?.entries ?? []

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: 'Courses & sessions', to: '/admin/courses' },
          ...(s
            ? [
                {
                  label: `${s.title} · ${day}`,
                  to: `/admin/courses/sessions/${id}/attendance`,
                },
              ]
            : []),
          { label: 'Attendance history' },
        ]}
        title="Attendance history"
        description={s ? `${s.title} · ${s.cohort.name} · ${day}. Every change to this register, newest first.` : undefined}
        actions={
          entries.length > 0 && (
            <Button
              variant="secondary"
              icon={<DownloadIcon size={16} />}
              onClick={() =>
                downloadCsv(`attendance-history-${id.slice(0, 8)}.csv`, [
                  ['When', 'Participant', 'Change', 'By', 'Reason'],
                  ...entries.map((e) => [
                    when(e.at),
                    e.kind === 'change' ? e.participant : plural(e.marked, 'participant'),
                    describe(e),
                    e.by ?? '',
                    e.kind === 'change' ? e.reason : '',
                  ]),
                ])
              }
            >
              Export CSV
            </Button>
          )
        }
      />
      <Panel className="gap-3">
        {history.isPending ? (
          <div aria-busy="true" className="h-32" />
        ) : history.isError ? (
          <StatePanel kind="error" title="Couldn’t load the history" />
        ) : entries.length === 0 ? (
          <StatePanel kind="empty" title="No attendance recorded yet" description="When the register is saved or a mark changes, it appears here." />
        ) : (
          <>
            <ol className="md:hidden">
              {entries.map((e, i) => (
                <li key={`${e.at}-${i}`} className="flex flex-col gap-0.5 border-b border-default py-3 last:border-b-0">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-body-strong text-primary">{e.kind === 'change' ? e.participant : plural(e.marked, 'participant')}</span>
                    <span className="shrink-0 text-caption text-secondary tabular-nums">{when(e.at)}</span>
                  </span>
                  <span className="text-body">{describe(e)}</span>
                  {e.kind === 'change' && (
                    <span className="text-caption text-secondary">
                      “{e.reason}”{e.by ? ` — ${e.by}` : ''}
                    </span>
                  )}
                  {e.kind === 'register' && e.by && <span className="text-caption text-secondary">{e.by}</span>}
                </li>
              ))}
            </ol>
            <div className="max-md:hidden">
              <Table columns={columns}>
                {entries.map((e, i) => (
                  <Row key={`${e.at}-${i}`}>
                    <Cell className="text-secondary tabular-nums">{when(e.at)}</Cell>
                    <Cell className="text-body-strong">{e.kind === 'change' ? e.participant : plural(e.marked, 'participant')}</Cell>
                    <Cell>{describe(e)}</Cell>
                    <Cell hideBelow="lg">{e.by ?? <span className="text-muted">Synqop</span>}</Cell>
                    <Cell className={e.kind === 'change' ? undefined : 'text-muted'}>{e.kind === 'change' ? e.reason : '—'}</Cell>
                  </Row>
                ))}
              </Table>
            </div>
          </>
        )}
        <p className="text-caption text-secondary">
          Changes need a reason. Admins and the session’s trainers can edit attendance; edits are kept for the life of the cohort.
        </p>
      </Panel>
    </>
  )
}
