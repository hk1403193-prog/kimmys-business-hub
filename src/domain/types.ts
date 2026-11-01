export const practiceStatuses = [
  'New',
  'Quoted',
  'Awaiting Payment',
  'Confirmed',
  'Shopping',
  'Picked Up',
  'Out for Delivery',
  'Delivered',
  'Completed',
  'Canceled',
] as const

export type PracticeStatus = (typeof practiceStatuses)[number]

export const activePracticeStatuses: readonly PracticeStatus[] = [
  'Quoted',
  'Awaiting Payment',
  'Confirmed',
  'Shopping',
  'Picked Up',
  'Out for Delivery',
  'Delivered',
]

export const orderListFilters = [
  'All',
  'New',
  'Active',
  'Completed',
  'Canceled',
] as const

export type OrderListFilter = (typeof orderListFilters)[number]

export type Priority = 'Low' | 'Normal' | 'High'

export const deliveryWindows = [
  'Morning',
  '12:00–1:00 PM',
  '1:00–3:00 PM',
  '2:00–4:00 PM',
  '3:00–5:00 PM',
  'Evening',
] as const

export type ShoppingTier = {
  id: string
  label: string
  fee: number
}

export type ServiceAreaFee = {
  id: string
  label: string
  fee: number
}

export type DueBeforeShopping = {
  base: boolean
  mileage: boolean
  serviceArea: boolean
  extraStops: boolean
  rush: boolean
  waiting: boolean
  shopping: boolean
  smallOrder: boolean
}

export type PricingRules = {
  baseFee: number
  includedMiles: number
  perExtraMile: number
  serviceAreas: ServiceAreaFee[]
  extraStopFee: number
  rushFee: number
  waitingBlockMinutes: number
  waitingBlockFee: number
  smallOrderEnabled: boolean
  smallOrderThreshold: number
  smallOrderFee: number
  shoppingTiers: ShoppingTier[]
  dueBeforeShopping: DueBeforeShopping
}

export type WorkloadRules = {
  basePoints: number
  pointsPerExtraStop: number
  rushPoints: number
  shoppingPoints: number
  baseMinutes: number
  minutesPerExtraStop: number
  minutesPerItem: number
  rushMinutes: number
}

export type QuoteScenario = {
  miles: number
  serviceAreaId: string
  extraStops: number
  rush: boolean
  waitingMinutes: number
  shoppingTierId: string
  itemCount: number
  merchandiseTotal: number
  discount: number
  adjustment: number
}

export type FeeKey =
  | 'base'
  | 'mileage'
  | 'serviceArea'
  | 'extraStops'
  | 'rush'
  | 'waiting'
  | 'shopping'
  | 'smallOrder'

export type QuoteLine = {
  key: FeeKey
  label: string
  amount: number
  dueBeforeShopping: boolean
}

export type ServiceQuote = {
  lines: QuoteLine[]
  extraMiles: number
  serviceSubtotal: number
  discount: number
  adjustment: number
  adjustmentRejected: boolean
  merchandiseTotal: number
  earnings: number
  dueBeforeShopping: number
}

export type TimelineEntry = {
  id: string
  status: PracticeStatus
  at: string
  note: string
}

export type PracticeOrder = {
  id: string
  customer: string
  phone: string
  area: string
  address: string
  serviceType: string
  priority: Priority
  status: PracticeStatus
  requestedDate: string
  deliveryWindow: string
  pickupWindow: string
  pickupPlace: string
  deliveryPlace: string
  shoppingList: string[]
  instructions: string
  scenario: QuoteScenario
  timeline: TimelineEntry[]
}

export type OrderDraft = {
  customer: string
  phone: string
  serviceType: string
  priority: Priority
  requestedDate: string
  deliveryWindow: string
  pickupWindow: string
  pickupPlace: string
  deliveryPlace: string
  shoppingText: string
  instructions: string
  scenario: QuoteScenario
}
