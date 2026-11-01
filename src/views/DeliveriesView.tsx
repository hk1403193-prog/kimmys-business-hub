import { useState } from 'react'
import { sampleStops } from '../sample/data'
import { moveItem } from '../lib/moveItem'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'
import { StatusPill } from '../components/StatusPill'
import type { SampleStop } from '../sample/types'

export function DeliveriesView() {
  const [stops, setStops] = useState<SampleStop[]>(sampleStops)

  function move(index: number, direction: -1 | 1) {
    setStops((current) => moveItem(current, index, direction))
  }

  return (
    <div className="stack">
      <SectionIntro title="Deliveries">
        A practice route for one sample day. Move a stop earlier or later to
        try the layout.
      </SectionIntro>
      <Notice>
        The new order stays on this screen only. It is not saved, and no map
        service is connected.
      </Notice>
      <ol className="card-list">
        {stops.map((stop, index) => (
          <li key={stop.id} className="card">
            <p className="eyebrow">Stop {index + 1}</p>
            <div className="card-top">
              <p className="card-title">{stop.customer}</p>
              <StatusPill status={stop.status} />
            </div>
            <p className="card-meta">{stop.time}</p>
            <p className="card-meta">
              {stop.task} · {stop.place}
            </p>
            <div className="pair">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                Earlier
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => move(index, 1)}
                disabled={index === stops.length - 1}
              >
                Later
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
