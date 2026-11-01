import { useOperations } from '../state/OperationsProvider'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'
import { SwitchRow } from '../components/SwitchRow'

export function SettingsView() {
  const { state, toggleHours, toggleService, toggleArea } = useOperations()
  const { hours, services, areas } = state

  return (
    <div className="stack">
      <SectionIntro title="Settings">
        Practice hours, services, areas, and payment choices. Switches last
        until you refresh.
      </SectionIntro>
      <Notice>
        Nothing here is published. Card processing stays disconnected.
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
            onToggle={() => toggleService(item.id)}
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
            onToggle={() => toggleArea(item.id)}
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
