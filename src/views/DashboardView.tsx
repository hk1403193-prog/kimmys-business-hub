import { formatPracticeDate } from '../domain/dates'
import { summarizeOperations } from '../domain/dashboard'
import { formatMoney } from '../lib/money'
import { sections, type SectionId } from '../sections'
import { useOperations } from '../state/OperationsProvider'
import { Notice } from '../components/Notice'
import { PracticeStatusPill } from '../components/PracticeStatusPill'
import { SectionButton } from '../components/SectionButton'
import { SectionIntro } from '../components/SectionIntro'

type DashboardViewProps = {
  onOpen: (id: SectionId) => void
}

export function DashboardView({ onOpen }: DashboardViewProps) {
  const { state } = useOperations()
  const summary = summarizeOperations(
    state.orders,
    state.rules,
    state.workloadRules,
    state.today,
  )

  return (
    <div className="stack">
      <SectionIntro
        eyebrow="Sample day"
        title="Daily overview"
      >
        Kimmy&apos;s Personal Concierge &amp; Delivery. Totals follow the
        fictional orders in this session.
      </SectionIntro>
      <Notice>
        This private command center resets when you refresh. Your live customer
        website was left as it is.
      </Notice>
      <section className="hero" aria-label="Sample day summary">
        <p className="eyebrow">Today&apos;s sample load</p>
        <p className="hero-stat">{summary.todayPoints} points</p>
        <p className="hero-copy">
          {summary.todayMinutes} planning minutes ·{' '}
          {formatMoney(summary.todayEarnings)} fictional earnings today
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
          <p className="stat-value">{summary.completed}</p>
          <p className="stat-label">Completed</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.expectedRevenue)}</p>
          <p className="stat-label">Expected earnings</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.completedRevenue)}</p>
          <p className="stat-label">Completed earnings</p>
        </article>
        <article className="stat">
          <p className="stat-value">{summary.upcoming.length}</p>
          <p className="stat-label">Upcoming</p>
        </article>
      </div>
      <section className="stack" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title">Upcoming deliveries</h2>
        <ul className="card-list">
          {summary.upcoming.slice(0, 4).map((order) => (
            <li key={order.id}>
              <button
                type="button"
                className="menu-btn"
                onClick={() => onOpen('orders')}
              >
                <span className="menu-copy">
                  <span className="menu-label">{order.customer}</span>
                  <span className="menu-desc">
                    {formatPracticeDate(order.requestedDate, state.today)} ·{' '}
                    {order.deliveryWindow}
                  </span>
                </span>
                <PracticeStatusPill status={order.status} />
              </button>
            </li>
          ))}
        </ul>
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
