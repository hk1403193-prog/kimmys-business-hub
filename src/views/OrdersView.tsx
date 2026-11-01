import { useEffect, useState } from 'react'
import { calculateServiceQuote } from '../domain/pricing'
import { searchOrders } from '../domain/orders'
import { blankDraft } from '../domain/seed'
import type { OrderDraft, OrderListFilter } from '../domain/types'
import { orderListFilters } from '../domain/types'
import { calculateWorkload } from '../domain/workload'
import { useOperations } from '../state/OperationsProvider'
import { Notice } from '../components/Notice'
import { OrderCard } from '../components/OrderCard'
import { OrderForm } from '../components/OrderForm'
import { SectionIntro } from '../components/SectionIntro'
import { StatusGuide } from '../components/StatusGuide'

export function OrdersView() {
  const {
    state,
    createOrder,
    updateOrder,
    setStatus,
    clearDraft,
  } = useOperations()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<OrderListFilter>('All')
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<OrderDraft>(() =>
    blankDraft(state.today, state.practice),
  )
  const visible = searchOrders(state.orders, query, filter)

  useEffect(() => {
    if (!state.draftArmed) {
      return
    }

    setDraft(blankDraft(state.today, state.practice))
    setCreating(true)
    clearDraft()
  }, [state.draftArmed, state.today, state.practice, clearDraft])

  return (
    <div className="stack">
      <SectionIntro title="Orders">
        Create and update fictional orders. Status changes, lists, and pickup
        details stay in this practice session until you refresh.
      </SectionIntro>
      <Notice>
        Every name and address here is invented. Nothing is sent to your live
        website.
      </Notice>
      <StatusGuide />
      <label className="field">
        <span>Search sample orders</span>
        <input
          value={query}
          autoComplete="off"
          placeholder="Name, order number, or item"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="filters" role="group" aria-label="Filter sample orders">
        {orderListFilters.map((item) => (
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
      {creating ? (
        <section className="card stack">
          <h2>New sample order</h2>
          <OrderForm
            draft={draft}
            rules={state.rules}
            services={state.services}
            submitLabel="Create sample order"
            onChange={setDraft}
            onCancel={() => setCreating(false)}
            onSubmit={() => {
              createOrder(draft)
              setCreating(false)
              setDraft(blankDraft(state.today, state.practice))
            }}
          />
        </section>
      ) : (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setDraft(blankDraft(state.today, state.practice))
            setCreating(true)
          }}
        >
          Create sample order
        </button>
      )}
      {visible.length === 0 ? (
        <p className="card-meta">No sample orders match.</p>
      ) : (
        <ul className="card-list">
          {visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              quote={calculateServiceQuote(state.rules, order.scenario)}
              workload={calculateWorkload(state.workloadRules, order.scenario)}
              today={state.today}
              rules={state.rules}
              services={state.services}
              onSave={(next) => updateOrder(order.id, next)}
              onStatus={(status) => setStatus(order.id, status)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
