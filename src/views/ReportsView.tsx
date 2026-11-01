import { sampleMoneyItems, sampleWeek } from '../sample/data'
import { summarizeOperations } from '../domain/dashboard'
import { formatMoney, summarizeMoney } from '../lib/money'
import { useOperations } from '../state/OperationsProvider'
import { RevenueNote, StatusMeaning } from '../components/ClarityNotes'
import { Notice } from '../components/Notice'
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
      <SectionIntro title="Reports">
        Service revenue from this practice session, plus one fixed illustrative
        week.
      </SectionIntro>
      <Notice>
        The chart below is a fixed illustration. It does not change when sample
        orders change.
      </Notice>
      <StatusMeaning />
      <div className="stat-grid">
        <article className="stat">
          <p className="stat-value">{formatMoney(live.expectedRevenue)}</p>
          <p className="stat-label">Expected service revenue</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(live.completedRevenue)}</p>
          <p className="stat-label">Completed service revenue</p>
        </article>
      </div>
      <RevenueNote />
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
        <div className="card">
          <div
            className="bars"
            role="img"
            aria-label={sampleWeek
              .map(
                (day) =>
                  `${day.label}: ${day.orders} orders, ${formatMoney(day.income)}`,
              )
              .join('. ')}
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
                <p className="card-meta">{day.orders} sample orders</p>
              </div>
              <p className="money-in">{formatMoney(day.income)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
