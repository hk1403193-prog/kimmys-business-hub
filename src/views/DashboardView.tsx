import { formatPracticeDate } from '../domain/dates'
import { summarizeOperations } from '../domain/dashboard'
import { formatMoney } from '../lib/money'
import { sections, type SectionId } from '../sections'
import { useOperations } from '../state/OperationsProvider'
import { Notice } from '../components/Notice'
import { OrderSyncNotice } from '../components/OrderSyncNotice'
import { PracticeStatusPill } from '../components/PracticeStatusPill'
import { RevenueNote } from '../components/RevenueNote'
import { SectionButton } from '../components/SectionButton'
import { SectionIntro } from '../components/SectionIntro'
import { StatusGuide } from '../components/StatusGuide'

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
        fictional orders.
      </SectionIntro>
      <OrderSyncNotice />
      <Notice>
        Fee rules, the day plan, and the switches still reset when you refresh.
        The live customer website was left as it is. Payments stay disconnected.
      </Notice>
      <section className="hero" aria-label="Sample day summary">
        <p className="eyebrow">Remaining workload</p>
        <p className="hero-stat">
          {summary.todayRemainingPoints}{' '}
          {summary.todayRemainingPoints === 1 ? 'point' : 'points'}
        </p>
        <p className="hero-copy">
          {summary.todayRemainingMinutes} planning minutes still open. Full
          day: {summary.todayPoints} points and {summary.todayMinutes} minutes.
          Closed workload: {summary.todayCompletedPoints} points and{' '}
          {summary.todayCompletedMinutes} minutes.
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
          <p className="stat-label">Expected service revenue</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.completedRevenue)}</p>
          <p className="stat-label">Completed service revenue</p>
        </article>
        <article className="stat">
          <p className="stat-value">{summary.upcoming.length}</p>
          <p className="stat-label">Upcoming</p>
        </article>
      </div>
      <RevenueNote />
      <StatusGuide />
      <section className="stack" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title">Upcoming deliveries</h2>
        <p className="card-meta">
          Delivered orders stay here until they are closed. Completed and
          canceled orders stay in the history and are left off this list.
        </p>
        {summary.upcoming.length === 0 ? (
          <p className="card-meta">No upcoming deliveries.</p>
        ) : (
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
        )}
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
