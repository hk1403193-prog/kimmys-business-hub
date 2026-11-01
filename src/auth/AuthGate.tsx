import { useEffect, useState } from 'react'
import { App } from '../App'
import { OperationsProvider } from '../state/OperationsProvider'
import { ForbiddenScreen } from './ForbiddenScreen'
import { commandCenterIsOpen, devPreview, resolveGate } from './gate'
import { LoadingScreen } from './AuthLayout'
import { LoginScreen } from './LoginScreen'
import { MfaChallengeScreen } from './MfaChallengeScreen'
import { MfaEnrollScreen } from './MfaEnrollScreen'
import { RecoverScreen } from './RecoverScreen'
import { SetupScreen } from './SetupScreen'
import { UpdatePasswordScreen } from './UpdatePasswordScreen'
import { useAuth } from './AuthProvider'

function useLocationKey(): string {
  const [key, setKey] = useState(
    () => `${window.location.pathname}${window.location.search}${window.location.hash}`,
  )

  useEffect(() => {
    const onChange = () => {
      setKey(`${window.location.pathname}${window.location.search}${window.location.hash}`)
    }
    window.addEventListener('popstate', onChange)
    window.addEventListener('hashchange', onChange)
    return () => {
      window.removeEventListener('popstate', onChange)
      window.removeEventListener('hashchange', onChange)
    }
  }, [])

  return key
}

export function AuthGate() {
  const auth = useAuth()
  useLocationKey()
  const screen = resolveGate({
    loading: auth.loading,
    configured: auth.configured,
    pathname: window.location.pathname,
    hash: window.location.hash,
    decision: auth.decision,
  })

  useEffect(() => {
    if (!commandCenterIsOpen(screen.screen)) return
    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    if (path === '/login' || path === '/recover') {
      window.history.replaceState(null, '', `/${window.location.hash}`)
    }
  }, [screen.screen])

  if (import.meta.env.DEV) {
    const preview = devPreview(true, window.location.search)
    if (preview === 'mfa-enroll') {
      return (
        <MfaEnrollScreen
          demo={{
            ok: true,
            factorId: 'dev-preview',
            secret: 'DEVPREVIEW ONLY',
            qrSrc:
              'data:image/svg+xml;utf-8,' +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#fff"/><rect x="8" y="8" width="32" height="32" fill="#111"/><rect x="80" y="8" width="32" height="32" fill="#111"/><rect x="8" y="80" width="32" height="32" fill="#111"/><rect x="16" y="16" width="16" height="16" fill="#fff"/><rect x="88" y="16" width="16" height="16" fill="#fff"/><rect x="16" y="88" width="16" height="16" fill="#fff"/><rect x="48" y="48" width="8" height="8" fill="#111"/><rect x="60" y="48" width="8" height="8" fill="#111"/><rect x="48" y="60" width="8" height="8" fill="#111"/><rect x="72" y="60" width="8" height="8" fill="#111"/><rect x="60" y="72" width="8" height="8" fill="#111"/><rect x="84" y="84" width="8" height="8" fill="#111"/><rect x="96" y="84" width="8" height="8" fill="#111"/><rect x="84" y="96" width="8" height="8" fill="#111"/></svg>',
              ),
          }}
        />
      )
    }
    if (preview === 'mfa-challenge') {
      return <MfaChallengeScreen demo />
    }
  }

  switch (screen.screen) {
    case 'loading':
      return <LoadingScreen />
    case 'setup':
      return <SetupScreen problem={auth.configProblem ?? 'missing'} />
    case 'recover':
      return <RecoverScreen />
    case 'update-password':
      return <UpdatePasswordScreen />
    case 'forbidden':
      return <ForbiddenScreen />
    case 'mfa-enroll':
      return <MfaEnrollScreen />
    case 'mfa-challenge':
      return <MfaChallengeScreen />
    case 'command-center':
      if (!auth.proof) return <ForbiddenScreen />
      return (
        <OperationsProvider proof={auth.proof}>
          <App />
        </OperationsProvider>
      )
    case 'login':
      return <LoginScreen />
  }
}
