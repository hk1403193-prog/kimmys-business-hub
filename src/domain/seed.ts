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
    baseFee: 10,
    includedMiles: 0,
    perExtraMile: 0,
    serviceAreas: [
      { id: 'many', label: 'Many', fee: 0 },
      { id: 'surrounding', label: 'Nearby towns (Toledo Town, Fisher, Florien, Negreet, Zwolle, Robeline)', fee: 5 },
    ],
    extraStopFee: 5,
    rushFee: 10,
    waitingBlockMinutes: 15,
    waitingBlockFee: 5,
    smallOrderEnabled: false,
    smallOrderThreshold: 0,
    smallOrderFee: 0,
    shoppingTiers: [
      { id: 'none', label: 'No shopping / pickup only', fee: 0 },
      { id: 'practice', label: 'Shopping (included in base fee)', fee: 0 },
      { id: 'standard', label: 'Standard shopping (included)', fee: 0 },
      { id: 'large', label: 'Large shopping (included)', fee: 0 },
    ],
    dueBeforeShopping: {
      base: true,
      mileage: false,
      serviceArea: true,
      extraStops: true,
      rush: true,
      waiting: false,
      shopping: false,
      smallOrder: false,
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
    miles: 0,
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
      area: 'Many',
      address: '18 Demo Court, Many',
      serviceType: 'Pharmacy pickup',
      priority: 'High',
      status: 'Out for Delivery',
      requestedDate: today,
      deliveryWindow: '12:00–1:00 PM',
      pickupWindow: 'Morning',
      pickupPlace: 'Local Pharmacy',
      deliveryPlace: '18 Demo Court, Many',
      shoppingList: [],
      instructions: 'Fictional note: sample gate code 0000.',
      scenario: scenario({
        miles: 0,
        shoppingTierId: 'none',
        itemCount: 0,
        merchandiseTotal: 30,
      }),
    }),
    order({
      id: 'S-1038',
      customer: 'Casey Preview',
      phone: '(555) 010-0164',
      area: 'Fisher',
      address: '64 Layout Road, Fisher',
      serviceType: 'Grocery shopping & delivery',
      priority: 'Normal',
      status: 'Shopping',
      requestedDate: today,
      deliveryWindow: '1:00–3:00 PM',
      pickupWindow: '12:00–1:00 PM',
      pickupPlace: 'Local Market',
      deliveryPlace: '64 Layout Road, Fisher',
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
        miles: 0,
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
      area: 'Many',
      address: '100 Preview Lane, Many',
      serviceType: 'Grocery shopping & delivery',
      priority: 'Normal',
      status: 'New',
      requestedDate: today,
      deliveryWindow: '2:00–4:00 PM',
      pickupWindow: '1:00–3:00 PM',
      pickupPlace: 'Local Market',
      deliveryPlace: '100 Preview Lane, Many',
      shoppingList: ['Milk', 'Bread', 'Apples'],
      instructions: 'Fictional note: prefers an afternoon drop-off.',
      scenario: scenario({
        miles: 0,
        shoppingTierId: 'practice',
        itemCount: 3,
        merchandiseTotal: 42,
      }),
    }),
    order({
      id: 'S-1036',
      customer: 'Drew Practice',
      phone: '(555) 010-0153',
      area: 'Zwolle',
      address: '7 Placeholder Drive, Zwolle',
      serviceType: 'Restaurant pickup & delivery',
      priority: 'High',
      status: 'Confirmed',
      requestedDate: addDays(today, 1),
      deliveryWindow: '3:00–5:00 PM',
      pickupWindow: '2:00–4:00 PM',
      pickupPlace: 'The Blonde Barista',
      deliveryPlace: '7 Placeholder Drive, Zwolle',
      shoppingList: ['Coffee order'],
      instructions: 'Fictional note: leave on the porch.',
      scenario: scenario({
        miles: 0,
        serviceAreaId: 'surrounding',
        rush: true,
        shoppingTierId: 'none',
        itemCount: 1,
        merchandiseTotal: 15,
      }),
    }),
    order({
      id: 'S-1033',
      customer: 'Eden Placeholder',
      phone: '(555) 010-0136',
      area: 'Many',
      address: '12 Bouquet Court, Many',
      serviceType: 'Errands',
      priority: 'Low',
      status: 'Delivered',
      requestedDate: addDays(today, -1),
      deliveryWindow: 'Morning',
      pickupWindow: 'Morning',
      pickupPlace: 'Post Office',
      deliveryPlace: '12 Bouquet Court, Many',
      shoppingList: [],
      instructions: 'Fictional errand.',
      scenario: scenario({
        miles: 0,
        shoppingTierId: 'none',
        itemCount: 0,
        merchandiseTotal: 0,
      }),
    }),
    order({
      id: 'S-1029',
      customer: 'Finn Demo',
      phone: '(555) 010-0129',
      area: 'Many',
      address: '9 Demo Street, Many',
      serviceType: 'Retail & store pickup',
      priority: 'Normal',
      status: 'Completed',
      requestedDate: addDays(today, -1),
      deliveryWindow: 'Morning',
      pickupWindow: 'Morning',
      pickupPlace: 'Troy’s Butcher Shop',
      deliveryPlace: '9 Demo Street, Many',
      shoppingList: ['Practice meat'],
      instructions: 'Fictional supply run marked completed.',
      scenario: scenario({
        miles: 0,
        shoppingTierId: 'none',
        itemCount: 1,
        merchandiseTotal: 40,
      }),
    }),
    order({
      id: 'S-1048',
      customer: 'Jordan Practice',
      phone: '(555) 010-0177',
      area: 'Many',
      address: '4 Cancel Lane, Many',
      serviceType: 'Errands',
      priority: 'Low',
      status: 'Canceled',
      requestedDate: today,
      deliveryWindow: 'Evening',
      pickupWindow: 'Evening',
      pickupPlace: 'Local Market',
      deliveryPlace: '4 Cancel Lane, Many',
      shoppingList: [],
      instructions: 'Fictional order kept as a canceled example.',
      scenario: scenario({
        miles: 0,
        shoppingTierId: 'none',
        itemCount: 0,
        merchandiseTotal: 0,
      }),
    }),
  ]
}

export function blankDraft(today: string, scenario: QuoteScenario): OrderDraft {
  return {
    customer: 'Sample customer',
    phone: '(555) 010-0199',
    serviceType: 'Grocery shopping & delivery',
    priority: 'Normal',
    requestedDate: today,
    deliveryWindow: '2:00–4:00 PM',
    pickupWindow: '1:00–3:00 PM',
    pickupPlace: 'Local Market',
    deliveryPlace: '100 Preview Lane, Many',
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
