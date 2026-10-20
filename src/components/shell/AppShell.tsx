import clsx from 'clsx'
import { LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { navFor, type NavItem } from '@/app/navigation'
import { useAuth } from '@/auth/useAuth'
import type { Area } from '@/lib/roles'

/**
 * App shell (§09 Navigation): sidebar + top bar. Desktop layout only for now;
 * the tablet icon rail and mobile drawer (G1.05) come with the shell build-out.
 */
export function AppShell({ area }: { area: Area }) {
  const { state, signOut } = useAuth()
  if (state.status !== 'signed-in') return null

  const items = navFor(area, state.me.membership.role)
  const main = items.filter((item) => !item.bottom)
  const bottom = items.filter((item) => item.bottom)

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="flex w-sidebar shrink-0 flex-col border-r border-default bg-surface max-md:hidden">
        <div className="flex h-topbar items-center px-5 text-heading-section">Synqop</div>
        <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5 px-3">
          {main.map((item) => (
            <SidebarLink key={item.path} area={area} item={item} />
          ))}
          <div className="mt-auto pb-3">
            {bottom.map((item) => (
              <SidebarLink key={item.path} area={area} item={item} />
            ))}
          </div>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-topbar items-center justify-end gap-3 border-b border-default bg-surface px-gutter">
          <span className="text-body text-secondary">{state.me.user.email}</span>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-label-button text-secondary hover:bg-surface-hover"
          >
            <LogOut aria-hidden className="size-4" />
            Sign out
          </button>
        </header>
        <main className="flex-1 px-gutter py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarLink({ area, item }: { area: Area; item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path ? `/${area}/${item.path}` : `/${area}`}
      end={!item.path}
      className={({ isActive }) =>
        clsx(
          'flex h-9 items-center gap-2.5 rounded-md px-2.5 text-label-nav',
          isActive ? 'bg-surface-selected text-brand-text' : 'text-secondary hover:bg-surface-hover hover:text-primary',
        )
      }
    >
      <Icon aria-hidden className="size-5" />
      <span className="max-lg:sr-only">{item.label}</span>
    </NavLink>
  )
}
