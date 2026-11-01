import { sampleAreas, sampleHours, sampleServices } from '../sample/data'
import { addDays } from './dates'
import type {
  OrderDraft,
  PracticeOrder,
  PracticeStatus,
  PricingRules,
  QuoteScenario,
  WorkloadRules,
} from './types'

export function defaultPricingRules(): PricingRules {
  return {
    baseFee: 8,
    includedMiles: 3,
    perExtraMile: 1.5,
    serviceAreas: [
      { id: 'many', label: 'Many', fee: 0 },
      { id: 'surrounding', label: 'Surrounding communities', fee: 6 },
      { id: 'farther', label: 'Farther practice area', fee: 12 },
    ],
    extraStopFee: 4,
    rushFee: 10,
    waitingBlockMinutes: 15,
    waitingBlockFee: 5,
    smallOrderEnabled: true,
    smallOrderThreshold: 25,
    smallOrderFee: 4,
    shoppingTiers: [
      { id: 'none', label: 'No shopping', fee: 0 },
      { id: 'practice', label: 'Practice list', fee: 15 },
      { id: 'standard', label: 'Standard list', fee: 22 },
      { id: 'large', label: 'Large list', fee: 35 },
    ],
    dueBeforeShopping: {
      base: true,
      mileage: false,
      serviceArea: true,
      extraStops: true,
      rush: true,
      waiting: false,
      shopping: true,
      smallOrder: true,
    },
  }
}

export function defaultWorkloadRules(): WorkloadRules {
  return {
    basePoints: 2,
    pointsPerExtraStop: 1,
    rushPoints: 2,
    shoppingPoints: 1,
    baseMinutes: 25,
    minutesPerExtraStop: 10,
    minutesPerItem: 3,
    rushMinutes: 15,
  }
}

export function defaultPracticeScenario(): QuoteScenario {
  return {
    miles: 5,
    serviceAreaId: 'many',
    extraStops: 0,
    rush: false,
    waitingMinutes: 0,
    shoppingTierId: 'practice',
    itemCount: 3,
    merchandiseTotal: 20,
    discount: 0,
    adjustment: 0,
  }
}

function scenario(overrides: Partial<QuoteScenario>): QuoteScenario {
  return { ...defaultPracticeScenario(), ...overrides }
}

function order(input: {
  id: string
  customer: string
  phone: string
  area: string
  address: string
  serviceType: string
  priority: PracticeOrder['priority']
  status: PracticeStatus
  requestedDate: string
  deliveryWindow: string
  pickupWindow: string
  pickupPlace: string
  deliveryPlace: string
  shoppingList: string[]
  instructions: string
  scenario: QuoteScenario
}): PracticeOrder {
  return {
    ...input,
    timeline: [
      {
        id: `${input.id}-1`,
        status: input.status,
        at: `${input.requestedDate}T15:00:00.000Z`,
        note: 'Fictional sample created.',
      },
    ],
  }
}

