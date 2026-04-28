import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const requiredSupabaseUrl = requireEnv(supabaseUrl, 'SUPABASE_URL')
const requiredAnonKey = requireEnv(supabaseAnonKey, 'SUPABASE_ANON_KEY')
const requiredServiceKey = requireEnv(supabaseServiceKey, 'SUPABASE_SERVICE_ROLE_KEY')

// Client for auth operations and unauthenticated requests.
export const supabase = createClient(requiredSupabaseUrl, requiredAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Admin client for server-side operations. Every route using it must re-check ownership.
export const supabaseAdmin = createClient(requiredSupabaseUrl, requiredServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export function createUserSupabaseClient(accessToken: string) {
  return createClient(requiredSupabaseUrl, requiredAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}
