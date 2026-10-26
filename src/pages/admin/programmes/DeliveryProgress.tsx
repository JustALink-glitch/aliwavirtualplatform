import type { CohortSummary } from './data'
import { deliverySummary } from './labels'

/** Delivery cell: a thin progress bar over "6 of 30 sessions" (A1.02, A3.01). */
export function DeliveryProgress({ cohort }: { cohort: Pick<CohortSummary, 'status' | 'startsOn' | 'plannedSessions' | 'heldSessions'> }) {
  const showBar = cohort.status !== 'upcoming' && cohort.plannedSessions > 0
  const pct = showBar ? Math.min(100, Math.round((cohort.heldSessions / cohort.plannedSessions) * 100)) : 0
  return (
    <div className="flex flex-col gap-1">
      <span
        role={showBar ? 'progressbar' : undefined}
        aria-label={showBar ? 'Sessions held' : undefined}
        aria-valuenow={showBar ? cohort.heldSessions : undefined}
        aria-valuemin={showBar ? 0 : undefined}
        aria-valuemax={showBar ? cohort.plannedSessions : undefined}
        aria-hidden={showBar ? undefined : true}
        className="h-1.5 w-full max-w-[150px] overflow-hidden rounded-full bg-chart-track"
      >
        <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-caption text-secondary">{deliverySummary(cohort)}</span>
    </div>
  )
}
