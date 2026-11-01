import { sampleMoneyItems, sampleWeek } from '../sample/data'
import { formatMoney, summarizeMoney } from '../lib/money'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'

export function ReportsView() {
  const summary = summarizeMoney(sampleMoneyItems)
  const orders = sampleWeek.reduce((sum, day) => sum + day.orders, 0)
  const tallest = Math.max(...sampleWeek.map((day) => day.income))

  return (
    <div className="stack">
      <SectionIntro eyebrow="Sample week" title="Reports">
        A practice picture of business performance. The bars match the sample
        money totals.
      </SectionIntro>
      <Notice>These results are invented for the layout.</Notice>
      <div className="stat-grid">
        <article className="stat">
          <p className="stat-value">{orders}</p>
          <p className="stat-label">Sample orders</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.income)}</p>
          <p className="stat-label">Sample income</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.profit)}</p>
          <p className="stat-label">Sample profit</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.income / orders)}</p>
          <p className="stat-label">Average ticket</p>
        </article>
      </div>
      <section className="stack" aria-labelledby="week-title">
        <h2 id="week-title">Sample income by day</h2>
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
