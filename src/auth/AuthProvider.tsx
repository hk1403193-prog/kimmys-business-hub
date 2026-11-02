import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { decideAccess, ownerProof, type AccessDecision, type OwnerProof } from './access'
import { browserSupabase, publicConfigFromEnv } from './client'
import { messageForAuthError, passwordChangeError } from './messages'
import { readPracticeOwnerNotes, type NotesClient, type NotesRead } from './notes'
import { qrImageSrc } from './qr'
import { safeRecoveryRedirect } from './redirect'
import { isTotpCode, normalizeTotpCode } from './totp'

export type EnrollmentStart =
  | { ok: true; factorId: string; secret: string; qrSrc: string }
  | { ok: false; message: string; existingFactorId?: string }

type ChallengeStart = { ok: true; factorId: string } | { ok: false; message: string }

type AuthContextValue = {
  configured: boolean
  configProblem: string | null
  loading: boolean
  email: string | null
  hasSession: boolean
  banner: string | null
  decision: AccessDecision
  proof: OwnerProof | null
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  sendRecovery: (email: string) => Promise<string | null>
  updatePassword: (password: string, confirm: string) => Promise<string | null>
  beginEnrollment: () => Promise<EnrollmentStart>
  beginChallenge: () => Promise<ChallengeStart>
  verifyTotp: (factorId: string, code: string) => Promise<string | null>
  readPracticeNotes: () => Promise<NotesRead>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const config = useMemo(() => publicConfigFromEnv(import.meta.env), [])
  const supabase = useMemo(() => browserSupabase(config), [config])
  const generation = useRef(0)
  const confirmedToken = useRef<string | null>(null)
  const [loading, setLoading] = useState(config.ok)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [currentLevel, setCurrentLevel] = useState<string | null>(null)
  const [nextLevel, setNextLevel] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    let active = true

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error || !data.session) {
        setSession(null)
        setLoading(false)
        return
      }
      setSession(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return
      setSession(next)
      if (!next) {
        setUser(null)
        setCurrentLevel(null)
        setNextLevel(null)
        setLoading(false)
      }
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (!supabase || !session) return
    const token = session.access_token
    if (confirmedToken.current === token) return
    const ticket = generation.current
    let active = true
    if (confirmedToken.current === null) setLoading(true)

    void Promise.all([
      supabase.auth.getUser(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ])
      .then(([userResult, aalResult]) => {
        if (!active || generation.current !== ticket) return
        if (userResult.error || !userResult.data.user || aalResult.error) {
          confirmedToken.current = null
          setUser(null)
          setCurrentLevel(null)
          setNextLevel(null)
          setBanner('The sign-in could not be confirmed. Sign in again.')
          setLoading(false)
          return
        }
        confirmedToken.current = token
        setUser(userResult.data.user)
        setCurrentLevel(aalResult.data?.currentLevel ?? null)
        setNextLevel(aalResult.data?.nextLevel ?? null)
        setBanner(null)
        setLoading(false)
      })
      .catch(() => {
        if (!active || generation.current !== ticket) return
        confirmedToken.current = null
        setUser(null)
        setCurrentLevel(null)
        setNextLevel(null)
        setBanner('The sign-in service could not be reached. Check the connection and try again.')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [supabase, session])

  const decision = useMemo(
    () =>
      decideAccess({
        hasSession: Boolean(user),
        appMetadata: user?.app_metadata,
        userMetadata: user?.user_metadata,
        currentLevel,
        nextLevel,
      }),
    [user, currentLevel, nextLevel],
  )

  const proof = useMemo(
    () =>
      ownerProof({
        userId: user?.id ?? null,
        appMetadata: user?.app_metadata,
        currentLevel,
      }),
    [user, currentLevel],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return 'Add the public Supabase values before signing in.'
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) return messageForAuthError(error.message)
      return null
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    generation.current += 1
    confirmedToken.current = null
    setSession(null)
    setUser(null)
    setCurrentLevel(null)
    setNextLevel(null)
    setBanner(null)
    setLoading(false)
    if (!supabase) return
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (error) {
      await supabase.auth.signOut({ scope: 'local' })
    }
  }, [supabase])

  const sendRecovery = useCallback(
    async (email: string) => {
      if (!supabase) return 'Add the public Supabase values before resetting a password.'
      let redirectTo = ''
      try {
        redirectTo = safeRecoveryRedirect(window.location.origin)
      } catch (error) {
        return error instanceof Error ? error.message : 'That recovery address was refused.'
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
      if (!error) return null
      const lower = error.message.toLowerCase()
      if (
        lower.includes('rate') ||
        lower.includes('too many') ||
        lower.includes('fetch') ||
        lower.includes('network')
      ) {
        return messageForAuthError(error.message)
      }
      return null
    },
    [supabase],
  )

  const updatePassword = useCallback(
    async (password: string, confirm: string) => {
      const local = passwordChangeError(password, confirm)
      if (local) return local
      if (!supabase) return 'Add the public Supabase values before changing a password.'
      const { data } = await supabase.auth.getSession()
      if (!data.session) return 'This reset link is missing or expired. Request a new one.'
      const { error } = await supabase.auth.updateUser({ password })
      if (error) return messageForAuthError(error.message)
      return null
    },
    [supabase],
  )

  const beginEnrollment = useCallback(async (): Promise<EnrollmentStart> => {
    if (!supabase) {
      return { ok: false, message: 'Add the public Supabase values before enrolling.' }
    }
    const listed = await supabase.auth.mfa.listFactors()
    if (listed.error || !listed.data) {
      return { ok: false, message: messageForAuthError(listed.error?.message ?? '') }
    }
    const verified = listed.data.totp[0]
    if (verified) {
      return {
        ok: false,
        message: 'This account already has an authenticator. Enter its current code.',
        existingFactorId: verified.id,
      }
    }
    for (const factor of listed.data.all) {
      if (factor.factor_type === 'totp' && factor.status !== 'verified') {
        const removed = await supabase.auth.mfa.unenroll({ factorId: factor.id })
        if (removed.error) {
          return { ok: false, message: messageForAuthError(removed.error.message) }
        }
      }
    }
    const enrolled = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Owner authenticator',
      issuer: "Kimmy's Business Hub",
    })
    if (enrolled.error || !enrolled.data?.totp) {
      return { ok: false, message: messageForAuthError(enrolled.error?.message ?? '') }
    }
    return {
      ok: true,
      factorId: enrolled.data.id,
      secret: enrolled.data.totp.secret,
      qrSrc: qrImageSrc(enrolled.data.totp.qr_code),
    }
  }, [supabase])

  const beginChallenge = useCallback(async (): Promise<ChallengeStart> => {
    if (!supabase) return { ok: false, message: 'Add the public Supabase values before signing in.' }
    const listed = await supabase.auth.mfa.listFactors()
    if (listed.error || !listed.data) {
      return { ok: false, message: messageForAuthError(listed.error?.message ?? '') }
    }
    const factor = listed.data.totp[0]
    if (!factor) {
      return {
        ok: false,
        message: 'No authenticator is enrolled yet. Sign out and sign in again to start enrollment.',
      }
    }
    return { ok: true, factorId: factor.id }
  }, [supabase])

  const verifyTotp = useCallback(
    async (factorId: string, code: string) => {
      if (!supabase) return 'Sign-in is not configured.'
      if (factorId === 'dev-preview') {
        return 'That authenticator code is not correct. Enter the current 6-digit code.'
      }
      const normalized = normalizeTotpCode(code)
      if (!isTotpCode(normalized)) return 'Enter the 6-digit code from your authenticator.'
      const verified = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: normalized,
      })
      if (verified.error) return messageForAuthError(verified.error.message)
      const [userResult, aalResult, sessionResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.getSession(),
      ])
      if (userResult.error || !userResult.data.user) {
        return 'The authenticator was accepted, but the sign-in could not be confirmed. Sign in again.'
      }
      setSession(sessionResult.data.session)
      setUser(userResult.data.user)
      setCurrentLevel(aalResult.data?.currentLevel ?? null)
      setNextLevel(aalResult.data?.nextLevel ?? null)
      if (aalResult.data?.currentLevel !== 'aal2') {
        return 'The code was sent, but the sign-in is not verified yet. Enter the current code again.'
      }
      return null
    },
    [supabase],
  )

  const readPracticeNotes = useCallback(async () => {
    if (!supabase) return { status: 'unavailable' } as const
    return readPracticeOwnerNotes(supabase as unknown as NotesClient, proof)
  }, [supabase, proof])

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: config.ok,
      configProblem: config.ok ? null : config.problem,
      loading: config.ok && loading,
      email: user?.email ?? null,
      hasSession: Boolean(user),
      banner,
      decision,
      proof,
      signIn,
      signOut,
      sendRecovery,
      updatePassword,
      beginEnrollment,
      beginChallenge,
      verifyTotp,
      readPracticeNotes,
    }),
    [
      config,
      loading,
      user,
      banner,
      decision,
      proof,
      signIn,
      signOut,
      sendRecovery,
      updatePassword,
      beginEnrollment,
      beginChallenge,
      verifyTotp,
      readPracticeNotes,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('Sign-in is only available inside the auth provider.')
  }
  return value
}
