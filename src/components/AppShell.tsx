import type { ReactNode } from 'react'
import type { SectionId } from '../sections'
import { BottomNav } from './BottomNav'
import { BrandHeader } from './BrandHeader'
import { MoreSheet } from './MoreSheet'

type AppShellProps = {
  section: SectionId
  moreOpen: boolean
  email: string | null
  onSignOut: () => void
  onOpen: (id: SectionId) => void
  onMore: () => void
  onCloseMore: () => void
  children: ReactNode
}

export function AppShell({
  section,
  moreOpen,
  email,
  onSignOut,
  onOpen,
  onMore,
  onCloseMore,
  children,
}: AppShellProps) {
  return (
    <>
      <div className="app" inert={moreOpen ? true : undefined}>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <p className="sample-strip">
          Fictional sample data · Not saved
        </p>
        <div className="session-bar">
          <p>Owner signed in{email ? ` · ${email}` : ''}</p>
          <button className="btn btn-secondary" type="button" onClick={onSignOut}>
            Sign out
          </button>
        </div>
        <BrandHeader compact={section !== 'dashboard'} />
        <main id="content" className="main">
          <div className="wrap">{children}</div>
        </main>
        <BottomNav
          section={section}
          moreOpen={moreOpen}
          onOpen={onOpen}
          onMore={onMore}
        />
      </div>
      {moreOpen ? (
        <MoreSheet section={section} onOpen={onOpen} onClose={onCloseMore} />
      ) : null}
    </>
  )
}
