import type { Section, SectionId } from '../sections'
import { Icon } from './Icon'

type SectionButtonProps = {
  section: Section
  onOpen: (id: SectionId) => void
  current?: boolean
}

export function SectionButton({
  section,
  onOpen,
  current = false,
}: SectionButtonProps) {
  return (
    <button
      type="button"
      className="menu-btn"
      aria-current={current ? 'page' : undefined}
      onClick={() => onOpen(section.id)}
    >
      <span className="menu-icon">
        <Icon name={section.id} />
      </span>
      <span className="menu-copy">
        <span className="menu-label">{section.label}</span>
        <span className="menu-desc">{section.description}</span>
      </span>
    </button>
  )
}
