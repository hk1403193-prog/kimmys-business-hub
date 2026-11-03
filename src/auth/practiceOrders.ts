import { requireOwnerProof, type OwnerProof } from './access'
import {
  PRACTICE_FICTION,
  fictionLabel,
  fictionalOrderProblem,
  isPracticeUserId,
  orderIsClosed,
} from '../domain/fictional'
import {
  deliveryWindows,
  practiceStatuses,
  type PracticeOrder,
  type PracticeStatus,
  type Priority,
  type QuoteScenario,
  type TimelineEntry,
} from '../domain/types'

export const PRACTICE_ORDERS_TABLE = 'practice_orders'

const PRACTICE_ORDER_COLUMNS =
  'id, owner_id, fiction_label, customer_label, phone_label, status, closed, payload, updated_at'

export type PracticeQueryResult = {
  data: unknown[] | null
  error: { message: string; code?: string } | null
}

export type PracticeOrderRecord = {
  id: string
  owner_id: string
  fiction_label: string
  customer_label: string
  phone_label: string
  status: PracticeStatus
  closed: boolean
  payload: PracticeOrder & { fiction: typeof PRACTICE_FICTION }
  updated_at: string
}

export type PracticeOrdersClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => {
        order: (
          column: string,
          options: { ascending: boolean },
        ) => {
          limit: (count: number) => PromiseLike<PracticeQueryResult>
        }
      }
    }
    insert: (row: PracticeOrderRecord) => {
      select: (columns: string) => PromiseLike<PracticeQueryResult>
    }
    update: (row: PracticeOrderRecord) => {
      eq: (
        column: string,
        value: string,
      ) => {
        select: (columns: string) => PromiseLike<PracticeQueryResult>
      }
    }
  }
}

export type PracticeOrdersLoad =
  | { status: 'refused' }
  | { status: 'denied' }
  | { status: 'not-installed' }
  | { status: 'unavailable' }
  | { status: 'ok'; orders: PracticeOrder[]; withheld: number }

export type PracticeOrdersWrite =
  | { status: 'refused' }
  | { status: 'denied' }
  | { status: 'not-installed' }
  | { status: 'unavailable' }
  | { status: 'conflict' }
  | { status: 'missing' }
  | { status: 'invalid'; message: string }
  | { status: 'ok'; order: PracticeOrder }

const LIST_LIMIT = 100

function databaseDenied(error: { message: string; code?: string }): boolean {
  const message = error.message.toLowerCase()
  const code = error.code ?? ''
  return (
    code === '42501' ||
    code === 'PGRST301' ||
    message.includes('permission') ||
    message.includes('not authorized') ||
    message.includes('jwt') ||
    message.includes('row-level security') ||
    message.includes('rls')
  )
}

function tableMissing(error: { message: string; code?: string }): boolean {
  const message = error.message.toLowerCase()
  const code = error.code ?? ''
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  )
}

function proofOrNull(proof: OwnerProof | null): OwnerProof | null {
  try {
    const checked = requireOwnerProof(proof)
    if (!isPracticeUserId(checked.userId)) return null
    return checked
  } catch {
    return null
  }
}

export function practiceOrderFailureMessage(result: {
  status: string
  message?: string
}): string {
  switch (result.status) {
    case 'refused':
      return 'This request was refused before it was sent. Owner verification is required.'
    case 'denied':
      return 'The practice database refused this request.'
    case 'not-installed':
      return 'Saved practice orders are not installed yet. Run the Phase 3.1 SQL in the practice project only.'
    case 'conflict':
      return 'That practice order number is already saved. Reload the page and try again.'
    case 'missing':
      return 'That practice order is not saved for this owner. Reload the page and try again.'
    case 'invalid':
      return result.message ?? 'That practice order is not fictional, so it was not saved.'
    default:
      return 'Practice orders could not be reached. Check the connection and try again.'
  }
}

function classifyFailure(error: { message: string; code?: string }): PracticeOrdersWrite {
  if (databaseDenied(error)) return { status: 'denied' }
  if (tableMissing(error)) return { status: 'not-installed' }
  const message = error.message.toLowerCase()
  if (error.code === '23505' || message.includes('duplicate')) return { status: 'conflict' }
  if (error.code === '23514' || message.includes('check constraint')) {
    return {
      status: 'invalid',
      message: 'The practice database refused this order because it is not fictional.',
    }
  }
  return { status: 'unavailable' }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function isPriority(value: unknown): value is Priority {
  return value === 'Low' || value === 'Normal' || value === 'High'
}

function isStatus(value: unknown): value is PracticeStatus {
  return typeof value === 'string' && practiceStatuses.includes(value as PracticeStatus)
}

function isWindow(value: unknown): value is PracticeOrder['deliveryWindow'] {
  return typeof value === 'string' && deliveryWindows.includes(value as (typeof deliveryWindows)[number])
}

function readScenario(value: unknown): QuoteScenario | null {
  if (!isRecord(value)) return null
  const scenario: QuoteScenario = {
    miles: Number(value.miles),
    serviceAreaId: String(value.serviceAreaId ?? ''),
    extraStops: Number(value.extraStops),
    rush: value.rush === true,
    waitingMinutes: Number(value.waitingMinutes),
    shoppingTierId: String(value.shoppingTierId ?? ''),
    itemCount: Number(value.itemCount),
    merchandiseTotal: Number(value.merchandiseTotal),
    discount: Number(value.discount),
    adjustment: Number(value.adjustment),
  }
  if (typeof value.rush !== 'boolean') return null
  return scenario
}

function readTimeline(value: unknown): TimelineEntry[] | null {
  if (!Array.isArray(value)) return null
  const entries: TimelineEntry[] = []
  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.at !== 'string') return null
    if (typeof item.note !== 'string' || !isStatus(item.status)) return null
    entries.push({ id: item.id, status: item.status, at: item.at, note: item.note })
  }
  return entries
}

