import { moveItem } from '../lib/moveItem'
import type { PracticeOrder } from './types'

export function routeForDate(
  orders: readonly PracticeOrder[],
  date: string,
  savedIds: readonly string[] = [],
): PracticeOrder[] {
  const visible = orders.filter(
    (order) => order.requestedDate === date && order.status !== 'Canceled',
  )
  const byId = new Map(visible.map((order) => [order.id, order]))
  const ranked = savedIds
    .map((id) => byId.get(id))
    .filter((order): order is PracticeOrder => order !== undefined)
  const rankedIds = new Set(ranked.map((order) => order.id))
  const rest = visible.filter((order) => !rankedIds.has(order.id))

  return [...ranked, ...rest]
}

export function reorderRoute(
  orders: readonly PracticeOrder[],
  date: string,
  savedIds: readonly string[],
  index: number,
  direction: -1 | 1,
): string[] {
  const visible = routeForDate(orders, date, savedIds)
  return moveItem(
    visible.map((order) => order.id),
    index,
    direction,
  )
}