export function createSeed(today: string): PracticeOrder[] {
  return [
    order({
      id: 'S-1041',
      customer: 'Blake Example',
      phone: '(555) 010-0188',
      area: 'Practice Town',
      address: '18 Demo Court, Practice Town',
      serviceType: 'Local delivery',
      priority: 'High',
      status: 'Out for Delivery',
      requestedDate: today,
      deliveryWindow: '12:00–1:00 PM',
      pickupWindow: 'Morning',
      pickupPlace: 'Preview Pharmacy',
      deliveryPlace: '18 Demo Court, Practice Town',
      shoppingList: [],
      instructions: 'Fictional note: sample gate code 0000.',
      scenario: scenario({
        miles: 2,
        shoppingTierId: 'none',
        itemCount: 0,
        merchandiseTotal: 30,
      }),
    }),
    order({
      id: 'S-1038',
      customer: 'Casey Preview',
      phone: '(555) 010-0164',
      area: 'Sample Hills',
      address: '64 Layout Road, Sample Hills',
      serviceType: 'Concierge requests',
      priority: 'Normal',
      status: 'Shopping',
      requestedDate: today,
      deliveryWindow: '1:00–3:00 PM',
      pickupWindow: '12:00–1:00 PM',
      pickupPlace: 'Sample Corner Market',
      deliveryPlace: '64 Layout Road, Sample Hills',
      shoppingList: [
        'Practice soap',
        'Practice tea',
        'Practice rice',
        'Practice pasta',
        'Practice beans',
        'Practice oats',
        'Practice honey',
        'Practice crackers',
      ],
      instructions: 'Fictional note: text when the sample order is close.',
      scenario: scenario({
        miles: 4,
        serviceAreaId: 'surrounding',
        extraStops: 1,
        shoppingTierId: 'standard',
        itemCount: 8,
        merchandiseTotal: 64,
      }),
    }),
    order({
      id: 'S-1042',
      customer: 'Avery Sample',
      phone: '(555) 010-0142',
      area: 'Practice Town',
      address: '100 Preview Lane, Practice Town',
      serviceType: 'Personal shopping',
      priority: 'Normal',
      status: 'New',
      requestedDate: today,
      deliveryWindow: '2:00–4:00 PM',
      pickupWindow: '1:00–3:00 PM',
      pickupPlace: 'Sample Corner Market',
      deliveryPlace: '100 Preview Lane, Practice Town',
      shoppingList: ['Milk', 'Bread', 'Apples'],
      instructions: 'Fictional note: prefers an afternoon drop-off.',
      scenario: scenario({
        miles: 5,
        shoppingTierId: 'practice',
        itemCount: 3,
        merchandiseTotal: 42,
      }),
    }),
    order({
      id: 'S-1036',
      customer: 'Drew Practice',
      phone: '(555) 010-0153',
      area: 'Sample Hills',
      address: '7 Placeholder Drive, Sample Hills',
      serviceType: 'Personal shopping',
      priority: 'High',
      status: 'Confirmed',
      requestedDate: addDays(today, 1),
      deliveryWindow: '3:00–5:00 PM',
      pickupWindow: '2:00–4:00 PM',
      pickupPlace: 'Sample Corner Market',
      deliveryPlace: '7 Placeholder Drive, Sample Hills',
      shoppingList: ['Practice cereal', 'Practice juice'],
      instructions: 'Fictional note: leave the sample bags on the porch.',
      scenario: scenario({
        miles: 6,
        rush: true,
        shoppingTierId: 'practice',
        itemCount: 2,
        merchandiseTotal: 53,
      }),
    }),
    order({
      id: 'S-1033',
      customer: 'Eden Placeholder',
      phone: '(555) 010-0136',
      area: 'Practice Town',
      address: '12 Bouquet Court, Practice Town',
      serviceType: 'Local delivery',
      priority: 'Low',
      status: 'Delivered',
      requestedDate: addDays(today, -1),
      deliveryWindow: 'Morning',
      pickupWindow: 'Morning',
      pickupPlace: 'Practice Blooms',
      deliveryPlace: '12 Bouquet Court, Practice Town',
      shoppingList: [],
      instructions: 'Fictional flower delivery.',
      scenario: scenario({
        miles: 3,
        shoppingTierId: 'none',
        itemCount: 0,
        merchandiseTotal: 36,
      }),
    }),
    order({
      id: 'S-1029',
      customer: 'Finn Demo',
      phone: '(555) 010-0129',
      area: 'Practice Town',
      address: '9 Demo Street, Practice Town',
      serviceType: 'Errands',
      priority: 'Normal',
      status: 'Completed',
      requestedDate: addDays(today, -1),
      deliveryWindow: 'Morning',
      pickupWindow: 'Morning',
      pickupPlace: 'Sample Corner Market',
      deliveryPlace: '9 Demo Street, Practice Town',
      shoppingList: ['Practice supplies'],
      instructions: 'Fictional supply run marked completed.',
      scenario: scenario({
        miles: 1,
        shoppingTierId: 'none',
        itemCount: 1,
        merchandiseTotal: 40,
      }),
    }),
    order({
      id: 'S-1048',
      customer: 'Jordan Practice',
      phone: '(555) 010-0177',
      area: 'Practice Town',
      address: '4 Cancel Lane, Practice Town',
      serviceType: 'Errands',
      priority: 'Low',
      status: 'Canceled',
      requestedDate: today,
      deliveryWindow: 'Evening',
      pickupWindow: 'Evening',
      pickupPlace: 'Sample Corner Market',
      deliveryPlace: '4 Cancel Lane, Practice Town',
      shoppingList: [],
      instructions: 'Fictional order kept as a canceled example.',
      scenario: scenario({
        miles: 1,
        shoppingTierId: 'none',
        itemCount: 0,
        merchandiseTotal: 40,
      }),
    }),
  ]
}

export function blankDraft(today: string, scenario: QuoteScenario): OrderDraft {
  return {
    customer: 'Sample customer',
    phone: '(555) 010-0199',
    serviceType: 'Personal shopping',
    priority: 'Normal',
    requestedDate: today,
    deliveryWindow: '2:00–4:00 PM',
    pickupWindow: '1:00–3:00 PM',
    pickupPlace: 'Sample Corner Market',
    deliveryPlace: '100 Preview Lane, Practice Town',
    shoppingText: 'Milk\nBread\nApples',
    instructions: 'Fictional instruction: leave the bags on the porch.',
    scenario: { ...scenario },
  }
}

export function draftFromOrder(source: PracticeOrder): OrderDraft {
  return {
    customer: source.customer,
    phone: source.phone,
    serviceType: source.serviceType,
    priority: source.priority,
    requestedDate: source.requestedDate,
    deliveryWindow: source.deliveryWindow,
    pickupWindow: source.pickupWindow,
    pickupPlace: source.pickupPlace,
    deliveryPlace: source.deliveryPlace,
    shoppingText: source.shoppingList.join('\n'),
    instructions: source.instructions,
    scenario: { ...source.scenario },
  }
}

export function cloneSettings() {
  return {
    hours: sampleHours.map((item) => ({ ...item })),
    services: sampleServices.map((item) => ({ ...item })),
    areas: sampleAreas.map((item) => ({ ...item })),
  }
}
