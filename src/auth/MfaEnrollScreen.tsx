import { useEffect, useState } from 'react'
import { AuthLayout } from './AuthLayout'
import { useAuth, type EnrollmentStart } from './AuthProvider'
import { TotpForm } from './TotpForm'
import { compactSecret, groupSecret } from './totp'

export function MfaEnrollScreen({ demo }: { demo?: EnrollmentStart }) {
  const { beginEnrollment, verifyTotp, signOut } = useAuth()
  const [enrollment, setEnrollment] = useState<Extract<EnrollmentStart, { ok: true }> | null>(
    demo?.ok ? demo : null,
  )
  const [existingFactorId, setExistingFactorId] = useState<string | null>(
    demo && !demo.ok ? demo.existingFactorId ?? null : null,
  )
  const [error, setError] = useState<string | null>(demo && !demo.ok ? demo.message : null)
  const [pending, setPending] = useState(!demo)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (demo) return
    let active = true
    setPending(true)
    void beginEnrollment().then((result) => {
      if (!active) return
      setPending(false)
      if (!result.ok) {
        setError(result.message)
        setExistingFactorId(result.existingFactorId ?? null)
        return
      }
      setEnrollment(result)
    })
    return () => {
      active = false
    }
  }, [beginEnrollment, demo])

  async function onSubmit(code: string) {
    const factorId = enrollment?.factorId ?? existingFactorId
    if (!factorId) {
      setError('The authenticator setup is not ready yet.')
      return
    }
    setPending(true)
    setError(null)
    const message = await verifyTotp(factorId, code)
    setPending(false)
    if (message) setError(message)
  }

  async function copySecret() {
    if (!enrollment) return
    try {
      await navigator.clipboard.writeText(compactSecret(enrollment.secret))
      setCopied(true)
    } catch {
      setCopied(false)
      setError('Select the setup key and copy it.')
    }
  }

  return (
    <AuthLayout title="Set up your authenticator" eyebrow="Authenticator">
      <p>
        Install an authenticator app on your phone. Scan this code, or enter
        the setup key. Then enter the 6-digit code from the app. The command
        center stays closed until that code is accepted.
      </p>
      {demo ? (
        <p className="notice">
          Layout preview. After you sign in, the practice project supplies the
          real QR code and setup key.
        </p>
      ) : null}
      {enrollment ? (
        <>
          <div className="qr-frame">
            <img src={enrollment.qrSrc} alt="QR code for your authenticator app" />
          </div>
          <p>Setup key</p>
          <p className="secret-box">{groupSecret(enrollment.secret)}</p>
          <button className="btn btn-secondary" type="button" onClick={() => void copySecret()}>
            {copied ? 'Setup key copied' : 'Copy setup key'}
          </button>
        </>
      ) : (
        <p>{pending ? 'Preparing the authenticator code…' : error}</p>
      )}
      {enrollment || existingFactorId ? (
        <TotpForm pending={pending} error={enrollment ? error : null} onSubmit={onSubmit} />
      ) : null}
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
