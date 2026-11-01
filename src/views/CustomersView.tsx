import { useState } from 'react'
import { sampleCustomers } from '../sample/data'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'

export function CustomersView() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="stack">
      <SectionIntro title="Customers">
        A practice customer list. These people, phones, and addresses are
        invented.
      </SectionIntro>
      <Notice>
        No customer accounts exist in Phase 1. This list cannot reach your live
        website.
      </Notice>
      <ul className="card-list">
        {sampleCustomers.map((customer) => {
          const expanded = openId === customer.id

          return (
            <li key={customer.id} className="card">
              <p className="card-title">{customer.name}</p>
              <p className="card-meta">{customer.phone}</p>
              <p className="card-meta">
                {customer.area} · Last sample order {customer.lastOrderId}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                aria-expanded={expanded}
                onClick={() => setOpenId(expanded ? null : customer.id)}
              >
                {expanded ? 'Hide sample details' : 'Show sample details'}
              </button>
              {expanded ? (
                <div className="card-body">
                  <p>{customer.address}</p>
                  <p>{customer.note}</p>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
