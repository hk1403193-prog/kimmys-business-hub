import { stepValue } from '../lib/quote'
import { formatMoney, formatSignedMoney } from '../lib/money'
import { calculateServiceQuote } from '../domain/pricing'
import type { PricingRules, QuoteScenario } from '../domain/types'
import type { SectionId } from '../sections'
import { useOperations } from '../state/OperationsProvider'
import { Notice } from '../components/Notice'
import { QuoteBreakdown } from '../components/QuoteBreakdown'
import { SectionIntro } from '../components/SectionIntro'
import { Stepper } from '../components/Stepper'

type QuotesViewProps = {
  onOpen: (id: SectionId) => void
}

export function QuotesView({ onOpen }: QuotesViewProps) {
  const { state, updatePractice, updateRules, armDraft } = useOperations()
  const quote = calculateServiceQuote(state.rules, state.practice)

  function updateScenario(patch: Partial<QuoteScenario>) {
    updatePractice({ ...state.practice, ...patch })
  }

  function updateRule<Key extends keyof PricingRules>(
    key: Key,
    value: PricingRules[Key],
  ) {
    updateRules({ ...state.rules, [key]: value })
  }

  return (
    <div className="stack">
      <SectionIntro title="Quotes & Pricing">
        A practice calculator. Fee rules are editable and apply to every sample
        order in this session.
      </SectionIntro>
      <Notice>
        These amounts are fictional. Merchandise is kept separate from service
        earnings. Nothing is billed.
      </Notice>
      <section className="hero" aria-label="Sample quote">
        <p className="eyebrow">Fictional earnings</p>
        <p className="hero-stat">{formatMoney(quote.earnings)}</p>
        <p className="hero-copy">
          Due before shopping {formatMoney(quote.dueBeforeShopping)} · Goods{' '}
          {formatMoney(quote.merchandiseTotal)}
        </p>
      </section>
      <QuoteBreakdown quote={quote} />
      <details className="fold" open>
        <summary>Practice trip</summary>
        <div className="fold-body">
          <Stepper
            label="Miles"
            value={`${state.practice.miles}`}
            onLess={() =>
              updateScenario({
                miles: stepValue(state.practice.miles, -0.5, 0, 40),
              })
            }
            onMore={() =>
              updateScenario({
                miles: stepValue(state.practice.miles, 0.5, 0, 40),
              })
            }
            lessDisabled={state.practice.miles <= 0}
            moreDisabled={state.practice.miles >= 40}
          />
          <Stepper
            label="Merchandise estimate"
            value={formatMoney(state.practice.merchandiseTotal)}
            onLess={() =>
              updateScenario({
                merchandiseTotal: stepValue(
                  state.practice.merchandiseTotal,
                  -5,
                  0,
                  500,
                ),
              })
            }
            onMore={() =>
              updateScenario({
                merchandiseTotal: stepValue(
                  state.practice.merchandiseTotal,
                  5,
                  0,
                  500,
                ),
              })
            }
            lessDisabled={state.practice.merchandiseTotal <= 0}
            moreDisabled={state.practice.merchandiseTotal >= 500}
          />
          <Stepper
            label="Additional stops"
            value={`${state.practice.extraStops}`}
            onLess={() =>
              updateScenario({
                extraStops: stepValue(state.practice.extraStops, -1, 0, 6),
              })
            }
            onMore={() =>
              updateScenario({
                extraStops: stepValue(state.practice.extraStops, 1, 0, 6),
              })
            }
            lessDisabled={state.practice.extraStops <= 0}
            moreDisabled={state.practice.extraStops >= 6}
          />
          <Stepper
            label="Waiting minutes"
            value={`${state.practice.waitingMinutes}`}
            onLess={() =>
              updateScenario({
                waitingMinutes: stepValue(
                  state.practice.waitingMinutes,
                  -15,
                  0,
                  180,
                ),
              })
            }
            onMore={() =>
              updateScenario({
                waitingMinutes: stepValue(
                  state.practice.waitingMinutes,
                  15,
                  0,
                  180,
                ),
              })
            }
            lessDisabled={state.practice.waitingMinutes <= 0}
            moreDisabled={state.practice.waitingMinutes >= 180}
          />
          <Stepper
            label="Discount"
            value={formatMoney(state.practice.discount)}
            onLess={() =>
              updateScenario({
                discount: stepValue(state.practice.discount, -1, 0, 100),
              })
            }
            onMore={() =>
              updateScenario({
                discount: stepValue(state.practice.discount, 1, 0, 100),
              })
            }
            lessDisabled={state.practice.discount <= 0}
            moreDisabled={state.practice.discount >= 100}
          />
          <Stepper
            label="Manual adjustment"
            value={formatSignedMoney(state.practice.adjustment)}
            onLess={() =>
              updateScenario({
                adjustment: stepValue(state.practice.adjustment, -1, -100, 100),
              })
            }
            onMore={() =>
              updateScenario({
                adjustment: stepValue(state.practice.adjustment, 1, -100, 100),
              })
            }
            lessDisabled={state.practice.adjustment <= -100}
            moreDisabled={state.practice.adjustment >= 100}
          />
          <button
            type="button"
            className={
              state.practice.rush ? 'btn btn-primary' : 'btn btn-secondary'
            }
            aria-pressed={state.practice.rush}
            onClick={() => updateScenario({ rush: !state.practice.rush })}
          >
            {state.practice.rush ? 'Rush delivery on' : 'Rush delivery off'}
          </button>
          <div className="stack">
            <p className="stepper-label">Service area</p>
            {state.rules.serviceAreas.map((area) => (
              <button
                key={area.id}
                type="button"
                className={
                  state.practice.serviceAreaId === area.id
                    ? 'btn btn-primary'
                    : 'btn btn-secondary'
                }
                aria-pressed={state.practice.serviceAreaId === area.id}
                onClick={() => updateScenario({ serviceAreaId: area.id })}
              >
                {area.label} · {formatMoney(area.fee)}
              </button>
            ))}
          </div>
          <div className="stack">
            <p className="stepper-label">Shopping tier</p>
            {state.rules.shoppingTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                className={
                  state.practice.shoppingTierId === tier.id
                    ? 'btn btn-primary'
                    : 'btn btn-secondary'
                }
                aria-pressed={state.practice.shoppingTierId === tier.id}
                onClick={() => updateScenario({ shoppingTierId: tier.id })}
              >
                {tier.label} · {formatMoney(tier.fee)}
              </button>
            ))}
          </div>
        </div>
      </details>
      <details className="fold">
        <summary>Edit fee rules</summary>
        <div className="fold-body">
          <Stepper
            label="Delivery base fee"
            value={formatMoney(state.rules.baseFee)}
            onLess={() =>
              updateRule('baseFee', stepValue(state.rules.baseFee, -1, 0, 100))
            }
            onMore={() =>
              updateRule('baseFee', stepValue(state.rules.baseFee, 1, 0, 100))
            }
            lessDisabled={state.rules.baseFee <= 0}
            moreDisabled={state.rules.baseFee >= 100}
          />
          <Stepper
            label="Included miles"
            value={`${state.rules.includedMiles}`}
            onLess={() =>
              updateRule(
                'includedMiles',
                stepValue(state.rules.includedMiles, -1, 0, 20),
              )
            }
            onMore={() =>
              updateRule(
                'includedMiles',
                stepValue(state.rules.includedMiles, 1, 0, 20),
              )
            }
            lessDisabled={state.rules.includedMiles <= 0}
            moreDisabled={state.rules.includedMiles >= 20}
          />
          <Stepper
            label="Fee per extra mile"
            value={formatMoney(state.rules.perExtraMile)}
            onLess={() =>
              updateRule(
                'perExtraMile',
                stepValue(state.rules.perExtraMile, -0.25, 0, 20),
              )
            }
            onMore={() =>
              updateRule(
                'perExtraMile',
                stepValue(state.rules.perExtraMile, 0.25, 0, 20),
              )
            }
            lessDisabled={state.rules.perExtraMile <= 0}
            moreDisabled={state.rules.perExtraMile >= 20}
          />
          <Stepper
            label="Fee per additional stop"
            value={formatMoney(state.rules.extraStopFee)}
            onLess={() =>
              updateRule(
                'extraStopFee',
                stepValue(state.rules.extraStopFee, -1, 0, 40),
              )
            }
            onMore={() =>
              updateRule(
                'extraStopFee',
                stepValue(state.rules.extraStopFee, 1, 0, 40),
              )
            }
            lessDisabled={state.rules.extraStopFee <= 0}
            moreDisabled={state.rules.extraStopFee >= 40}
          />
          <Stepper
            label="Rush fee"
            value={formatMoney(state.rules.rushFee)}
            onLess={() =>
              updateRule('rushFee', stepValue(state.rules.rushFee, -1, 0, 50))
            }
            onMore={() =>
              updateRule('rushFee', stepValue(state.rules.rushFee, 1, 0, 50))
            }
            lessDisabled={state.rules.rushFee <= 0}
            moreDisabled={state.rules.rushFee >= 50}
          />
          <Stepper
            label="Waiting block minutes"
            value={`${state.rules.waitingBlockMinutes}`}
            onLess={() =>
              updateRule(
                'waitingBlockMinutes',
                stepValue(state.rules.waitingBlockMinutes, -5, 5, 60),
              )
            }
            onMore={() =>
              updateRule(
                'waitingBlockMinutes',
                stepValue(state.rules.waitingBlockMinutes, 5, 5, 60),
              )
            }
            lessDisabled={state.rules.waitingBlockMinutes <= 5}
            moreDisabled={state.rules.waitingBlockMinutes >= 60}
          />
          <Stepper
            label="Fee per waiting block"
            value={formatMoney(state.rules.waitingBlockFee)}
            onLess={() =>
              updateRule(
                'waitingBlockFee',
                stepValue(state.rules.waitingBlockFee, -1, 0, 40),
              )
            }
            onMore={() =>
              updateRule(
                'waitingBlockFee',
                stepValue(state.rules.waitingBlockFee, 1, 0, 40),
              )
            }
            lessDisabled={state.rules.waitingBlockFee <= 0}
            moreDisabled={state.rules.waitingBlockFee >= 40}
          />
          <Stepper
            label="Small-order threshold"
            value={formatMoney(state.rules.smallOrderThreshold)}
            onLess={() =>
              updateRule(
                'smallOrderThreshold',
                stepValue(state.rules.smallOrderThreshold, -5, 0, 200),
              )
            }
            onMore={() =>
              updateRule(
                'smallOrderThreshold',
                stepValue(state.rules.smallOrderThreshold, 5, 0, 200),
              )
            }
            lessDisabled={state.rules.smallOrderThreshold <= 0}
            moreDisabled={state.rules.smallOrderThreshold >= 200}
          />
          <Stepper
            label="Small-order fee"
            value={formatMoney(state.rules.smallOrderFee)}
            onLess={() =>
              updateRule(
                'smallOrderFee',
                stepValue(state.rules.smallOrderFee, -1, 0, 50),
              )
            }
            onMore={() =>
              updateRule(
                'smallOrderFee',
                stepValue(state.rules.smallOrderFee, 1, 0, 50),
              )
            }
            lessDisabled={state.rules.smallOrderFee <= 0}
            moreDisabled={state.rules.smallOrderFee >= 50}
          />
          <button
            type="button"
            className={
              state.rules.smallOrderEnabled
                ? 'btn btn-primary'
                : 'btn btn-secondary'
            }
            aria-pressed={state.rules.smallOrderEnabled}
            onClick={() =>
              updateRule('smallOrderEnabled', !state.rules.smallOrderEnabled)
            }
          >
            {state.rules.smallOrderEnabled
              ? 'Small-order fee on'
              : 'Small-order fee off'}
          </button>
          {state.rules.serviceAreas.map((area) => (
            <Stepper
              key={area.id}
              label={`${area.label} area fee`}
              value={formatMoney(area.fee)}
              onLess={() =>
                updateRule(
                  'serviceAreas',
                  state.rules.serviceAreas.map((item) =>
                    item.id === area.id
                      ? { ...item, fee: stepValue(item.fee, -1, 0, 50) }
                      : item,
                  ),
                )
              }
              onMore={() =>
                updateRule(
                  'serviceAreas',
                  state.rules.serviceAreas.map((item) =>
                    item.id === area.id
                      ? { ...item, fee: stepValue(item.fee, 1, 0, 50) }
                      : item,
                  ),
                )
              }
              lessDisabled={area.fee <= 0}
              moreDisabled={area.fee >= 50}
            />
          ))}
          {state.rules.shoppingTiers.map((tier) => (
            <Stepper
              key={tier.id}
              label={`${tier.label} fee`}
              value={formatMoney(tier.fee)}
              onLess={() =>
                updateRule(
                  'shoppingTiers',
                  state.rules.shoppingTiers.map((item) =>
                    item.id === tier.id
                      ? { ...item, fee: stepValue(item.fee, -1, 0, 80) }
                      : item,
                  ),
                )
              }
              onMore={() =>
                updateRule(
                  'shoppingTiers',
                  state.rules.shoppingTiers.map((item) =>
                    item.id === tier.id
                      ? { ...item, fee: stepValue(item.fee, 1, 0, 80) }
                      : item,
                  ),
                )
              }
              lessDisabled={tier.fee <= 0}
              moreDisabled={tier.fee >= 80}
            />
          ))}
        </div>
      </details>
      <details className="fold">
        <summary>Due before shopping</summary>
        <div className="fold-body">
          <p className="card-meta">
            Choose which fictional service fees are due before shopping.
            Merchandise is never included.
          </p>
          {(
            [
              ['base', 'Delivery base fee'],
              ['mileage', 'Mileage fee'],
              ['serviceArea', 'Service-area fee'],
              ['extraStops', 'Additional stops'],
              ['rush', 'Rush delivery'],
              ['waiting', 'Waiting time'],
              ['shopping', 'Shopping fee'],
              ['smallOrder', 'Small-order fee'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={
                state.rules.dueBeforeShopping[key]
                  ? 'btn btn-primary'
                  : 'btn btn-secondary'
              }
              aria-pressed={state.rules.dueBeforeShopping[key]}
              onClick={() =>
                updateRule('dueBeforeShopping', {
                  ...state.rules.dueBeforeShopping,
                  [key]: !state.rules.dueBeforeShopping[key],
                })
              }
            >
              {label}: {state.rules.dueBeforeShopping[key] ? 'Due now' : 'Later'}
            </button>
          ))}
        </div>
      </details>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          armDraft()
          onOpen('orders')
        }}
      >
        Start a sample order with this quote
      </button>
    </div>
  )
}
