import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createInitialState } from '../domain/operations'
import { sectionIds } from '../sections'
import {
  OwnerAccessError,
  decideAccess,
  ownerProof,
  requireOwnerProof,
  type AccessDecision,
} from './access'
import { readSupabasePublicConfig } from './config'
import {
  commandCenterIsOpen,
  devPreview,
  resolveGate,
} from './gate'
import { guardedDispatch } from './guard'
import { messageForAuthError, passwordChangeError } from './messages'
import {
  canUseProtectedTable,
  notesStatusMessage,
  readPracticeOwnerNotes,
  type NotesClient,
} from './notes'
import { qrImageSrc } from './qr'
import { safeRecoveryRedirect } from './redirect'
import { isTotpCode, normalizeTotpCode } from './totp'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const ownerMeta = { provider: 'email', providers: ['email'], role: 'owner' }
const plainMeta = { provider: 'email', providers: ['email'] }

function gate(
  decision: AccessDecision,
  pathname = '/',
  hash = '#orders',
) {
  return resolveGate({
    loading: false,
    configured: true,
    pathname,
    hash,
    decision,
  })
}

function token(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.sig`
}

describe('owner authentication', () => {
  it('rejects an incorrect password and keeps every section closed', () => {
    expect(messageForAuthError('Invalid login credentials')).toBe(
      'That email or password is not correct.',
    )

    const decision = decideAccess({
      hasSession: false,
      appMetadata: ownerMeta,
      currentLevel: null,
      nextLevel: null,
    })

    for (const id of sectionIds) {
      const result = gate(decision, `/${id}`, `#${id}`)
      expect(result.screen).toBe('login')
      expect(result.section).toBeNull()
      expect(commandCenterIsOpen(result.screen)).toBe(false)
    }

    expect(() => requireOwnerProof(null)).toThrow(OwnerAccessError)
  })

  it('rejects unauthenticated access, including direct section addresses', () => {
    const decision = decideAccess({
      hasSession: false,
      appMetadata: null,
      currentLevel: null,
      nextLevel: null,
    })

    expect(decision.kind).toBe('unauthenticated')
    expect(gate(decision, '/customers', '#customers').screen).toBe('login')
    expect(gate(decision, '/login', '').screen).toBe('login')
    expect(gate(decision, '/auth/update-password', '#dashboard').screen).toBe(
      'update-password',
    )
    expect(commandCenterIsOpen(gate(decision).screen)).toBe(false)
  })

  it('rejects a signed-in account that is not the owner', () => {
    const decision = decideAccess({
      hasSession: true,
      appMetadata: plainMeta,
      userMetadata: { role: 'owner' },
      currentLevel: 'aal2',
      nextLevel: 'aal2',
    })

    expect(decision.kind).toBe('forbidden')
    expect(gate(decision, '/', '#money')).toEqual({
      screen: 'forbidden',
      section: null,
    })
    expect(
      ownerProof({
        userId: 'user-1',
        appMetadata: plainMeta,
        currentLevel: 'aal2',
      }),
    ).toBeNull()
  })

  it('ignores an owner role stored in editable user metadata', () => {
    const decision = decideAccess({
      hasSession: true,
      appMetadata: { provider: 'email' },
      userMetadata: { role: 'owner' },
      currentLevel: 'aal2',
      nextLevel: 'aal2',
    })

    expect(decision.kind).toBe('forbidden')
    expect(
      canUseProtectedTable({
        role: 'authenticated',
        aal: 'aal2',
        app_metadata: { provider: 'email' },
        user_metadata: { role: 'owner' },
      }),
    ).toBe(false)
  })

  it('keeps the owner out until authenticator verification finishes', () => {
    const enroll = decideAccess({
      hasSession: true,
      appMetadata: ownerMeta,
      currentLevel: 'aal1',
      nextLevel: 'aal1',
    })
    const challenge = decideAccess({
      hasSession: true,
      appMetadata: ownerMeta,
      currentLevel: 'aal1',
      nextLevel: 'aal2',
    })

    expect(enroll.kind).toBe('mfa-enroll')
    expect(challenge.kind).toBe('mfa-challenge')

    for (const id of sectionIds) {
      expect(gate(enroll, '/', `#${id}`).screen).toBe('mfa-enroll')
      expect(gate(challenge, `/${id}`, `#${id}`).section).toBeNull()
      expect(commandCenterIsOpen(gate(challenge, '/', `#${id}`).screen)).toBe(false)
    }

    expect(
      ownerProof({
        userId: 'user-1',
        appMetadata: ownerMeta,
        currentLevel: 'aal1',
      }),
    ).toBeNull()
  })

  it('allows the owner only after authenticator verification', () => {
    const decision = decideAccess({
      hasSession: true,
      appMetadata: ownerMeta,
      userMetadata: { role: 'stranger' },
      currentLevel: 'aal2',
      nextLevel: 'aal2',
    })

    expect(decision.kind).toBe('allowed')
    expect(gate(decision, '/', '#orders')).toEqual({
      screen: 'command-center',
      section: 'orders',
    })
    expect(
      ownerProof({
        userId: 'user-1',
        appMetadata: ownerMeta,
        currentLevel: 'aal2',
      }),
    ).toEqual({ role: 'owner', assurance: 'aal2', userId: 'user-1' })
  })

  it('clears access on sign-out, even if the old assurance was still in memory', () => {
    const before = decideAccess({
      hasSession: true,
      appMetadata: ownerMeta,
      currentLevel: 'aal2',
      nextLevel: 'aal2',
    })
    const after = decideAccess({
      hasSession: false,
      appMetadata: ownerMeta,
      currentLevel: 'aal2',
      nextLevel: 'aal2',
    })

    expect(before.kind).toBe('allowed')
    expect(after.kind).toBe('unauthenticated')
    expect(gate(after, '/', '#settings').screen).toBe('login')
    expect(
      ownerProof({
        userId: null,
        appMetadata: ownerMeta,
        currentLevel: 'aal2',
      }),
    ).toBeNull()
  })

  it('does not let a password reset skip the authenticator', () => {
    const decision = decideAccess({
      hasSession: true,
      appMetadata: ownerMeta,
      currentLevel: 'aal1',
      nextLevel: 'aal2',
    })

    expect(passwordChangeError('short', 'short')).toMatch(/8 characters/)
    expect(passwordChangeError('long-enough', 'different')).toMatch(/do not match/)
    expect(passwordChangeError('long-enough', 'long-enough')).toBeNull()
    expect(gate(decision, '/auth/update-password', '#dashboard').screen).toBe(
      'update-password',
    )
    expect(gate(decision, '/', '#dashboard').screen).toBe('mfa-challenge')
    expect(messageForAuthError('Invalid TOTP code entered')).toMatch(/not correct/)
  })

  it('refuses protected practice operations without owner assurance', () => {
    const seen: string[] = []
    expect(() =>
      guardedDispatch(
        null,
        (action) => seen.push(action.type),
        { type: 'toggle-hours', day: 'Monday' },
      ),
    ).toThrow(OwnerAccessError)
    expect(seen).toEqual([])

    const proof = requireOwnerProof(
      ownerProof({
        userId: 'user-1',
        appMetadata: ownerMeta,
        currentLevel: 'aal2',
      }),
    )
    guardedDispatch(
      proof,
      (action) => seen.push(action.type),
      { type: 'clear-draft' },
    )
    expect(seen).toEqual(['clear-draft'])
    expect(createInitialState('2026-11-01').orders.length).toBeGreaterThan(0)
  })

  it('keeps the published customer site out of recovery and project configuration', () => {
    expect(safeRecoveryRedirect('http://localhost:5173')).toBe(
      'http://localhost:5173/auth/update-password',
    )
    expect(() => safeRecoveryRedirect('https://kimmysdelivery.com')).toThrow(/live customer website/)
    expect(() => safeRecoveryRedirect('https://www.kimmysdelivery.com')).toThrow(/live customer website/)
    expect(() => safeRecoveryRedirect('https://shop.kimmysdelivery.com')).toThrow(/live customer website/)

    expect(
      readSupabasePublicConfig({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_local_preview_only',
      }).ok,
    ).toBe(true)
    expect(
      readSupabasePublicConfig({
        VITE_SUPABASE_URL: 'https://kimmysdelivery.com',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_local_preview_only',
      }),
    ).toEqual({ ok: false, problem: 'live-site' })
    expect(
      readSupabasePublicConfig({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_example',
      }),
    ).toEqual({ ok: false, problem: 'secret-key' })
    expect(
      readSupabasePublicConfig({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: token({ role: 'service_role' }),
      }),
    ).toEqual({ ok: false, problem: 'secret-key' })
    expect(
      readSupabasePublicConfig({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: token({ role: 'anon' }),
      }).ok,
    ).toBe(true)
    expect(readSupabasePublicConfig({}).ok).toBe(false)
  })

  it('does not open a dev preview of the authenticator in production', () => {
    expect(devPreview(false, '?preview=mfa-enroll')).toBeNull()
    expect(devPreview(false, '?preview=mfa-challenge')).toBeNull()
    expect(devPreview(true, '?preview=mfa-enroll')).toBe('mfa-enroll')
    expect(devPreview(true, '?next=/orders')).toBeNull()
  })

  it('keeps setup in front of the command center when configuration is missing', () => {
    const result = resolveGate({
      loading: false,
      configured: false,
      pathname: '/',
      hash: '#dashboard',
      decision: { kind: 'allowed' },
    })
    expect(result).toEqual({ screen: 'setup', section: null })
  })

  it('still includes every command center section', () => {
    expect([...sectionIds]).toEqual([
      'dashboard',
      'orders',
      'customers',
      'quotes',
      'deliveries',
      'money',
      'partners',
      'marketing',
      'reports',
      'settings',
    ])
  })
})

