import { getSection, primaryNav, type SectionId } from '../sections'
import { Icon } from './Icon'

type BottomNavProps = {
  section: SectionId
  moreOpen: boolean
  onOpen: (id: SectionId) => void
  onMore: () => void
}

export function BottomNav({
  section,
  moreOpen,
  onOpen,
  onMore,
}: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Command center">
      <div className="wrap nav-row">
        {primaryNav.map((id) => {
          const item = getSection(id)
          const current = !moreOpen && section === id

          return (
            <button
              key={id}
              type="button"
              className="nav-btn"
              aria-current={current ? 'page' : undefined}
              onClick={() => onOpen(id)}
            >
              <Icon name={id} />
              <span>{item.navLabel}</span>
            </button>
          )
        })}
        <button
          type="button"
          className="nav-btn"
          aria-expanded={moreOpen}
          aria-current={moreOpen ? 'page' : undefined}
          onClick={onMore}
        >
          <Icon name="more" />
          <span>More</span>
        </button>
      </div>
    </nav>
  )
}
