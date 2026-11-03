import type { ReactNode } from 'react'

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'ok' | 'error'
  children: ReactNode
}) {
  const className = tone === 'info' ? 'notice' : `notice notice-${tone}`
  if (tone === 'info') return <p className={className}>{children}</p>
  return (
    <p className={className} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}
