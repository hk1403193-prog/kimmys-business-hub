export type OrderStatus =
  | 'New'
  | 'Accepted'
  | 'Shopping'
  | 'Out for delivery'
  | 'Delivered'

export type SampleOrder = {
  id: string
  customer: string
  kind: string
  status: OrderStatus
  total: number
  window: string
  summary: string
}

export type SampleCustomer = {
  id: string
  name: string
  phone: string
  area: string
  address: string
  note: string
  lastOrderId: string
}

export type SampleStop = {
  id: string
  time: string
  customer: string
  task: string
  place: string
  status: OrderStatus
}

export type SamplePartner = {
  id: string
  name: string
  kind: string
  note: string
  status: string
}

export type SampleCampaign = {
  id: string
  name: string
  status: string
  detail: string
}

export type SampleFollowUp = {
  id: string
  customer: string
  action: string
  when: string
}

export type SampleMoneyItem = {
  id: string
  label: string
  kind: 'Income' | 'Expense'
  amount: number
}

export type SampleDay = {
  label: string
  orders: number
  income: number
}

export type SampleHours = {
  day: string
  hours: string
  open: boolean
}

export type SampleToggle = {
  id: string
  label: string
  detail: string
  on: boolean
}
