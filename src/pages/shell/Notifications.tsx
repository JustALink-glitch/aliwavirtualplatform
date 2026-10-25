import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { StatePanel } from '@/components/StatePanel'
import { BellIcon, ChevronRightIcon } from '@/components/ui/icons'
import { PageHeader, Panel } from '@/components/ui/Page'
import type { Area } from '@/lib/roles'
import { notificationTime, useMarkRead, useNotifications, type AppNotification } from './data'
import { eventIcons } from './icons'

/** Where each area changes its notification choices; trainers don't have that page yet. */
const settingsPath: Partial<Record<Area, string>> = { admin: '/admin/settings/notifications', participant: '/participant/settings' }

function NotificationItem({ n, timeZone, onOpen }: { n: AppNotification; timeZone?: string; onOpen: (n: AppNotification) => void }) {
  const Icon = eventIcons[n.event] ?? BellIcon
  const content = (
    <>
      <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-icon">
        <Icon size={16} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={clsx('text-body text-primary', !n.readAt && 'font-medium')}>{n.title}</span>
        {n.body && <span className="text-caption text-secondary">{n.body}</span>}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-caption whitespace-nowrap text-secondary">{notificationTime(n.createdAt, timeZone)}</span>
        {!n.readAt && (
          <span className="size-2 rounded-full bg-brand">
            <span className="sr-only">Unread</span>
          </span>
        )}
      </span>
    </>
  )
  return (
    <li className="border-b border-default last:border-b-0">
      <button
        type="button"
        onClick={() => onOpen(n)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
      >
        {content}
      </button>
    </li>
  )
}

function useOpenNotification(onDone?: () => void) {
  const navigate = useNavigate()
  const read = useMarkRead()
  return (n: AppNotification) => {
    if (!n.readAt) read.mutate(n.id)
    onDone?.()
    if (n.link) navigate(n.link)
  }
}

/** G1.01 The bell in the top bar: a popover on desktop, the Notifications page on phones. */
export function NotificationsBell({ area, size = 36 }: { area: Area; size?: 36 | 44 }) {
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const query = useNotifications(20)
  const read = useMarkRead()
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const openItem = useOpenNotification(() => setOpen(false))
  const unread = query.data?.unread ?? 0
  const label = unread ? `Notifications, ${unread} unread` : 'Notifications'

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => !wrapper.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const buttonClass = clsx(
    'relative inline-flex shrink-0 items-center justify-center rounded-md text-icon hover:bg-surface-hover',
    'focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none',
    size === 36 ? 'size-9 border border-default' : 'size-11',
  )
  const dot = unread > 0 && (
    <span
      aria-hidden="true"
      className={clsx('absolute size-2 rounded-full bg-destructive ring-2 ring-surface', size === 36 ? 'top-1.5 right-1.5' : 'top-2 right-2.5')}
    />
  )

  if (size === 44)
    return (
      <Link to={`/${area}/notifications`} aria-label={label} className={buttonClass}>
        <BellIcon size={22} />
        {dot}
      </Link>
    )

  const items = (query.data?.notifications ?? []).slice(0, 6)
  return (
    <div ref={wrapper} className="relative">
      <button type="button" aria-label={label} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={buttonClass}>
        <BellIcon size={18} />
        {dot}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute top-[calc(100%+8px)] right-0 z-30 flex w-[400px] max-w-[calc(100vw-32px)] flex-col rounded-lg border border-default bg-surface shadow-[var(--shadow-overlay)]"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-heading-section text-primary">Notifications</h2>
            {unread > 0 && (
              <button type="button" onClick={() => read.mutate('all')} className="text-body-strong text-brand-text hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          {query.isPending ? (
            <div aria-busy="true" className="h-32" />
          ) : query.isError ? (
            <p className="px-4 py-6 text-center text-body text-secondary">Couldn’t load notifications. Try again in a moment.</p>
          ) : items.length === 0 ? (
            <p className="px-4 pt-4 pb-8 text-center text-body text-secondary">You’re all caught up. New activity shows here.</p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto border-t border-default">
              {items.map((n) => (
                <NotificationItem key={n.id} n={n} timeZone={timeZone} onOpen={openItem} />
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between border-t border-default px-4 py-3">
            {settingsPath[area] ? (
              <Link
                to={settingsPath[area]}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-body-strong text-brand-text hover:underline"
              >
                Notification settings
                <ChevronRightIcon size={14} />
              </Link>
            ) : (
              <span />
            )}
            <Link to={`/${area}/notifications`} onClick={() => setOpen(false)} className="text-body-strong text-brand-text hover:underline">
              See all
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

/** /:area/notifications — G1.01 on phones, and "See all" on desktop. */
export function NotificationsPage({ area }: { area: Area }) {
  const { state } = useAuth()
  const timeZone = state.status === 'signed-in' ? state.me.organisation?.timeZone : undefined
  const query = useNotifications(100)
  const read = useMarkRead()
  const openItem = useOpenNotification()
  const unread = query.data?.unread ?? 0
  return (
    <>
      <PageHeader
        title="Notifications"
        description={query.data ? (unread ? `${unread} unread` : 'All caught up') : undefined}
        actions={
          unread > 0 ? (
            <button type="button" onClick={() => read.mutate('all')} className="text-body-strong text-brand-text hover:underline max-md:text-left">
              Mark all as read
            </button>
          ) : undefined
        }
      />
      <Panel className="p-0!">
        {query.isPending ? (
          <div aria-busy="true" aria-label="Loading notifications" className="h-40" />
        ) : query.isError ? (
          <StatePanel
            kind="error"
            title="Couldn’t load notifications"
            description="Check your connection and try again."
            action={{ label: 'Try again', onClick: () => void query.refetch() }}
          />
        ) : query.data.notifications.length === 0 ? (
          <p className="px-4 py-12 text-center text-body text-secondary">You’re all caught up. New activity shows here.</p>
        ) : (
          <ul>
            {query.data.notifications.map((n) => (
              <NotificationItem key={n.id} n={n} timeZone={timeZone} onOpen={openItem} />
            ))}
          </ul>
        )}
      </Panel>
      {settingsPath[area] && (
        <Link to={settingsPath[area]} className="inline-flex items-center gap-1 self-start text-body-strong text-brand-text hover:underline">
          Notification settings
          <ChevronRightIcon size={14} />
        </Link>
      )}
    </>
  )
}
