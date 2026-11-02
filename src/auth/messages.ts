export function messageForAuthError(raw: string): string {
  const text = raw.toLowerCase()

  if (text.includes('too many') || text.includes('rate limit') || text.includes('rate_limit')) {
    return 'Too many attempts. Wait a minute and try again.'
  }

  if (
    text.includes('failed to fetch') ||
    text.includes('network') ||
    text.includes('fetch failed') ||
    text.includes('load failed')
  ) {
    return 'The sign-in service could not be reached. Check the connection and try again.'
  }

  if (text.includes('email not confirmed')) {
    return 'Confirm this email address before signing in.'
  }

  if (text.includes('invalid login') || text.includes('invalid credentials')) {
    return 'That email or password is not correct.'
  }

  if (
    text.includes('totp') ||
    text.includes('mfa') ||
    (text.includes('code') && text.includes('invalid'))
  ) {
    return 'That authenticator code is not correct. Enter the current 6-digit code.'
  }

  if (text.includes('expired') || (text.includes('invalid') && text.includes('token'))) {
    return 'This reset link is missing or expired. Request a new one.'
  }

  if (
    text.includes('password') &&
    (text.includes('weak') || text.includes('short') || text.includes('at least') || text.includes('least'))
  ) {
    return 'Choose a longer password. Use at least 8 characters.'
  }

  return 'That request was refused. Check the details and try again.'
}

export function passwordChangeError(password: string, confirm: string): string | null {
  if (password.length < 8) return 'Use at least 8 characters.'
  if (password !== confirm) return 'Those passwords do not match.'
  return null
}
