import { deliveryWindows, practiceStatuses, type PracticeOrder, type PracticeStatus } from './types'

const NAME_MARK = /(sample|example|preview|fictional|demo|practice|placeholder)/i
const PLACE_MARK = /(practice|sample|demo|preview|fictional|placeholder)/i
const PHONE = /^\(555\) \d{3}-\d{4}$/
const ORDER_ID = /^S-\d{4,6}$/
const DAY = /^\d{4}-\d{2}-\d{2}$/
const SAFE_ID = /^[A-Za-z0-9-]{1,40}$/
const USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const LIVE_SITE = 'kimmysdelivery.com'

export const PRACTICE_FICTION = 'practice'
export const MAX_PRACTICE_ORDER_JSON = 12000

export function orderIsClosed(status: PracticeStatus): boolean {
  return status === 'Completed' || status === 'Canceled'
}

export function isPracticeUserId(value: string): boolean {
  return USER_ID.test(value)
}

export function fictionLabel(order: Pick<PracticeOrder, 'id' | 'customer'>): string {
  return `FICTIONAL: ${order.id} ${order.customer}`.slice(0, 160)
}

function mentionsLiveSite(value: string): boolean {
  return value.toLowerCase().includes(LIVE_SITE)
}

function hasEmail(value: string): boolean {
  return value.includes('@')
}

