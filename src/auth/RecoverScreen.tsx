import { useState, type FormEvent } from 'react'
import { AuthError, AuthLayout } from './AuthLayout'
import { useAuth } from './AuthProvider'

export function RecoverScreen() {
  const { sendRecovery } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const message = await sendRecovery(email)
    setPending(false)
    if (message) {
      setError(message)
      return
    }
    setSent(true)
  }

  return (
    <AuthLayout title="Reset password" eyebrow="Owner sign-in">
      {sent ? (
        <>
          <p role="status">
            If an owner account exists for that email, a reset link is on its
            way. The link opens only the password page for this practice
            preview. It does not turn off the authenticator, and it does not
            open the live website.
          </p>
          <a className="btn btn-primary" href="/login">
            Back to sign in
          </a>
        </>
      ) : (
        <form className="auth-form" onSubmit={(event) => void onSubmit(event)}>
          <p>
            Enter the owner email. Password reset still requires the
            authenticator before the command center opens.
          </p>
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <AuthError message={error} />
          <div className="auth-actions">
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? 'Sending…' : 'Send reset link'}
            </button>
            <a className="btn btn-secondary" href="/login">
              Back to sign in
            </a>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
