import { useState } from 'react'
import { useOperations } from '../state/OperationsProvider'
import { Notice } from '../components/Notice'
import { PracticeStatusPill } from '../components/PracticeStatusPill'
import { SectionIntro } from '../components/SectionIntro'
import type { PracticeOrder } from '../domain/types'

export function CustomersView() {
  const { state } = useOperations()
  const [openName, setOpenName] = useState<string | null>(null)
  const customers = groupCustomers(state.orders)

  return (
    <div className="stack">
      <SectionIntro title="Customers">
        Practice customers come from the fictional orders. Real customer
        records are not stored.
      </SectionIntro>
      <Notice>
        No customer accounts exist. This list cannot reach your live website.
      </Notice>
      <ul className="card-list">
        {customers.map((customer) => {
          const expanded = openName === customer.name

          return (
            <li key={customer.name} className="card">
              <p className="card-title">{customer.name}</p>
              <p className="card-meta">{customer.phone}</p>
              <p className="card-meta">
                {customer.area} · {customer.orders.length} sample orders
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                aria-expanded={expanded}
                onClick={() => setOpenName(expanded ? null : customer.name)}
              >
                {expanded ? 'Hide sample details' : 'Show sample details'}
              </button>
              {expanded ? (
                <div className="card-body">
                  <p>{customer.address}</p>
                  {customer.orders.map((order) => (
                    <p key={order.id} className="card-meta">
                      {order.id} · {order.serviceType}{' '}
                      <PracticeStatusPill status={order.status} />
                    </p>
                  ))}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function groupCustomers(orders: readonly PracticeOrder[]) {
  const groups = new Map<
    string,
    { name: string; phone: string; area: string; address: string; orders: PracticeOrder[] }
  >()

  for (const order of orders) {
    const current = groups.get(order.customer)
    if (current) {
      current.orders.push(order)
      continue
    }

    groups.set(order.customer, {
      name: order.customer,
      phone: order.phone,
      area: order.area,
      address: order.address,
      orders: [order],
    })
  }

  return [...groups.values()]
}