function isDay(value: string): boolean {
  if (!DAY.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function inRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max
}

function textProblem(value: string, label: string, max: number): string | null {
  if (value.length > max) return `${label} is too long for a practice order.`
  if (hasEmail(value)) return 'Practice orders cannot store an email address.'
  if (mentionsLiveSite(value)) {
    return 'That text mentions the live customer website. Practice orders cannot store it.'
  }
  return null
}

export function fictionalOrderProblem(order: PracticeOrder): string | null {
  if (!ORDER_ID.test(order.id)) return 'Practice order numbers look like S-1042.'
  if (order.customer.trim().length < 2 || order.customer.length > 80) {
    return 'Use a short fictional customer name.'
  }
  if (!NAME_MARK.test(order.customer)) {
    return 'Use a fictional name that includes Sample, Example, Preview, Demo, Practice, Fictional, or Placeholder.'
  }
  const customerText = textProblem(order.customer, 'The customer name', 80)
  if (customerText) return customerText
  if (!PHONE.test(order.phone)) {
    return 'Use a fictional 555 phone number, such as (555) 010-0199.'
  }

  for (const [label, value] of [
    ['The area', order.area],
    ['The address', order.address],
    ['The pickup place', order.pickupPlace],
    ['The delivery place', order.deliveryPlace],
  ] as const) {
    if (value.trim().length < 2) return `${label} needs a practice place.`
    const problem = textProblem(value, label, 120)
    if (problem) return problem
    if (!PLACE_MARK.test(value)) {
      return 'Use a practice place, such as Practice Town, Sample Hills, or Preview Lane.'
    }
  }

  const service = textProblem(order.serviceType, 'The service', 80)
  if (service) return service
  if (order.serviceType.trim().length < 2) return 'Choose a practice service.'
  if (order.priority !== 'Low' && order.priority !== 'Normal' && order.priority !== 'High') {
    return 'Choose a practice priority.'
  }
  if (!practiceStatuses.includes(order.status)) return 'Choose a practice status.'
  if (!isDay(order.requestedDate)) return 'Choose a practice date.'
  if (!deliveryWindows.includes(order.deliveryWindow as (typeof deliveryWindows)[number])) {
    return 'Choose a practice delivery window.'
  }
  if (!deliveryWindows.includes(order.pickupWindow as (typeof deliveryWindows)[number])) {
    return 'Choose a practice pickup window.'
  }

  if (!Array.isArray(order.shoppingList) || order.shoppingList.length > 30) {
    return 'The practice shopping list is too long.'
  }
  for (const item of order.shoppingList) {
    if (typeof item !== 'string' || item.trim().length === 0) {
      return 'Remove the empty shopping line.'
    }
    const problem = textProblem(item, 'A shopping line', 80)
    if (problem) return problem
  }

  const instructions = textProblem(order.instructions, 'The instructions', 500)
  if (instructions) return instructions
  if (order.instructions.trim().length > 0 && !/fictional/i.test(order.instructions)) {
    return 'Keep the word Fictional in the instructions.'
  }

  const scenario = order.scenario
  if (!scenario || typeof scenario !== 'object') return 'The practice quote is missing.'
  if (!inRange(scenario.miles, 0, 40)) return 'Practice miles must stay between 0 and 40.'
  if (!Number.isInteger(scenario.extraStops) || !inRange(scenario.extraStops, 0, 6)) {
    return 'Practice stops must stay between 0 and 6.'
  }
  if (!Number.isInteger(scenario.waitingMinutes) || !inRange(scenario.waitingMinutes, 0, 180)) {
    return 'Practice waiting minutes must stay between 0 and 180.'
  }
  if (!Number.isInteger(scenario.itemCount) || !inRange(scenario.itemCount, 0, 40)) {
    return 'The practice item count is not valid.'
  }
  if (order.shoppingList.length > 0 && scenario.itemCount !== order.shoppingList.length) {
    return 'The practice item count has to match the shopping list.'
  }
  if (!inRange(scenario.merchandiseTotal, 0, 500)) {
    return 'The merchandise estimate must stay between 0 and 500.'
  }
  if (!inRange(scenario.discount, 0, 100)) return 'The practice discount must stay between 0 and 100.'
  if (!inRange(scenario.adjustment, -100, 100)) {
    return 'The practice adjustment must stay between -100 and 100.'
  }
  if (typeof scenario.rush !== 'boolean') return 'The practice rush choice is not valid.'
  if (!/^[a-z0-9-]{1,40}$/.test(scenario.serviceAreaId)) return 'Choose a practice service area.'
  if (!/^[a-z0-9-]{1,40}$/.test(scenario.shoppingTierId)) return 'Choose a practice shopping tier.'

  if (!Array.isArray(order.timeline) || order.timeline.length < 1 || order.timeline.length > 40) {
    return 'The practice status history is not valid.'
  }
  for (const entry of order.timeline) {
    if (!entry || !SAFE_ID.test(entry.id)) return 'The practice status history is not valid.'
    if (!practiceStatuses.includes(entry.status)) return 'The practice status history is not valid.'
    if (typeof entry.at !== 'string' || entry.at.length > 40 || Number.isNaN(Date.parse(entry.at))) {
      return 'The practice status history is not valid.'
    }
    const note = textProblem(entry.note, 'A status note', 200)
    if (note) return note
    if (entry.note.trim().length === 0) return 'The practice status history is not valid.'
  }

  const label = fictionLabel(order)
  if (!label.startsWith('FICTIONAL:') || label.length < 12) {
    return 'This practice order is not marked fictional.'
  }

  const payload = JSON.stringify({ ...order, fiction: PRACTICE_FICTION })
  if (payload.length > MAX_PRACTICE_ORDER_JSON) return 'This practice order is too large to save.'
  return null
}

export type OrderPersistence = 'loading' | 'database' | 'memory' | 'blocked'

export type PracticeWriteDecision =
  | { kind: 'invalid'; message: string }
  | { kind: 'unavailable'; message: string }
  | { kind: 'memory' }
  | { kind: 'database' }

export function decidePracticeWrite(
  persistence: OrderPersistence,
  order: PracticeOrder,
): PracticeWriteDecision {
  const problem = fictionalOrderProblem(order)
  if (problem) return { kind: 'invalid', message: problem }
  if (persistence === 'loading') {
    return { kind: 'unavailable', message: 'Practice orders are still loading.' }
  }
  if (persistence === 'blocked') {
    return { kind: 'unavailable', message: 'Practice orders are not available.' }
  }
  if (persistence === 'memory') return { kind: 'memory' }
  return { kind: 'database' }
}
