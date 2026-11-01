import { useState, type Dispatch, type SetStateAction } from 'react'
import {
  sampleAreas,
  sampleHours,
  sampleServices,
} from '../sample/data'
import type { SampleHours, SampleToggle } from '../sample/types'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'
import { SwitchRow } from '../components/SwitchRow'

export function SettingsView() {
  const [hours, setHours] = useState<SampleHours[]>(sampleHours)
  const [services, setServices] = useState<SampleToggle[]>(sampleServices)
  const [areas, setAreas] = useState<SampleToggle[]>(sampleAreas)

  function toggleHours(day: string) {
    setHours((current) =>
      current.map((item) =>
        item.day === day ? { ...item, open: !item.open } : item,
      ),
    )
  }

  function toggleList(
    id: string,
    update: Dispatch<SetStateAction<SampleToggle[]>>,
  ) {
    update((current) =>
      current.map((item) =>
        item.id === id ? { ...item, on: !item.on } : item,
      ),
    )
  }

  return (
    <div className="stack">
      <SectionIntro title="Settings">
        Practice hours, services, areas, and payment choices. Switches change
        this screen only.
      </SectionIntro>
      <Notice>
        Nothing here is published. Card processing stays disconnected in Phase
        1.
      </Notice>
      <section className="stack" aria-labelledby="hours-title">
        <h2 id="hours-title">Hours</h2>
        {hours.map((item) => (
          <SwitchRow
            key={item.day}
            label={item.day}
            detail={item.open ? item.hours : 'Closed in this sample'}
            on={item.open}
            onToggle={() => toggleHours(item.day)}
          />
        ))}
      </section>
      <section className="stack" aria-labelledby="services-title">
        <h2 id="services-title">Services</h2>
        {services.map((item) => (
          <SwitchRow
            key={item.id}
            label={item.label}
            detail={item.detail}
            on={item.on}
            onToggle={() => toggleList(item.id, setServices)}
          />
        ))}
      </section>
      <section className="stack" aria-labelledby="areas-title">
        <h2 id="areas-title">Service areas</h2>
        {areas.map((item) => (
          <SwitchRow
            key={item.id}
            label={item.label}
            detail={item.detail}
            on={item.on}
            onToggle={() => toggleList(item.id, setAreas)}
          />
        ))}
      </section>
      <section className="stack" aria-labelledby="payments-title">
        <h2 id="payments-title">Payments</h2>
        <article className="card">
          <p className="card-title">Pay on delivery</p>
          <p className="card-body">Sample choice. Shown as available for the layout.</p>
        </article>
        <article className="card">
          <p className="card-title">Cash</p>
          <p className="card-body">Sample choice. No cash drawer is connected.</p>
        </article>
        <article className="card">
          <div className="card-top">
            <p className="card-title">Card processing</p>
            <span className="pill pill-new">Not connected</span>
          </div>
          <p className="card-body">
            No payment company is linked. Phase 1 cannot take a card payment.
          </p>
        </article>
      </section>
    </div>
  )
}
