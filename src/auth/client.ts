import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readSupabasePublicConfig, type PublicConfig } from './config'

let browserClient: SupabaseClient | null = null
let browserUrl: string | null = null

export function browserSupabase(config: PublicConfig): SupabaseClient | null {
  if (!config.ok) return null

  if (!browserClient || browserUrl !== config.url) {
    browserClient = createClient(config.url, config.publishableKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'kimmys-hub-auth',
      },
    })
    browserUrl = config.url
  }

  return browserClient
}

export function publicConfigFromEnv(env: ImportMetaEnv): PublicConfig {
  return readSupabasePublicConfig({
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: env.VITE_SUPABASE_PUBLISHABLE_KEY,
  })
}
