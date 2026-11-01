import { useState } from 'react'
import { initialQuote } from '../sample/data'
import { formatMoney } from '../lib/money'
import { calculateSampleQuote, stepValue, type QuoteInput } from '../lib/quote'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'
import { Stepper } from '../components/Stepper'

export function QuotesView() {
  const [quote, setQuote] = useState<QuoteInput>(initialQuote)
  const result = calculateSampleQuote(quote)

  function update(key: keyof QuoteInput, delta: number, min: number, max: number) {
    setQuote((current) => {
      const value = current[key]
      if (typeof value !== 'number') {
        return current
      }

      return { ...current, [key]: stepValue(value, delta, min, max) }
    })
  }

  return (
    <div className="stack">
      <SectionIntro title="Quotes & Pricing">
        Practice fee settings for a 5-mile sample trip. Changing a number
        updates the sample total on this screen only.
      </SectionIntro>
      <Notice>
        Phase 1 does not save these fees, and it does not send a quote to
        anyone.
      </Notice>
      <section className="hero" aria-label="Sample quote total">
        <p className="eyebrow">Sample total</p>
        <p className="hero-stat">{formatMoney(result.total)}</p>
        <p className="hero-copy">
          {quote.miles} miles · {formatMoney(quote.subtotal)} practice order
          {quote.shopping ? ' · shopping on' : ' · shopping off'}
        </p>
      </section>
      <dl className="breakdown">
        <div>
          <dt>Delivery fee</dt>
          <dd>{formatMoney(result.deliveryFee)}</dd>
        </div>
        <div>
          <dt>Extra miles</dt>
          <dd>{result.extraMiles}</dd>
        </div>
        <div>
          <dt>Small-order fee</dt>
          <dd>{formatMoney(result.smallOrderFee)}</dd>
        </div>
        <div>
          <dt>Shopping fee</dt>
          <dd>{formatMoney(result.shoppingFee)}</dd>
        </div>
      </dl>
      <div className="stack">
        <h2>Sample trip</h2>
        <Stepper
          label="Miles"
          value={`${quote.miles}`}
          onLess={() => update('miles', -0.5, 0, 40)}
          onMore={() => update('miles', 0.5, 0, 40)}
          lessDisabled={quote.miles <= 0}
          moreDisabled={quote.miles >= 40}
        />
        <Stepper
          label="Order amount"
          value={formatMoney(quote.subtotal)}
          onLess={() => update('subtotal', -5, 0, 500)}
          onMore={() => update('subtotal', 5, 0, 500)}
          lessDisabled={quote.subtotal <= 0}
          moreDisabled={quote.subtotal >= 500}
        />
        <button
          type="button"
          className={quote.shopping ? 'btn btn-primary' : 'btn btn-secondary'}
          aria-pressed={quote.shopping}
          onClick={() =>
            setQuote((current) => ({ ...current, shopping: !current.shopping }))
          }
        >
          {quote.shopping ? 'Shopping fee on' : 'Shopping fee off'}
        </button>
      </div>
      <div className="stack">
        <h2>Fee settings</h2>
        <Stepper
          label="Base delivery fee"
          value={formatMoney(quote.baseFee)}
          onLess={() => update('baseFee', -1, 0, 100)}
          onMore={() => update('baseFee', 1, 0, 100)}
          lessDisabled={quote.baseFee <= 0}
          moreDisabled={quote.baseFee >= 100}
        />
        <Stepper
          label="Fee per extra mile"
          value={formatMoney(quote.perExtraMile)}
          onLess={() => update('perExtraMile', -0.25, 0, 20)}
          onMore={() => update('perExtraMile', 0.25, 0, 20)}
          lessDisabled={quote.perExtraMile <= 0}
          moreDisabled={quote.perExtraMile >= 20}
        />
        <Stepper
          label="Included miles"
          value={`${quote.includedMiles}`}
          onLess={() => update('includedMiles', -1, 0, 20)}
          onMore={() => update('includedMiles', 1, 0, 20)}
          lessDisabled={quote.includedMiles <= 0}
          moreDisabled={quote.includedMiles >= 20}
        />
        <Stepper
          label="Small-order threshold"
          value={formatMoney(quote.smallOrderThreshold)}
          onLess={() => update('smallOrderThreshold', -5, 0, 200)}
          onMore={() => update('smallOrderThreshold', 5, 0, 200)}
          lessDisabled={quote.smallOrderThreshold <= 0}
          moreDisabled={quote.smallOrderThreshold >= 200}
        />
        <Stepper
          label="Small-order fee"
          value={formatMoney(quote.smallOrderFee)}
          onLess={() => update('smallOrderFee', -1, 0, 50)}
          onMore={() => update('smallOrderFee', 1, 0, 50)}
          lessDisabled={quote.smallOrderFee <= 0}
          moreDisabled={quote.smallOrderFee >= 50}
        />
        <Stepper
          label="Shopping fee"
          value={formatMoney(quote.shoppingFee)}
          onLess={() => update('shoppingFee', -1, 0, 100)}
          onMore={() => update('shoppingFee', 1, 0, 100)}
          lessDisabled={quote.shoppingFee <= 0}
          moreDisabled={quote.shoppingFee >= 100}
        />
      </div>
    </div>
  )
}
