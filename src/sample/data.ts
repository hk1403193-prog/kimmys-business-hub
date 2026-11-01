import type {
  SampleCampaign,
  SampleCustomer,
  SampleDay,
  SampleFollowUp,
  SampleHours,
  SampleMoneyItem,
  SampleOrder,
  SamplePartner,
  SampleStop,
  SampleToggle,
} from './types'

/**
 * Fictional practice records for the Phase 1 layout.
 * These are not real customers, orders, partners, or payments.
 */

export const sampleOrders: SampleOrder[] = [
  {
    id: 'S-1042',
    customer: 'Avery Sample',
    kind: 'Shopping list',
    status: 'New',
    total: 42,
    window: '2:00–4:00 PM',
    summary: 'Practice list: milk, bread, and apples.',
  },
  {
    id: 'S-1041',
    customer: 'Blake Example',
    kind: 'Pharmacy pickup',
    status: 'Out for delivery',
    total: 18,
    window: '12:00–1:00 PM',
    summary: 'Practice pickup from a fictional pharmacy.',
  },
  {
    id: 'S-1038',
    customer: 'Casey Preview',
    kind: 'Concierge errand',
    status: 'Shopping',
    total: 64,
    window: '1:00–3:00 PM',
    summary: 'Practice errand with a short shopping list.',
  },
  {
    id: 'S-1036',
    customer: 'Drew Practice',
    kind: 'Grocery delivery',
    status: 'Accepted',
    total: 53,
    window: '3:00–5:00 PM',
    summary: 'Practice groceries for a fictional household.',
  },
  {
    id: 'S-1033',
    customer: 'Eden Placeholder',
    kind: 'Flower delivery',
    status: 'Delivered',
    total: 36,
    window: 'Morning',
    summary: 'Practice bouquet marked delivered.',
  },
  {
    id: 'S-1029',
    customer: 'Finn Demo',
    kind: 'Supply run',
    status: 'Delivered',
    total: 27,
    window: 'Morning',
    summary: 'Practice supply run marked delivered.',
  },
]

export const sampleCustomers: SampleCustomer[] = [
  {
    id: 'C-201',
    name: 'Avery Sample',
    phone: '(555) 010-0142',
    area: 'Practice Town',
    address: '100 Preview Lane, Practice Town',
    note: 'Fictional note: prefers an afternoon drop-off.',
    lastOrderId: 'S-1042',
  },
  {
    id: 'C-202',
    name: 'Blake Example',
    phone: '(555) 010-0188',
    area: 'Practice Town',
    address: '18 Demo Court, Practice Town',
    note: 'Fictional note: sample gate code 0000.',
    lastOrderId: 'S-1041',
  },
  {
    id: 'C-203',
    name: 'Casey Preview',
    phone: '(555) 010-0164',
    area: 'Sample Hills',
    address: '64 Layout Road, Sample Hills',
    note: 'Fictional note: text when the sample order is close.',
    lastOrderId: 'S-1038',
  },
  {
    id: 'C-204',
    name: 'Drew Practice',
    phone: '(555) 010-0153',
    area: 'Sample Hills',
    address: '7 Placeholder Drive, Sample Hills',
    note: 'Fictional note: leave the sample bags on the porch.',
    lastOrderId: 'S-1036',
  },
]

export const sampleStops: SampleStop[] = [
  {
    id: 'stop-1',
    time: '12:00–1:00 PM',
    customer: 'Blake Example',
    task: 'Pharmacy pickup',
    place: 'Preview Pharmacy',
    status: 'Out for delivery',
  },
  {
    id: 'stop-2',
    time: '1:00–3:00 PM',
    customer: 'Casey Preview',
    task: 'Concierge errand',
    place: 'Sample Corner Market',
    status: 'Shopping',
  },
  {
    id: 'stop-3',
    time: '2:00–4:00 PM',
    customer: 'Avery Sample',
    task: 'Shopping list',
    place: '100 Preview Lane',
    status: 'New',
  },
  {
    id: 'stop-4',
    time: '3:00–5:00 PM',
    customer: 'Drew Practice',
    task: 'Grocery delivery',
    place: '7 Placeholder Drive',
    status: 'Accepted',
  },
]

