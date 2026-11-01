import { formatMoney, formatSignedMoney } from '../lib/money'
import type { ServiceQuote } from '../domain/types'

export function QuoteBreakdown({ quote }: { quote: ServiceQuote }) {
  return (
    <div className="stack">
      <dl className="breakdown">
        <div>
          <dt>Merchandise estimate</dt>
          <dd>{formatMoney(quote.merchandiseTotal)}</dd>
        </div>
        {quote.lines.map((line) => (
          <div key={line.key}>
            <dt>
              {line.label}
              {line.dueBeforeShopping ? '' : ' · later'}
            </dt>
            <dd>{formatMoney(line.amount)}</dd>
          </div>
        ))}
        <div>
          <dt>Discount</dt>
          <dd>{formatMoney(quote.discount)}</dd>
        </div>
        <div>
          <dt>Manual adjustment</dt>
          <dd>{formatSignedMoney(quote.adjustment)}</dd>
        </div>
      </dl>
      <div className="stat-grid">
        <article className="stat">
          <p className="stat-value">{formatMoney(quote.earnings)}</p>
          <p className="stat-label">Fictional earnings</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(quote.dueBeforeShopping)}</p>
          <p className="stat-label">Due before shopping</p>
        </article>
      </div>
      <p className="card-meta">
        Merchandise is the estimated cost of the goods. It is not business
        revenue. Earnings are the fictional service fees.
      </p>
    </div>
  )
}
