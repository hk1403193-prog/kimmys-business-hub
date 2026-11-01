import { useState } from 'react'
import { sampleOrders } from '../sample/data'
import { formatMoney } from '../lib/money'
import { filterOrders, orderFilters, type OrderFilter } from '../lib/orders'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'
import { StatusPill } from '../components/StatusPill'

export function OrdersView() {
  const [filter, setFilter] = useState<OrderFilter>('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const visible = filterOrders(sampleOrders, filter)

  return (
    <div className="stack">
      <SectionIntro title="Orders">
        Incoming and active practice orders. Filters only change what you see
        on this screen.
      </SectionIntro>
      <Notice>These six records are fictional. They are not saved.</Notice>
      <div className="filters" role="group" aria-label="Filter sample orders">
        {orderFilters.map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? 'chip chip-on' : 'chip'}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <ul className="card-list">
        {visible.map((order) => {
          const expanded = openId === order.id

          return (
            <li key={order.id} className="card">
              <div className="card-top">
                <p className="card-title">
                  {order.id} · {order.customer}
                </p>
                <StatusPill status={order.status} />
              </div>
              <p className="card-meta">
                {order.kind} · {order.window}
              </p>
              <p className="card-amount">{formatMoney(order.total)} sample</p>
              <button
                type="button"
                className="btn btn-secondary"
                aria-expanded={expanded}
                onClick={() => setOpenId(expanded ? null : order.id)}
              >
                {expanded ? 'Hide sample details' : 'Show sample details'}
              </button>
              {expanded ? <p className="card-body">{order.summary}</p> : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
