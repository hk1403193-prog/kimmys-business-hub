import { formatMoney, formatSignedMoney } from '../lib/money'
import type { ServiceQuote } from '../domain/types'

export function QuoteBreakdown({ quote }: { quote: ServiceQuote }) {
  const adjustmentLabel = quote.adjustmentRejected
    ? `${formatSignedMoney(quote.requestedAdjustment)} not applied`
    : formatSignedMoney(quote.adjustment)

  return (
    <div className="stack">
      {quote.validationMessage ? (
        <p className="notice" role="alert">
          {quote.validationMessage}
        </p>
      ) : null}
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
          <dd>{adjustmentLabel}</dd>
        </div>
      </dl>
      <div className="stat-grid">
        <article className="stat">
          <p className="stat-value">{formatMoney(quote.earnings)}</p>
          <p className="stat-label">Service fee</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(quote.dueBeforeShopping)}</p>
          <p className="stat-label">Due before shopping</p>
        </article>
      </div>
      {quote.dueNote ? <p className="card-meta">{quote.dueNote}</p> : null}
      <p className="card-meta">
        Merchandise is the estimated cost of the goods. It is not business
        revenue. The service fee is separate, and it is not money collected.
      </p>
    </div>
  )
}
