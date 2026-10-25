import { Button } from '@/components/ui/Button'
import { Panel, PanelHeader } from '@/components/ui/Page'
import { SettingsTitle } from './SettingsLayout'

/**
 * /admin/settings/billing — F1.03 Plan & billing. Plans, invoices and payment are designed once the
 * commercial model (PRD §K) is approved, so this shows the current plan only.
 */
export function BillingPage() {
  const rows: [string, string][] = [
    ['Plan', 'Free'],
    ['Payment details', 'None on file'],
    ['Managed by', 'Owner and Admins'],
  ]
  return (
    <>
      <SettingsTitle title="Plan & billing" description="Only Owners and Admins see this page. Trainers and participants never do." />
      <Panel aria-labelledby="plan-title" className="gap-0">
        <PanelHeader id="plan-title" title="Current plan" />
        <dl className="mt-2 flex flex-col">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-4 border-b border-default py-3 text-body">
              <dt className="w-[134px] shrink-0 text-secondary">{k}</dt>
              <dd className="text-body-strong text-primary">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col items-start gap-2 pt-3">
          <p className="text-caption text-secondary">Paid plans aren’t available yet. Nothing is charged.</p>
          <Button variant="secondary" disabled>
            Change plan
          </Button>
        </div>
      </Panel>
    </>
  )
}
