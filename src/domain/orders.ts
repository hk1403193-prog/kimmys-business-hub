import type {
  OrderDraft,
  OrderListFilter,
  PracticeOrder,
  PracticeStatus,
  QuoteScenario,
} from './types'
import { activePracticeStatuses, practiceStatuses } from './types'

export function linesFromText(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export function nextStatus(status: PracticeStatus): PracticeStatus | null {
  const flow: PracticeStatus[] = practiceStatuses.filter(
    (item) => item !== 'Canceled',
  )
  const index = flow.indexOf(status)
  if (index < 0 || index >= flow.length - 1) {
    return null
  }

  return flow[index + 1]
}

export function matchesListFilter(
  order: PracticeOrder,
  filter: OrderListFilter,
): boolean {
  if (filter === 'All') {
    return true
  }

  if (filter === 'New') {
    return order.status === 'New'
  }

  if (filter === 'Completed') {
    return order.status === 'Completed'
  }

  if (filter === 'Canceled') {
    return order.status === 'Canceled'
  }

  return activePracticeStatuses.includes(order.status)
}

export function searchOrders(
  orders: readonly PracticeOrder[],
  query: string,
  filter: OrderListFilter,
): PracticeOrder[] {
  const needle = query.trim().toLowerCase()

  return orders.filter((order) => {
    if (!matchesListFilter(order, filter)) {
      return false
    }

    if (!needle) {
      return true
    }

    const haystack = [
      order.id,
      order.customer,
      order.serviceType,
      order.instructions,
      order.pickupPlace,
      order.deliveryPlace,
      ...order.shoppingList,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(needle)
  })
}

export function scenarioFromDraft(draft: OrderDraft): QuoteScenario {
  const shoppingList = linesFromText(draft.shoppingText)

  return {
    ...draft.scenario,
    itemCount:
      shoppingList.length > 0
        ? shoppingList.length
        : Math.max(0, Math.round(draft.scenario.itemCount)),
  }
}

function nextOrderId(orders: readonly PracticeOrder[]): string {
  const numbers = orders.map((item) => Number(item.id.replace(/\D/g, '')))
  const max = numbers.reduce(
    (highest, value) => (Number.isFinite(value) ? Math.max(highest, value) : highest),
    1000,
  )
  return `S-${max + 1}`
}

function areaLabel(scenario: QuoteScenario, fallback: string): string {
  if (scenario.serviceAreaId === 'surrounding') {
    return 'Sample Hills'
  }

  if (scenario.serviceAreaId === 'farther') {
    return 'Farther practice area'
  }

  return fallback || 'Practice Town'
}

export function createPracticeOrder(
  orders: readonly PracticeOrder[],
  draft: OrderDraft,
  at: string,
): PracticeOrder {
  const id = nextOrderId(orders)
  const scenario = scenarioFromDraft(draft)
  const customer = draft.customer.trim() || 'Sample customer'

  return {
    id,
    customer,
    phone: draft.phone.trim() || '(555) 010-0100',
    area: areaLabel(scenario, 'Practice Town'),
    address: draft.deliveryPlace.trim() || '100 Preview Lane, Practice Town',
    serviceType: draft.serviceType,
    priority: draft.priority,
    status: 'New',
    requestedDate: draft.requestedDate,
    deliveryWindow: draft.deliveryWindow,
    pickupWindow: draft.pickupWindow,
    pickupPlace: draft.pickupPlace.trim() || 'Sample pickup',
    deliveryPlace: draft.deliveryPlace.trim() || 'Sample delivery',
    shoppingList: linesFromText(draft.shoppingText),
    instructions: draft.instructions.trim(),
    scenario,
    timeline: [
      {
        id: `${id}-1`,
        status: 'New',
        at,
        note: 'Fictional sample created.',
      },
    ],
  }
}

export function applyOrderDraft(
  source: PracticeOrder,
  draft: OrderDraft,
  at: string,
): PracticeOrder {
  const scenario = scenarioFromDraft(draft)

  return {
    ...source,
    customer: draft.customer.trim() || 'Sample customer',
    phone: draft.phone.trim() || source.phone,
    area: areaLabel(scenario, source.area),
    address: draft.deliveryPlace.trim() || source.address,
    serviceType: draft.serviceType,
    priority: draft.priority,
    requestedDate: draft.requestedDate,
    deliveryWindow: draft.deliveryWindow,
    pickupWindow: draft.pickupWindow,
    pickupPlace: draft.pickupPlace.trim() || source.pickupPlace,
    deliveryPlace: draft.deliveryPlace.trim() || source.deliveryPlace,
    shoppingList: linesFromText(draft.shoppingText),
    instructions: draft.instructions.trim(),
    scenario,
    timeline: [
      ...source.timeline,
      {
        id: `${source.id}-${source.timeline.length + 1}`,
        status: source.status,
        at,
        note: 'Sample details updated.',
      },
    ],
  }
}

export function applyStatus(
  source: PracticeOrder,
  status: PracticeStatus,
  at: string,
): PracticeOrder {
  if (source.status === status) {
    return source
  }

  const note =
    status === 'Completed'
      ? 'Marked completed in this practice session.'
      : status === 'Canceled'
        ? 'Marked canceled in this practice session.'
        : `Status changed to ${status}.`

  return {
    ...source,
    status,
    timeline: [
      ...source.timeline,
      {
        id: `${source.id}-${source.timeline.length + 1}`,
        status,
        at,
        note,
      },
    ],
  }
}
