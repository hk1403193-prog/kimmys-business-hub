import { useEffect, useState } from 'react'
import { AuthLayout } from './AuthLayout'
import { useAuth } from './AuthProvider'
import { TotpForm } from './TotpForm'

export function MfaChallengeScreen({ demo = false }: { demo?: boolean }) {
  const { beginChallenge, verifyTotp, signOut } = useAuth()
  const [factorId, setFactorId] = useState<string | null>(demo ? 'dev-preview' : null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(!demo)

  useEffect(() => {
    if (demo) return
    let active = true
    setPending(true)
    void beginChallenge().then((result) => {
      if (!active) return
      setPending(false)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setFactorId(result.factorId)
    })
    return () => {
      active = false
    }
  }, [beginChallenge, demo])

  async function onSubmit(code: string) {
    if (!factorId) {
      setError(error ?? 'The authenticator is not ready yet.')
      return
    }
    setPending(true)
    setError(null)
    const message = await verifyTotp(factorId, code)
    setPending(false)
    if (message) setError(message)
  }

  return (
    <AuthLayout title="Authenticator code" eyebrow="Authenticator">
      <p>
        Enter the current 6-digit code from your authenticator. Password reset
        does not skip this step.
      </p>
      {demo ? (
        <p className="notice">
          Layout preview. After you sign in, this code is checked with the
          practice project.
        </p>
      ) : null}
      {factorId ? (
        <TotpForm pending={pending} error={error} onSubmit={onSubmit} />
      ) : (
        <p>{pending ? 'Checking the authenticator…' : error}</p>
      )}
      <details className="fold">
        <summary>I replaced my phone</summary>
        <div className="fold-body">
          <p>
            This app cannot turn off the authenticator. An administrator removes
            the old factor in the Supabase dashboard, then you enroll the new
            phone. Password reset does not skip this step.
          </p>
        </div>
      </details>
      <button className="btn btn-secondary" type="button" onClick={() => void signOut()}>
        Sign out
      </button>
    </AuthLayout>
  )
}
