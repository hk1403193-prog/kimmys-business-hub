import { useState, type FormEvent } from 'react'
import { AuthError } from './AuthLayout'

export function TotpForm({
  pending,
  error,
  onSubmit,
}: {
  pending: boolean
  error: string | null
  onSubmit: (code: string) => Promise<void>
}) {
  const [code, setCode] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    void onSubmit(code)
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label className="field">
        <span>6-digit code</span>
        <input
          type="text"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoCapitalize="none"
          spellCheck={false}
          pattern="[0-9 ]{6,8}"
          maxLength={8}
          required
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      </label>
      <AuthError message={error} />
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? 'Checking…' : 'Verify code'}
      </button>
    </form>
  )
}
