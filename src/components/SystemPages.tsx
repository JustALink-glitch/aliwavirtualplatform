import { onlineManager, useQueryClient } from '@tanstack/react-query'
import { RotateCw, Search, TriangleAlert } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, isRouteErrorResponse, useLocation, useNavigate, useRouteError } from 'react-router'
import { navigation } from '@/app/navigation'
import { useAuth } from '@/auth/useAuth'
import { OnboardingHeader, OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Button } from '@/components/ui/Button'
import { ApiError, errorReference } from '@/lib/api'
import { formatTime } from '@/lib/format'
import { areaForRole, homePath, type Area } from '@/lib/roles'

const homeLabel = (area: Area) => `Go to ${navigation[area].find((item) => item.path === '')?.label ?? 'home'}`

const secondaryLink =
  'inline-flex h-9 items-center rounded-md border border-strong bg-surface px-4 text-label-button text-primary hover:bg-surface-hover focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none'
const primaryLink =
  'inline-flex h-9 items-center rounded-md bg-brand px-4 text-label-button text-on-brand hover:bg-brand-hover focus-visible:shadow-[var(--shadow-focus)] focus-visible:outline-none'

function Centered({
  icon,
  eyebrow,
  title,
  body,
  children,
  alert,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  body: string
  children: ReactNode
  alert?: boolean
}) {
  return (
    <div role={alert ? 'alert' : undefined} className="mx-auto flex max-w-[480px] flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center">
      {icon}
      <p className="text-caption text-secondary">{eyebrow}</p>
      <h1 className="text-page-title text-primary">{title}</h1>
      <p className="text-body text-secondary">{body}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">{children}</div>
    </div>
  )
}

/** X1.01 Page not found, inside the app shell. */
export function NotFoundPage({ area }: { area: Area }) {
  const navigate = useNavigate()
  return (
    <Centered
      icon={<Search aria-hidden className="mb-2 size-6 text-icon-muted" />}
      eyebrow="Error 404"
      title="We can’t find that page"
      body="The link may be old, or the page was moved or deleted. If someone sent it to you, ask them for a fresh link."
    >
      <Link to={`/${area}`} className={primaryLink}>
        {homeLabel(area)}
      </Link>
      <Button variant="secondary" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(`/${area}`))}>
        Go back
      </Button>
    </Centered>
  )
}

/** Addresses outside every area: signed-in people get the 404 in their own shell; others a plain page. */
export function RootNotFound() {
  const { state } = useAuth()
  if (state.status === 'loading') return <div aria-busy="true" aria-label="Loading" className="min-h-dvh bg-canvas" />
  if (state.status === 'signed-in') return <Navigate to={`${homePath(state.me.membership.role)}/not-found`} replace />
  return (
    <OnboardingLayout panelTitle="Synqop" panelBody="Programme operations for teams that run cohorts.">
      <OnboardingHeader
        title="We can’t find that page"
        description="The link may be old, or the page was moved or deleted. If someone sent it to you, ask them for a fresh link."
      />
      <Link to="/sign-in" className={primaryLink + ' justify-center'}>
        Go to sign in
      </Link>
    </OnboardingLayout>
  )
}

/** X1.02 Something went wrong — the router's error boundary inside the shell, so navigation still works. */
export function ServerErrorPage({ area }: { area: Area }) {
  const error = useRouteError()
  const [fallbackRef] = useState(() => errorReference(crypto.randomUUID()))
  const reference = error instanceof ApiError && error.requestId ? errorReference(error.requestId) : fallbackRef
  const notFound = isRouteErrorResponse(error) && error.status === 404
  useEffect(() => {
    if (!notFound) console.error(`[${reference}]`, error)
  }, [error, reference, notFound])
  if (notFound) return <NotFoundPage area={area} />
  return (
    <Centered
      alert
      icon={
        <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-error-bg">
          <TriangleAlert aria-hidden className="size-5 text-error-fg" />
        </span>
      }
      eyebrow={`Error 500 · Reference ${reference}`}
      title="Something went wrong on our side"
      body="We couldn’t load this page. Anything you’d already saved is safe. Try again — if it keeps happening, contact your organisation’s admin and quote the reference above."
    >
      <Button onClick={() => window.location.reload()}>
        <RotateCw aria-hidden className="size-4" />
        Try again
      </Button>
      <Link to={`/${area}`} className={secondaryLink}>
        {homeLabel(area)}
      </Link>
    </Centered>
  )
}

/** /signed-out — X1.03 Session ended. Sign in again and come back to the same page. */
export function SignedOutPage() {
  const { state } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  if (state.status === 'signed-in') {
    const home = homePath(state.me.membership.role)
    const sameArea = from?.startsWith(`/${areaForRole(state.me.membership.role)}`)
    return <Navigate to={sameArea ? from! : home} replace />
  }
  return (
    <OnboardingLayout
      panelTitle="Your saved work is safe"
      panelBody="Anything you saved before the session ended is still there."
      footer="The same for admins, trainers and participants."
    >
      <OnboardingHeader
        compact
        title="You’ve been signed out"
        description="Your session ended, so we signed you out to keep your account safe. Sign in again and we’ll take you back to the page you were on."
      />
      <Link to="/sign-in" state={from ? { from } : null} className={primaryLink + ' h-11 justify-center'}>
        Sign in again
      </Link>
    </OnboardingLayout>
  )
}

/** X1.04 Offline: a warning above the page. Queries pause and pick up again on reconnect. */
export function OfflineBanner({ timeZone }: { timeZone?: string }) {
  const client = useQueryClient()
  // When the newest data on screen arrived; null while online.
  const newest = () =>
    Math.max(
      0,
      ...client
        .getQueryCache()
        .getAll()
        .map((q) => q.state.dataUpdatedAt),
    ) || Date.now()
  const [loadedAt, setLoadedAt] = useState<number | null>(() => (onlineManager.isOnline() ? null : newest()))
  useEffect(
    () =>
      onlineManager.subscribe((online) =>
        setLoadedAt(
          online
            ? null
            : Math.max(
                0,
                ...client
                  .getQueryCache()
                  .getAll()
                  .map((q) => q.state.dataUpdatedAt),
              ) || Date.now(),
        ),
      ),
    [client],
  )
  if (loadedAt === null) return null
  return (
    <AlertBanner tone="warning" title="You’re offline">
      Showing what was loaded at {formatTime(new Date(loadedAt), timeZone)}. You can read, but changes can’t be saved until you reconnect. We’ll keep trying.
    </AlertBanner>
  )
}
