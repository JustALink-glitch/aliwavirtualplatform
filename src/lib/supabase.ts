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

export const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
