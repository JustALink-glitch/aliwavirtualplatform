import { Link } from 'react-router'
import { CalendarIcon, ChevronRightIcon } from '@/components/ui/icons'
import { EmptyState, Panel, PanelHeader } from '@/components/ui/Page'
import { formatDay, localDate, todayIn } from '@/lib/format'
import type { CohortSummary } from '@/pages/admin/programmes/data'
import { useSessions } from './data'
import { SessionRow } from './SessionRow'

/** A3.02 "Upcoming sessions": the next three, grouped by day. */
export function UpcomingSessions({ cohort }: { cohort: CohortSummary }) {
  const query = useSessions({ cohortId: cohort.id })
  const timeZone = query.data?.timeZone
  const all = (query.data?.sessions ?? []).filter((s) => !s.cancelled)
  const upcoming = all.filter((s) => s.status === 'scheduled' || s.status === 'in_progress').slice(0, 3)
  const today = todayIn(timeZone)

  return (
    <Panel aria-labelledby="upcoming-title" aria-busy={query.isPending}>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <PanelHeader id="upcoming-title" title="Upcoming sessions" />
        </div>
        {all.length > 0 && (
          <Link to="sessions" className="inline-flex items-center gap-1 text-caption-strong text-brand-text hover:underline">
            All {all.length} sessions
            <ChevronRightIcon size={14} />
          </Link>
        )}
      </div>
      {query.isPending ? (
        <div className="h-24" />
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={24} />}
          title={all.length ? 'No more sessions scheduled' : 'No sessions scheduled yet'}
          body={
            all.length
              ? 'Every scheduled session has been held. Schedule more from the Sessions tab.'
              : 'Sessions you schedule for this cohort’s courses appear here, with who’s teaching and where.'
          }
        />
      ) : (
        <ul>
          {upcoming.map((s, i) => {
            const day = localDate(s.startsAt, timeZone)
            const showDay = i === 0 || localDate(upcoming[i - 1]!.startsAt, timeZone) !== day
            return (
              <li key={s.id}>
                {showDay && (
                  <p className="pt-2 text-caption-strong text-secondary">
                    {day === today ? 'Today · ' : ''}
                    {formatDay(s.startsAt, timeZone)}
                  </p>
                )}
                <ul>
                  <SessionRow session={s} timeZone={timeZone} showCohort={false} />
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
