import { createClient } from '@supabase/supabase-js'
import { env } from './env'

/**
 * Browser Supabase client: used for sign-in, sign-out, password reset and file uploads.
 * Product data is read and written through the Synqop API, not directly from the browser.
 */
/**
 * The URL the app was opened with, captured before Supabase reads (and clears) the auth details
 * in the hash. The reset-password page uses it to tell a real recovery link from a direct visit,
 * and to spot "link expired" errors.
 */
export const initialUrl = new URL(window.location.href)

/**
 * Whether the browser held a session when the app opened, read before Supabase can drop an expired one.
 * If it then turns out to have no session, the session ended rather than never existing (X1.03).
 */
export const hadStoredSession = (() => {
  try {
    return Object.keys(localStorage).some((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
  } catch {
    return false
  }
})()

export const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
