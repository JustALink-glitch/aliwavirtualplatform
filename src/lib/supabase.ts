import { createClient } from '@supabase/supabase-js'
import { env } from './env'

/**
 * Browser Supabase client: used for sign-in, sign-out, password reset and file uploads.
 * Product data is read and written through the Synqop API, not directly from the browser.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
