import type { OrderStatus } from '../sample/types'
import { statusClass } from '../lib/orders'

export function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`pill ${statusClass(status)}`}>{status}</span>
}
