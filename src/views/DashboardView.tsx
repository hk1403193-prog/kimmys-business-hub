import { sampleFollowUps, sampleOrders, sampleStops } from '../sample/data'
import { formatMoney } from '../lib/money'
import { summarizeOrders } from '../lib/orders'
import { sections, type SectionId } from '../sections'
import { Notice } from '../components/Notice'
import { SectionButton } from '../components/SectionButton'
import { SectionIntro } from '../components/SectionIntro'
import { StatusPill } from '../components/StatusPill'

type DashboardViewProps = {
  onOpen: (id: SectionId) => void
}

export function DashboardView({ onOpen }: DashboardViewProps) {
  const summary = summarizeOrders(sampleOrders)
  const nextStops = sampleStops.slice(0, 3)

  return (
    <div className="stack">
      <SectionIntro
        eyebrow="Sample day"
        title="Daily overview"
        children="A practice look at today. Nothing here is a real order or a real customer."
      />
      <Notice>
        This is your private command center preview. Your live customer website
        was left as it is.
      </Notice>
      <section className="hero" aria-label="Sample day summary">
        <p className="eyebrow">Today&apos;s sample load</p>
        <p className="hero-stat">{summary.total} orders</p>
        <p className="hero-copy">
          {summary.open} still open · {formatMoney(summary.expected)} sample
          expected
        </p>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onOpen('orders')}
          >
            Review orders
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onOpen('deliveries')}
          >
            See the route
          </button>
        </div>
      </section>
      <div className="stat-grid">
        <article className="stat">
          <p className="stat-value">{summary.fresh}</p>
          <p className="stat-label">New</p>
        </article>
        <article className="stat">
          <p className="stat-value">{summary.active}</p>
          <p className="stat-label">Active</p>
        </article>
        <article className="stat">
          <p className="stat-value">{sampleStops.length}</p>
          <p className="stat-label">Stops</p>
        </article>
        <article className="stat">
          <p className="stat-value">{sampleFollowUps.length}</p>
          <p className="stat-label">Follow-ups</p>
        </article>
      </div>
      <section className="stack" aria-labelledby="next-stops-title">
        <h2 id="next-stops-title">Next sample stops</h2>
        <ul className="card-list">
          {nextStops.map((stop) => (
            <li key={stop.id} className="card">
              <div className="card-top">
                <p className="card-title">{stop.customer}</p>
                <StatusPill status={stop.status} />
              </div>
              <p className="card-meta">
                {stop.time} · {stop.task}
              </p>
              <p className="card-meta">{stop.place}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="stack" aria-labelledby="attention-title">
        <h2 id="attention-title">Needs a look</h2>
        <div className="menu-list">
          <button
            type="button"
            className="menu-btn"
            onClick={() => onOpen('orders')}
          >
            <span className="menu-copy">
              <span className="menu-label">New sample order S-1042</span>
              <span className="menu-desc">Avery Sample · shopping list</span>
            </span>
          </button>
          <button
            type="button"
            className="menu-btn"
            onClick={() => onOpen('marketing')}
          >
            <span className="menu-copy">
              <span className="menu-label">2 sample follow-ups</span>
              <span className="menu-desc">Nothing is sent from this preview</span>
            </span>
          </button>
          <button
            type="button"
            className="menu-btn"
            onClick={() => onOpen('settings')}
          >
            <span className="menu-copy">
              <span className="menu-label">Card processing is off</span>
              <span className="menu-desc">No payment company is connected</span>
            </span>
          </button>
        </div>
      </section>
      <section className="stack" aria-labelledby="open-section-title">
        <h2 id="open-section-title">Open a section</h2>
        <div className="menu-list">
          {sections
            .filter((section) => section.id !== 'dashboard')
            .map((section) => (
              <SectionButton
                key={section.id}
                section={section}
                onOpen={onOpen}
              />
            ))}
        </div>
      </section>
    </div>
  )
}
