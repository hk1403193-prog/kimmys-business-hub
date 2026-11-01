import type { ReactNode } from 'react'
import { BrandHeader } from '../components/BrandHeader'

export function AuthLayout({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow: string
  children: ReactNode
}) {
  return (
    <div className="auth-screen">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <p className="sample-strip">Private practice project · Not the live website</p>
      <BrandHeader compact />
      <main id="content" className="main auth-main">
        <div className="wrap">
          <section className="card auth-card" aria-labelledby="auth-title">
            <p className="eyebrow">{eyebrow}</p>
            <h1 id="auth-title">{title}</h1>
            {children}
          </section>
        </div>
      </main>
    </div>
  )
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="auth-error" role="alert">
      {message}
    </p>
  )
}

export function LoadingScreen() {
  return (
    <AuthLayout title="Checking your sign-in" eyebrow="Owner sign-in">
      <p>The command center stays closed until this check finishes.</p>
    </AuthLayout>
  )
}
