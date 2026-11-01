import { sampleMoneyItems, sampleWeek } from '../sample/data'
import { summarizeOperations } from '../domain/dashboard'
import { formatMoney, summarizeMoney } from '../lib/money'
import { useOperations } from '../state/OperationsProvider'
import { Notice } from '../components/Notice'
import { RevenueNote } from '../components/RevenueNote'
import { SectionIntro } from '../components/SectionIntro'

export function ReportsView() {
  const { state } = useOperations()
  const live = summarizeOperations(
    state.orders,
    state.rules,
    state.workloadRules,
    state.today,
  )
  const summary = summarizeMoney(sampleMoneyItems)
  const orders = sampleWeek.reduce((sum, day) => sum + day.orders, 0)
  const tallest = Math.max(...sampleWeek.map((day) => day.income))

  return (
    <div className="stack">
      <SectionIntro eyebrow="Practice session" title="Reports">
        Service revenue from the fictional orders in this session, then a
        separate illustrative week.
      </SectionIntro>
      <Notice>
        Expected and completed figures follow the sample orders open in this
        session. The week chart, its totals, and its average are a fixed
        illustrative snapshot.
      </Notice>
      <div className="stat-grid">
        <article className="stat">
          <p className="stat-value">{formatMoney(live.expectedRevenue)}</p>
          <p className="stat-label">Expected service revenue</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(live.completedRevenue)}</p>
          <p className="stat-label">Completed service revenue</p>
        </article>
        <article className="stat">
          <p className="stat-value">{live.todayRemainingPoints}</p>
          <p className="stat-label">Remaining points today</p>
        </article>
        <article className="stat">
          <p className="stat-value">{live.todayPoints}</p>
          <p className="stat-label">Full day points</p>
        </article>
        <article className="stat">
          <p className="stat-value">{live.upcoming.length}</p>
          <p className="stat-label">Upcoming deliveries</p>
        </article>
        <article className="stat">
          <p className="stat-value">{live.completed}</p>
          <p className="stat-label">Closed orders</p>
        </article>
      </div>
      <RevenueNote />
      <h2>Illustrative sample week</h2>
      <div className="stat-grid">
        <article className="stat">
          <p className="stat-value">{orders}</p>
          <p className="stat-label">Illustrative orders</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.income)}</p>
          <p className="stat-label">Illustrative income</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.profit)}</p>
          <p className="stat-label">Illustrative profit</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.income / orders)}</p>
          <p className="stat-label">Illustrative average</p>
        </article>
      </div>
      <section className="stack" aria-labelledby="week-title">
        <h2 id="week-title">Illustrative income by day</h2>
        <p className="card-meta">
          This chart is a fixed practice picture. It is not this session&apos;s
          orders and it is not money collected.
        </p>
        <div className="card">
          <div
            className="bars"
            role="img"
            aria-label={`Illustrative sample week. ${sampleWeek
              .map(
                (day) =>
                  `${day.label}: ${day.orders} orders, ${formatMoney(day.income)}`,
              )
              .join('. ')}`}
          >
            {sampleWeek.map((day) => (
              <div key={day.label} className="bar-col">
                <span
                  className="bar"
                  style={{
                    height: `${Math.max(8, (day.income / tallest) * 112)}px`,
                  }}
                />
                <span className="bar-label">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
        <ul className="card-list">
          {sampleWeek.map((day) => (
            <li key={day.label} className="card card-row">
              <div>
                <p className="card-title">{day.label}</p>
                <p className="card-meta">{day.orders} illustrative orders</p>
              </div>
              <p className="money-in">{formatMoney(day.income)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