export const samplePartners: SamplePartner[] = [
  {
    id: 'P-1',
    name: 'Sample Corner Market',
    kind: 'Grocery',
    note: 'Fictional partner used to practice the layout.',
    status: 'Sample active',
  },
  {
    id: 'P-2',
    name: 'Practice Blooms',
    kind: 'Flowers',
    note: 'Fictional flower shop. Not a real business.',
    status: 'Sample active',
  },
  {
    id: 'P-3',
    name: 'Preview Pharmacy',
    kind: 'Pharmacy',
    note: 'Fictional pickup counter for the sample route.',
    status: 'Sample lead',
  },
]

export const sampleCampaigns: SampleCampaign[] = [
  {
    id: 'M-1',
    name: 'Sample hello note',
    status: 'Draft — not sent',
    detail: 'A practice message. Phase 1 does not send texts or email.',
  },
  {
    id: 'M-2',
    name: 'Sample weekly special',
    status: 'Idea only',
    detail: 'A placeholder campaign card. Nothing is scheduled.',
  },
]

export const sampleFollowUps: SampleFollowUp[] = [
  {
    id: 'F-1',
    customer: 'Avery Sample',
    action: 'Sample thank-you',
    when: 'Practice afternoon',
  },
  {
    id: 'F-2',
    customer: 'Casey Preview',
    action: 'Sample order check-in',
    when: 'Practice evening',
  },
]

export const sampleMoneyItems: SampleMoneyItem[] = [
  { id: 'money-1', label: 'Sample delivery fees', kind: 'Income', amount: 560 },
  { id: 'money-2', label: 'Sample shopping fees', kind: 'Income', amount: 168 },
  { id: 'money-3', label: 'Sample fuel', kind: 'Expense', amount: 48 },
  { id: 'money-4', label: 'Sample supplies', kind: 'Expense', amount: 22 },
  { id: 'money-5', label: 'Sample phone', kind: 'Expense', amount: 35 },
]

export const sampleWeek: SampleDay[] = [
  { label: 'Mon', orders: 4, income: 80 },
  { label: 'Tue', orders: 5, income: 120 },
  { label: 'Wed', orders: 6, income: 140 },
  { label: 'Thu', orders: 5, income: 110 },
  { label: 'Fri', orders: 7, income: 168 },
  { label: 'Sat', orders: 4, income: 80 },
  { label: 'Sun', orders: 1, income: 30 },
]

export const sampleHours: SampleHours[] = [
  { day: 'Monday', hours: '9:00 AM – 5:00 PM', open: true },
  { day: 'Tuesday', hours: '9:00 AM – 5:00 PM', open: true },
  { day: 'Wednesday', hours: '9:00 AM – 5:00 PM', open: true },
  { day: 'Thursday', hours: '9:00 AM – 5:00 PM', open: true },
  { day: 'Friday', hours: '9:00 AM – 5:00 PM', open: true },
  { day: 'Saturday', hours: '9:00 AM – 2:00 PM', open: true },
  { day: 'Sunday', hours: 'Closed', open: false },
]

export const sampleServices: SampleToggle[] = [
  {
    id: 'service-shopping',
    label: 'Personal shopping',
    detail: 'Sample service switch.',
    on: true,
  },
  {
    id: 'service-delivery',
    label: 'Local delivery',
    detail: 'Sample service switch.',
    on: true,
  },
  {
    id: 'service-errands',
    label: 'Errands',
    detail: 'Sample service switch.',
    on: true,
  },
  {
    id: 'service-concierge',
    label: 'Concierge requests',
    detail: 'Sample service switch.',
    on: true,
  },
]

export const sampleAreas: SampleToggle[] = [
  {
    id: 'area-many',
    label: 'Many',
    detail: 'Placeholder service area. Not a customer list.',
    on: true,
  },
  {
    id: 'area-surrounding',
    label: 'Surrounding communities',
    detail: 'Placeholder service area. Town names can be added later.',
    on: true,
  },
]

export const initialQuote = {
  baseFee: 8,
  perExtraMile: 1.5,
  includedMiles: 3,
  miles: 5,
  subtotal: 20,
  smallOrderThreshold: 25,
  smallOrderFee: 4,
  shopping: true,
  shoppingFee: 15,
}
