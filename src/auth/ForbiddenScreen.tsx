import { AuthLayout } from './AuthLayout'
import { useAuth } from './AuthProvider'

export function ForbiddenScreen() {
  const { email, signOut } = useAuth()

  return (
    <AuthLayout title="Owner access required" eyebrow="Owner sign-in">
      <p>
        {email ? `${email} is signed in, but ` : 'This account is signed in, but '}
        it is not the owner. The command center stays closed.
      </p>
      <p>
        An administrator assigns the owner role in app metadata for the
        practice project. Editable user metadata does not grant access. Sign
        out, then sign in again after that change.
      </p>
      <button className="btn btn-secondary" type="button" onClick={() => void signOut()}>
        Sign out
      </button>
    </AuthLayout>
  )
}