describe('protected practice table', () => {
  const sql = readFileSync(
    join(root, 'supabase/migrations/20261101120000_practice_owner_lock.sql'),
    'utf8',
  )
  const normalized = sql.toLowerCase()

  it('denies access unless the session is an authenticated owner at aal2', () => {
    expect(canUseProtectedTable(null)).toBe(false)
    expect(canUseProtectedTable({ role: 'anon', aal: 'aal2', app_metadata: ownerMeta })).toBe(false)
    expect(
      canUseProtectedTable({
        role: 'authenticated',
        aal: 'aal1',
        app_metadata: ownerMeta,
      }),
    ).toBe(false)
    expect(
      canUseProtectedTable({
        role: 'authenticated',
        aal: 'aal2',
        app_metadata: plainMeta,
        user_metadata: { role: 'owner' },
      }),
    ).toBe(false)
    expect(
      canUseProtectedTable({
        role: 'service_role',
        aal: 'aal2',
        app_metadata: ownerMeta,
      }),
    ).toBe(false)
    expect(
      canUseProtectedTable({
        role: 'authenticated',
        aal: 'aal2',
        app_metadata: ownerMeta,
        user_metadata: { role: 'nope' },
      }),
    ).toBe(true)
    expect(canUseProtectedTable({
      role: 'authenticated',
      aal: 'aal2',
      app_metadata: { role: 'owner ' },
    })).toBe(false)
  })

  it('does not query the table when owner assurance is missing', async () => {
    let calls = 0
    const client = {
      from() {
        calls += 1
        throw new Error('query should not run')
      },
    } as unknown as NotesClient

    const result = await readPracticeOwnerNotes(client, null)
    expect(result.status).toBe('refused')
    expect(calls).toBe(0)
    expect(notesStatusMessage(result)).toMatch(/refused/)
  })

  it('counts only fictional rows after the database allows the read', async () => {
    const client: NotesClient = {
      from(table) {
        expect(table).toBe('practice_owner_notes')
        return {
          select() {
            return {
              limit: async () => ({
                data: [
                  { body: 'FICTIONAL: practice lock check' },
                  { body: 'real customer note' },
                ],
                error: null,
              }),
            }
          },
        }
      },
    }

    const result = await readPracticeOwnerNotes(client, {
      role: 'owner',
      assurance: 'aal2',
      userId: 'user-1',
    })
    expect(result).toEqual({ status: 'ok', fictionalCount: 1, unlabeled: 1 })
    expect(notesStatusMessage(result)).toMatch(/not shown/)
  })

  it('reports a database denial and a missing table without opening data', async () => {
    const denied: NotesClient = {
      from: () => ({
        select: () => ({
          limit: async () => ({
            data: null,
            error: { message: 'permission denied for table practice_owner_notes', code: '42501' },
          }),
        }),
      }),
    }
    const missing: NotesClient = {
      from: () => ({
        select: () => ({
          limit: async () => ({
            data: null,
            error: { message: 'relation does not exist', code: '42P01' },
          }),
        }),
      }),
    }

    expect((await readPracticeOwnerNotes(denied, {
      role: 'owner',
      assurance: 'aal2',
      userId: 'user-1',
    })).status).toBe('denied')
    expect((await readPracticeOwnerNotes(missing, {
      role: 'owner',
      assurance: 'aal2',
      userId: 'user-1',
    })).status).toBe('not-installed')
  })

  it('locks the practice table to verified owners and ignores user metadata', () => {
    expect(normalized).toContain('enable row level security')
    expect(normalized).toContain('force row level security')
    expect(normalized).toContain('revoke all on table public.practice_owner_notes from anon')
    expect(normalized).toContain('revoke all on table public.practice_owner_notes from public')
    expect(normalized).toContain("auth.jwt() -> 'app_metadata' ->> 'role'")
    expect(normalized).toContain("= 'owner'")
    expect(normalized).toContain("auth.jwt() ->> 'aal'")
    expect(normalized).toContain("= 'aal2'")
    expect(normalized).toContain("= 'authenticated'")
    expect(normalized).toContain("like 'fictional:%'")
    expect(normalized).not.toContain('user_metadata')
    expect(normalized).not.toMatch(/grant\s+[^;]*\sto\s+anon\b/)
    expect(sql).not.toMatch(/sb_secret_|service_role/)
  })
})

describe('authenticator codes', () => {
  it('accepts a 6-digit code and builds a safe image source', () => {
    expect(isTotpCode('123 456')).toBe(true)
    expect(normalizeTotpCode('123 456')).toBe('123456')
    expect(isTotpCode('12345')).toBe(false)
    expect(isTotpCode('abcdef')).toBe(false)
    expect(qrImageSrc('<svg></svg>')).toContain('data:image/svg+xml')
    expect(qrImageSrc('data:image/svg+xml;utf-8,abc')).toBe('data:image/svg+xml;utf-8,abc')
  })
})
