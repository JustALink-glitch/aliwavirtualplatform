import clsx from 'clsx'
import { NavLink, Outlet } from 'react-router'
import { PageHeader, Panel } from '@/components/ui/Page'
import { settingsMenu } from './settingsMenu'

/** /admin/settings — F1 Settings frame: side menu on the left, the chosen page on the right. */
export function SettingsLayout() {
  return (
    <>
      <PageHeader title="Settings" description="Organisation-wide settings. Only Owners and Admins can see this area." />
      <div className="grid grid-cols-[216px_minmax(0,1fr)] items-start gap-6 max-lg:grid-cols-1 max-lg:gap-4">
        <nav aria-label="Settings" className="flex flex-col gap-4 max-lg:-mx-1 max-lg:flex-row max-lg:gap-1 max-lg:overflow-x-auto max-lg:px-1 max-lg:pb-1">
          {settingsMenu.map((section) => (
            <div key={section.group} className="flex flex-col gap-0.5 max-lg:contents">
              <p className="px-2.5 pb-1 text-caption text-secondary max-lg:hidden">{section.group}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'flex h-9 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-body-strong whitespace-nowrap transition-colors focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none',
                      isActive ? 'bg-surface-selected text-brand-text' : 'text-secondary hover:bg-surface-hover hover:text-primary',
                    )
                  }
                >
                  <item.icon size={16} className="shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="flex min-w-0 flex-col gap-4">
          <Outlet />
        </div>
      </div>
    </>
  )
}

/** A settings page that isn't built yet. */
export function SettingsComingSoon({ path }: { path: string }) {
  const item = settingsMenu.flatMap((s) => s.items).find((i) => i.path === path)!
  return (
    <>
      <SettingsTitle title={item.label} />
      <Panel className="py-10">
        <p className="text-center text-body text-secondary">Coming soon · Figma {item.screen}</p>
      </Panel>
    </>
  )
}

export function SettingsTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-heading-group text-primary">{title}</h2>
      {description && <p className="text-body text-secondary">{description}</p>}
    </div>
  )
}
