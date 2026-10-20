import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { homePath } from '@/lib/roles'
import { supabase } from '@/lib/supabase'

/** Minimal sign-in so the shell can be exercised. The designed screen replaces this. */
export function SignInPage() {
  const { state } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (state.status === 'signed-in') {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? homePath(state.me.membership.role)} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setSubmitting(false)
    if (signInError) setError('Email or password is incorrect.')
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border border-default bg-surface p-6 shadow-raised">
        <h1 className="text-heading-group text-primary">Sign in to Synqop</h1>
        <label className="mt-5 block text-caption-strong text-secondary" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 h-control w-full rounded-md border border-strong bg-surface px-3 text-body-large text-primary"
        />
        <label className="mt-4 block text-caption-strong text-secondary" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 h-control w-full rounded-md border border-strong bg-surface px-3 text-body-large text-primary"
        />
        {error && (
          <p role="alert" className="mt-3 text-caption text-error-fg">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-5 h-control w-full rounded-md bg-brand text-label-button text-on-brand hover:bg-brand-hover disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
