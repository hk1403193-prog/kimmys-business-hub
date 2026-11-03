import { sections, type SectionId } from '../sections'
import { SectionButton } from './SectionButton'

type MoreSheetProps = {
  section: SectionId
  sampleStrip: string
  onOpen: (id: SectionId) => void
  onClose: () => void
}

export function MoreSheet({ section, sampleStrip, onOpen, onClose }: MoreSheetProps) {
  return (
    <div
      className="sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-sections-title"
    >
      <p className="sample-strip">{sampleStrip}</p>
      <div className="wrap sheet-body">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <h1 id="all-sections-title">All sections</h1>
        <p className="sheet-lead">
          Choose a part of the command center. Every screen uses practice
          information.
        </p>
        <div className="menu-list">
          {sections.map((item) => (
            <SectionButton
              key={item.id}
              section={item}
              current={item.id === section}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
