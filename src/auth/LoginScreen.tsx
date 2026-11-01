import { useState, type FormEvent } from 'react'
import { AuthError, AuthLayout } from './AuthLayout'
import { useAuth } from './AuthProvider'

export function LoginScreen() {
  const { signIn, banner } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const message = await signIn(email, password)
    setPending(false)
    if (message) {
      setPassword('')
      setError(message)
    }
  }

  return (
    <AuthLayout title="Sign in" eyebrow="Owner sign-in">
      <p>Use the administrator-created owner account. New sign-ups stay off.</p>
      <form className="auth-form" onSubmit={(event) => void onSubmit(event)}>
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
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <AuthError message={error ?? banner} />
        <div className="auth-actions">
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
          <a className="btn btn-secondary" href="/recover">
            Forgot password
          </a>
        </div>
      </form>
    </AuthLayout>
  )
}
