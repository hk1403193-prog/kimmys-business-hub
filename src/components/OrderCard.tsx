import { useState } from 'react'
import { formatPracticeDate, formatWhen } from '../domain/dates'
import { draftFromOrder } from '../domain/seed'
import { nextStatus } from '../domain/orders'
import type {
  OrderDraft,
  PracticeOrder,
  PracticeStatus,
  PricingRules,
  ServiceQuote,
} from '../domain/types'
import { practiceStatuses } from '../domain/types'
import type { Workload } from '../domain/workload'
import type { SampleToggle } from '../sample/types'
import { formatMoney } from '../lib/money'
import { OrderForm } from './OrderForm'
import { PracticeStatusPill, statusMeaning } from './PracticeStatusPill'
import { QuoteBreakdown } from './QuoteBreakdown'

type OrderCardProps = {
  order: PracticeOrder
  quote: ServiceQuote
  workload: Workload
  today: string
  rules: PricingRules
  services: SampleToggle[]
  onSave: (draft: OrderDraft) => void
  onStatus: (status: PracticeStatus) => void
}

export function OrderCard({
  order,
  quote,
  workload,
  today,
  rules,
  services,
  onSave,
  onStatus,
}: OrderCardProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<OrderDraft>(() => draftFromOrder(order))
  const upcoming = nextStatus(order.status)

  return (
    <li className="card">
      <div className="card-top">
        <p className="card-title">
          {order.id} · {order.customer}
        </p>
        <PracticeStatusPill status={order.status} />
      </div>
      <p className="card-meta">
        {order.serviceType} · {order.priority} priority
      </p>
      <p className="card-meta">
        {formatPracticeDate(order.requestedDate, today)} · {order.deliveryWindow}
      </p>
      <p className="card-amount">{formatMoney(quote.earnings)} service fee</p>
      {order.status === 'Delivered' ||
      order.status === 'Completed' ||
      order.status === 'Canceled' ? (
        <p className="card-meta">{statusMeaning(order.status)}</p>
      ) : null}
      <button
        type="button"
        className="btn btn-secondary"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Hide sample details' : 'Show sample details'}
      </button>
      {open ? (
        <div className="stack">
          <p className="card-body">
            Pickup {order.pickupWindow} · {order.pickupPlace}
          </p>
          <p className="card-body">
            Delivery {order.deliveryWindow} · {order.deliveryPlace}
          </p>
          <p className="card-body">
            {workload.points} workload points · {workload.minutes} planning
            minutes
          </p>
          <div>
            <p className="stepper-label">Shopping list</p>
            {order.shoppingList.length > 0 ? (
              <ul className="plain-list">
                {order.shoppingList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="card-meta">No shopping items on this sample.</p>
            )}
          </div>
          <p className="card-body">
            {order.instructions || 'No special instructions.'}
          </p>
          <QuoteBreakdown quote={quote} />
          <details className="fold">
            <summary>Status history</summary>
            <ol className="timeline">
              {order.timeline.map((entry) => (
                <li key={entry.id}>
                  <p className="card-title">{entry.status}</p>
                  <p className="card-meta">{formatWhen(entry.at)}</p>
                  <p className="card-body">{entry.note}</p>
                </li>
              ))}
            </ol>
          </details>
          <p className="card-meta">
            Advance moves one step. Delivered is the physical handoff and
            leaves the order open. Mark completed closes it and removes it
            from upcoming deliveries.
          </p>
          <div className="stack">
            {upcoming ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onStatus(upcoming)}
              >
                Advance to {upcoming}
              </button>
            ) : null}
            {order.status !== 'Completed' ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onStatus('Completed')}
              >
                Mark completed
              </button>
            ) : null}
            {order.status !== 'Canceled' ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onStatus('Canceled')}
              >
                Mark canceled
              </button>
            ) : null}
          </div>
          <details className="fold">
            <summary>Choose any status</summary>
            <div className="fold-body">
              {practiceStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={
                    order.status === status ? 'btn btn-primary' : 'btn btn-secondary'
                  }
                  aria-pressed={order.status === status}
                  onClick={() => onStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </details>
          {editing ? (
            <OrderForm
              draft={draft}
              rules={rules}
              services={services}
              submitLabel="Save sample order"
              onChange={setDraft}
              onCancel={() => setEditing(false)}
              onSubmit={() => {
                onSave(draft)
                setEditing(false)
              }}
            />
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setDraft(draftFromOrder(order))
                setEditing(true)
              }}
            >
              Edit sample order
            </button>
          )}
        </div>
      ) : null}
    </li>
  )
}