export function orderFromStoredPayload(value: unknown): PracticeOrder | null {
  if (!isRecord(value)) return null
  if (value.fiction !== PRACTICE_FICTION) return null
  if (typeof value.id !== 'string' || typeof value.customer !== 'string') return null
  if (typeof value.phone !== 'string' || typeof value.area !== 'string') return null
  if (typeof value.address !== 'string' || typeof value.serviceType !== 'string') return null
  if (!isPriority(value.priority) || !isStatus(value.status)) return null
  if (typeof value.requestedDate !== 'string' || !isWindow(value.deliveryWindow)) return null
  if (!isWindow(value.pickupWindow)) return null
  if (typeof value.pickupPlace !== 'string' || typeof value.deliveryPlace !== 'string') return null
  if (typeof value.instructions !== 'string' || !Array.isArray(value.shoppingList)) return null
  if (!value.shoppingList.every((item) => typeof item === 'string')) return null
  const scenario = readScenario(value.scenario)
  const timeline = readTimeline(value.timeline)
  if (!scenario || !timeline) return null

  const order: PracticeOrder = {
    id: value.id,
    customer: value.customer,
    phone: value.phone,
    area: value.area,
    address: value.address,
    serviceType: value.serviceType,
    priority: value.priority,
    status: value.status,
    requestedDate: value.requestedDate,
    deliveryWindow: value.deliveryWindow,
    pickupWindow: value.pickupWindow,
    pickupPlace: value.pickupPlace,
    deliveryPlace: value.deliveryPlace,
    shoppingList: value.shoppingList,
    instructions: value.instructions,
    scenario,
    timeline,
  }
  if (fictionalOrderProblem(order)) return null
  return order
}

function rowToOrder(row: unknown, ownerId: string): PracticeOrder | null {
  if (!isRecord(row)) return null
  if (row.owner_id !== ownerId) return null
  if (typeof row.fiction_label !== 'string' || !row.fiction_label.startsWith('FICTIONAL:')) return null
  if (typeof row.id !== 'string' || typeof row.customer_label !== 'string') return null
  if (typeof row.phone_label !== 'string' || !isStatus(row.status)) return null
  if (typeof row.closed !== 'boolean' || row.closed !== orderIsClosed(row.status)) return null
  const order = orderFromStoredPayload(row.payload)
  if (!order) return null
  if (order.id !== row.id) return null
  if (order.customer !== row.customer_label) return null
  if (order.phone !== row.phone_label) return null
  if (order.status !== row.status) return null
  if (row.fiction_label !== fictionLabel(order)) return null
  return order
}

function toRecord(order: PracticeOrder, ownerId: string, at: string): PracticeOrderRecord {
  return {
    id: order.id,
    owner_id: ownerId,
    fiction_label: fictionLabel(order),
    customer_label: order.customer,
    phone_label: order.phone,
    status: order.status,
    closed: orderIsClosed(order.status),
    payload: { ...order, fiction: PRACTICE_FICTION },
    updated_at: at,
  }
}

export async function loadPracticeOrders(
  client: PracticeOrdersClient,
  proof: OwnerProof | null,
): Promise<PracticeOrdersLoad> {
  const owner = proofOrNull(proof)
  if (!owner) return { status: 'refused' }

  const { data, error } = await client
    .from(PRACTICE_ORDERS_TABLE)
    .select(PRACTICE_ORDER_COLUMNS)
    .eq('owner_id', owner.userId)
    .order('updated_at', { ascending: false })
    .limit(LIST_LIMIT)

  if (error) {
    const failure = classifyFailure(error)
    if (failure.status === 'denied') return { status: 'denied' }
    if (failure.status === 'not-installed') return { status: 'not-installed' }
    return { status: 'unavailable' }
  }
  if (!data) return { status: 'unavailable' }

  const orders: PracticeOrder[] = []
  let withheld = 0
  for (const row of data) {
    const order = rowToOrder(row, owner.userId)
    if (order) orders.push(order)
    else withheld += 1
  }
  return { status: 'ok', orders, withheld }
}

async function confirmedWrite(
  result: PracticeQueryResult,
  order: PracticeOrder,
): Promise<PracticeOrdersWrite> {
  if (result.error) return classifyFailure(result.error)
  const row = result.data?.[0]
  if (!row || typeof row !== 'object' || !('id' in row) || row.id !== order.id) {
    return { status: 'missing' }
  }
  return { status: 'ok', order }
}

export async function savePracticeOrder(
  client: PracticeOrdersClient,
  proof: OwnerProof | null,
  order: PracticeOrder,
  mode: 'insert' | 'update',
  at: string,
): Promise<PracticeOrdersWrite> {
  const owner = proofOrNull(proof)
  if (!owner) return { status: 'refused' }

  const problem = fictionalOrderProblem(order)
  if (problem) return { status: 'invalid', message: problem }

  const record = toRecord(order, owner.userId, at)
  if (mode === 'insert') {
    const result = await client.from(PRACTICE_ORDERS_TABLE).insert(record).select('id')
    return confirmedWrite(result, order)
  }

  const result = await client
    .from(PRACTICE_ORDERS_TABLE)
    .update(record)
    .eq('id', order.id)
    .select('id')
  return confirmedWrite(result, order)
}
