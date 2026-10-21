import type { CohortSummary } from './data'
import { deliverySummary } from './labels'

/** Delivery cell: "6 of 30 sessions" over a thin progress bar (A1.02, A3.01). */
export function DeliveryProgress({ cohort }: { cohort: Pick<CohortSummary, 'status' | 'startsOn' | 'plannedSessions' | 'heldSessions'> }) {
  const showBar = cohort.status !== 'upcoming' && cohort.plannedSessions > 0
  const pct = showBar ? Math.min(100, Math.round((cohort.heldSessions / cohort.plannedSessions) * 100)) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption text-secondary">{deliverySummary(cohort)}</span>
      {showBar && (
        <span
          role="progressbar"
          aria-label="Sessions held"
          aria-valuenow={cohort.heldSessions}
          aria-valuemin={0}
          aria-valuemax={cohort.plannedSessions}
          className="h-1 w-full overflow-hidden rounded-full bg-chart-track"
        >
          <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </span>
      )}
    </div>
  )
}
