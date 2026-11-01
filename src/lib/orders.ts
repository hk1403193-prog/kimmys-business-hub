import type { OrderStatus, SampleOrder } from '../sample/types'
import { roundMoney } from './money'

export const orderFilters = ['All', 'New', 'Active', 'Done'] as const

export type OrderFilter = (typeof orderFilters)[number]

const activeStatuses: readonly OrderStatus[] = [
  'Accepted',
  'Shopping',
  'Out for delivery',
]

export function filterOrders(
  orders: readonly SampleOrder[],
  filter: OrderFilter,
): SampleOrder[] {
  if (filter === 'New') {
    return orders.filter((order) => order.status === 'New')
  }

  if (filter === 'Active') {
    return orders.filter((order) => activeStatuses.includes(order.status))
  }

  if (filter === 'Done') {
    return orders.filter((order) => order.status === 'Delivered')
  }

  return [...orders]
}

export function summarizeOrders(orders: readonly SampleOrder[]) {
  const openOrders = orders.filter((order) => order.status !== 'Delivered')

  return {
    total: orders.length,
    fresh: orders.filter((order) => order.status === 'New').length,
    active: orders.filter((order) => activeStatuses.includes(order.status))
      .length,
    open: openOrders.length,
    expected: roundMoney(
      openOrders.reduce((sum, order) => sum + order.total, 0),
    ),
  }
}

export function statusClass(status: OrderStatus): string {
  switch (status) {
    case 'New':
      return 'pill-new'
    case 'Accepted':
      return 'pill-accepted'
    case 'Shopping':
      return 'pill-shopping'
    case 'Out for delivery':
      return 'pill-out'
    case 'Delivered':
      return 'pill-delivered'
  }
}
