import { stepValue } from '../lib/quote'
import { formatMoney, formatSignedMoney } from '../lib/money'
import type { OrderDraft, PricingRules } from '../domain/types'
import { deliveryWindows, type Priority } from '../domain/types'
import type { SampleToggle } from '../sample/types'
import { Stepper } from './Stepper'

type OrderFormProps = {
  draft: OrderDraft
  rules: PricingRules
  services: SampleToggle[]
  submitLabel: string
  onChange: (draft: OrderDraft) => void
  onSubmit: () => void
  onCancel: () => void
}

const priorities: Priority[] = ['Low', 'Normal', 'High']

export function OrderForm({
  draft,
  rules,
  services,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const serviceLabels = serviceChoices(services, draft.serviceType)

  function updateScenario(patch: Partial<OrderDraft['scenario']>) {
    onChange({ ...draft, scenario: { ...draft.scenario, ...patch } })
  }

  return (
    <form
      className="stack"
      autoComplete="off"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <label className="field">
        <span>Fictional customer</span>
        <input
          value={draft.customer}
          autoComplete="off"
          onChange={(event) =>
            onChange({ ...draft, customer: event.target.value })
          }
        />
      </label>
      <label className="field">
        <span>Practice phone</span>
        <input
          value={draft.phone}
          inputMode="tel"
          autoComplete="off"
          onChange={(event) => onChange({ ...draft, phone: event.target.value })}
        />
      </label>
      <label className="field">
        <span>Service</span>
        <select
          value={draft.serviceType}
          onChange={(event) =>
            onChange({ ...draft, serviceType: event.target.value })
          }
        >
          {serviceLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="stack">
        <p className="stepper-label">Priority</p>
        <div className="filters">
          {priorities.map((priority) => (
            <button
              key={priority}
              type="button"
              className={
                draft.priority === priority ? 'chip chip-on' : 'chip'
              }
              aria-pressed={draft.priority === priority}
              onClick={() => onChange({ ...draft, priority })}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>
      <label className="field">
        <span>Requested date</span>
        <input
          type="date"
          value={draft.requestedDate}
          onChange={(event) =>
            onChange({ ...draft, requestedDate: event.target.value })
          }
        />
      </label>
      <label className="field">
        <span>Delivery window</span>
        <select
          value={draft.deliveryWindow}
          onChange={(event) =>
            onChange({ ...draft, deliveryWindow: event.target.value })
          }
        >
          {deliveryWindows.map((window) => (
            <option key={window} value={window}>
              {window}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Pickup window</span>
        <select
          value={draft.pickupWindow}
          onChange={(event) =>
            onChange({ ...draft, pickupWindow: event.target.value })
          }
        >
          {deliveryWindows.map((window) => (
            <option key={window} value={window}>
              {window}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Pickup place</span>
        <input
          value={draft.pickupPlace}
          autoComplete="off"
          onChange={(event) =>
            onChange({ ...draft, pickupPlace: event.target.value })
          }
        />
      </label>
      <label className="field">
        <span>Delivery place</span>
        <input
          value={draft.deliveryPlace}
          autoComplete="off"
          onChange={(event) =>
            onChange({ ...draft, deliveryPlace: event.target.value })
          }
        />
      </label>
      <label className="field">
        <span>Shopping list</span>
        <textarea
          value={draft.shoppingText}
          rows={4}
          onChange={(event) =>
            onChange({ ...draft, shoppingText: event.target.value })
          }
        />
      </label>
      <label className="field">
        <span>Special instructions</span>
        <textarea
          value={draft.instructions}
          rows={3}
          onChange={(event) =>
            onChange({ ...draft, instructions: event.target.value })
          }
        />
      </label>
      <details className="fold">
        <summary>Practice quote for this order</summary>
        <div className="fold-body">
          <Stepper
            label="Merchandise estimate"
            value={formatMoney(draft.scenario.merchandiseTotal)}
            onLess={() =>
              updateScenario({
                merchandiseTotal: stepValue(
                  draft.scenario.merchandiseTotal,
                  -5,
                  0,
                  500,
                ),
              })
            }
            onMore={() =>
              updateScenario({
                merchandiseTotal: stepValue(
                  draft.scenario.merchandiseTotal,
                  5,
                  0,
                  500,
                ),
              })
            }
            lessDisabled={draft.scenario.merchandiseTotal <= 0}
            moreDisabled={draft.scenario.merchandiseTotal >= 500}
          />
          <Stepper
            label="Miles"
            value={`${draft.scenario.miles}`}
            onLess={() =>
              updateScenario({
                miles: stepValue(draft.scenario.miles, -0.5, 0, 40),
              })
            }
            onMore={() =>
              updateScenario({
                miles: stepValue(draft.scenario.miles, 0.5, 0, 40),
              })
            }
            lessDisabled={draft.scenario.miles <= 0}
            moreDisabled={draft.scenario.miles >= 40}
          />
          <Stepper
            label="Additional stops"
            value={`${draft.scenario.extraStops}`}
            onLess={() =>
              updateScenario({
                extraStops: stepValue(draft.scenario.extraStops, -1, 0, 6),
              })
            }
            onMore={() =>
              updateScenario({
                extraStops: stepValue(draft.scenario.extraStops, 1, 0, 6),
              })
            }
            lessDisabled={draft.scenario.extraStops <= 0}
            moreDisabled={draft.scenario.extraStops >= 6}
          />
          <Stepper
            label="Waiting minutes"
            value={`${draft.scenario.waitingMinutes}`}
            onLess={() =>
              updateScenario({
                waitingMinutes: stepValue(
                  draft.scenario.waitingMinutes,
                  -15,
                  0,
                  180,
                ),
              })
            }
            onMore={() =>
              updateScenario({
                waitingMinutes: stepValue(
                  draft.scenario.waitingMinutes,
                  15,
                  0,
                  180,
                ),
              })
            }
            lessDisabled={draft.scenario.waitingMinutes <= 0}
            moreDisabled={draft.scenario.waitingMinutes >= 180}
          />
          <Stepper
            label="Discount"
            value={formatMoney(draft.scenario.discount)}
            onLess={() =>
              updateScenario({
                discount: stepValue(draft.scenario.discount, -1, 0, 100),
              })
            }
            onMore={() =>
              updateScenario({
                discount: stepValue(draft.scenario.discount, 1, 0, 100),
              })
            }
            lessDisabled={draft.scenario.discount <= 0}
            moreDisabled={draft.scenario.discount >= 100}
          />
          <Stepper
            label="Manual adjustment"
            value={formatSignedMoney(draft.scenario.adjustment)}
            onLess={() =>
              updateScenario({
                adjustment: stepValue(draft.scenario.adjustment, -1, -100, 100),
              })
            }
            onMore={() =>
              updateScenario({
                adjustment: stepValue(draft.scenario.adjustment, 1, -100, 100),
              })
            }
            lessDisabled={draft.scenario.adjustment <= -100}
            moreDisabled={draft.scenario.adjustment >= 100}
          />
          <div className="stack">
            <p className="stepper-label">Service area</p>
            {rules.serviceAreas.map((area) => (
              <button
                key={area.id}
                type="button"
                className={
                  draft.scenario.serviceAreaId === area.id
                    ? 'btn btn-primary'
                    : 'btn btn-secondary'
                }
                aria-pressed={draft.scenario.serviceAreaId === area.id}
                onClick={() => updateScenario({ serviceAreaId: area.id })}
              >
                {area.label} · {formatMoney(area.fee)}
              </button>
            ))}
          </div>
          <div className="stack">
            <p className="stepper-label">Shopping tier</p>
            {rules.shoppingTiers.map((tier) => (
              <button
                key={tier.id}
                type="button"
                className={
                  draft.scenario.shoppingTierId === tier.id
                    ? 'btn btn-primary'
                    : 'btn btn-secondary'
                }
                aria-pressed={draft.scenario.shoppingTierId === tier.id}
                onClick={() => updateScenario({ shoppingTierId: tier.id })}
              >
                {tier.label} · {formatMoney(tier.fee)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={
              draft.scenario.rush ? 'btn btn-primary' : 'btn btn-secondary'
            }
            aria-pressed={draft.scenario.rush}
            onClick={() => updateScenario({ rush: !draft.scenario.rush })}
          >
            {draft.scenario.rush ? 'Rush delivery on' : 'Rush delivery off'}
          </button>
        </div>
      </details>
      <button type="submit" className="btn btn-primary">
        {submitLabel}
      </button>
      <button type="button" className="btn btn-secondary" onClick={onCancel}>
        Close
      </button>
    </form>
  )
}

function serviceChoices(services: SampleToggle[], current: string): string[] {
  const enabled = services.filter((item) => item.on).map((item) => item.label)
  if (current && !enabled.includes(current)) {
    return [current, ...enabled]
  }

  return enabled.length > 0 ? enabled : services.map((item) => item.label)
}
