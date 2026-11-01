import { isLiveCustomerHost } from './liveSite'

export type PublicConfig =
  | { ok: true; url: string; publishableKey: string }
  | { ok: false; problem: 'missing' | 'invalid-url' | 'live-site' | 'secret-key' }

export function jwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) return null

  try {
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const base64 = padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), '=')
    const json = atob(base64)
    const parsed = JSON.parse(json) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

function classifyKey(key: string): 'publishable' | 'secret' | 'rejected' {
  if (key.startsWith('sb_secret_') || key.includes('service_role')) return 'secret'

  if (/^sb_publishable_[A-Za-z0-9_-]{8,}$/.test(key)) return 'publishable'

  const role = jwtPayload(key)?.role
  if (role === 'service_role') return 'secret'
  if (role === 'anon') return 'publishable'
  return 'rejected'
}

export function readSupabasePublicConfig(env: {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_PUBLISHABLE_KEY?: string
}): PublicConfig {
  const urlValue = env.VITE_SUPABASE_URL?.trim() ?? ''
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

  if (!urlValue || !key) return { ok: false, problem: 'missing' }

  let parsed: URL
  try {
    parsed = new URL(urlValue)
  } catch {
    return { ok: false, problem: 'invalid-url' }
  }

  if (isLiveCustomerHost(parsed.hostname)) {
    return { ok: false, problem: 'live-site' }
  }

  if (parsed.username || parsed.password) {
    return { ok: false, problem: 'secret-key' }
  }

  if (parsed.protocol !== 'https:') return { ok: false, problem: 'invalid-url' }
  if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
    return { ok: false, problem: 'invalid-url' }
  }

  if (!/^[a-z0-9-]+\.supabase\.co$/i.test(parsed.hostname)) {
    return { ok: false, problem: 'invalid-url' }
  }

  const keyKind = classifyKey(key)
  if (keyKind === 'secret') return { ok: false, problem: 'secret-key' }
  if (keyKind !== 'publishable') return { ok: false, problem: 'invalid-url' }

  return { ok: true, url: parsed.origin, publishableKey: key }
}
