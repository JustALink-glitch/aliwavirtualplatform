import { ChevronRightIcon } from '@/components/ui/icons'
import { Badge } from '@/components/ui/Page'
import { Cell, Row, Stacked, Table, type Column } from '@/components/ui/Table'
import { formatDay, formatTime } from '@/lib/format'
import { statusLabel, statusTone } from '@/pages/assignments/data'
import type { LearningAssignment } from './data'

const workColumns: Column[] = [
  { label: 'Assignment' },
  { label: 'Due', width: 150, hideBelow: 'lg' },
  { label: 'Status', width: 130 },
  { label: 'Grade', width: 90, align: 'right', hideBelow: 'lg' },
  { label: '', width: 60 },
]
/** B1.04 / T7.02 A participant's assignments: due, status, grade. */
export function AssignmentsTable({
  rows,
  loading,
  timeZone,
  linkFor,
}: {
  rows: LearningAssignment[]
  loading: boolean
  timeZone: string | undefined
  linkFor: (row: LearningAssignment) => string
}) {
  if (loading) return <div className="h-24" aria-busy="true" />
  if (rows.length === 0) return <p className="py-3 text-body text-secondary">No assignments published yet.</p>
  return (
    <div className="mt-2">
      <Table columns={workColumns}>
        {rows.map((a) => (
          <Row key={a.id} to={linkFor(a)}>
            <Cell>
              <Stacked primary={a.title} secondary={a.course} />
            </Cell>
            <Cell hideBelow="lg">
              <Stacked
                primary={`${formatDay(a.dueAt, timeZone)}, ${formatTime(a.dueAt, timeZone)}`}
                secondary={
                  a.submittedAt ? `Submitted ${formatDay(a.submittedAt, timeZone)}` : a.status === 'overdue' ? `${daysSince(a.dueAt)} overdue` : undefined
                }
              />
            </Cell>
            <Cell>
              <Badge tone={statusTone[a.status]}>{statusLabel[a.status]}</Badge>
            </Cell>
            <Cell align="right" hideBelow="lg" className={a.grade ? 'text-body-strong' : 'text-muted'}>
              {a.grade ?? '—'}
            </Cell>
            <Cell>
              <span className="inline-flex items-center gap-1 text-caption-strong text-brand-text">
                View
                <ChevronRightIcon size={14} />
              </span>
            </Cell>
          </Row>
        ))}
      </Table>
    </div>
  )
}

const daysSince = (iso: string) => {
  const days = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
  return days === 1 ? '1 day' : `${days} days`
}
