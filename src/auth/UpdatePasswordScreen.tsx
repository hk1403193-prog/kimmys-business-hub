import { useState, type FormEvent } from 'react'
import { AuthError, AuthLayout } from './AuthLayout'
import { useAuth } from './AuthProvider'

export function UpdatePasswordScreen() {
  const { hasSession, updatePassword, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const message = await updatePassword(password, confirm)
    setPending(false)
    if (message) {
      setError(message)
      return
    }
    setPassword('')
    setConfirm('')
    setDone(true)
  }

  if (!hasSession) {
    return (
      <AuthLayout title="Reset link expired" eyebrow="Owner sign-in">
        <p>This reset link is missing or expired. Request a new one.</p>
        <div className="auth-actions">
          <a className="btn btn-primary" href="/recover">
            Request a new link
          </a>
          <a className="btn btn-secondary" href="/login">
            Back to sign in
          </a>
        </div>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" eyebrow="Owner sign-in">
        <p>
          The new password is saved. The authenticator is still required before
          the command center opens.
        </p>
        <a className="btn btn-primary" href="/">
          Continue
        </a>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a new password" eyebrow="Owner sign-in">
      <form className="auth-form" onSubmit={(event) => void onSubmit(event)}>
        <label className="field">
          <span>New password</span>
          <input
            type="password"
            name="new-password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Confirm password</span>
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </label>
        <AuthError message={error} />
        <div className="auth-actions">
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? 'Saving…' : 'Save password'}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
