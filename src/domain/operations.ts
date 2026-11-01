import type { SampleHours, SampleToggle } from '../sample/types'
import { applyOrderDraft, applyStatus, createPracticeOrder } from './orders'
import { reorderRoute } from './schedule'
import { cloneSettings, createSeed, defaultPracticeScenario, defaultPricingRules, defaultWorkloadRules } from './seed'
import type {
  OrderDraft,
  PracticeOrder,
  PracticeStatus,
  PricingRules,
  QuoteScenario,
  WorkloadRules,
} from './types'

export type OperationsState = {
  today: string
  orders: PracticeOrder[]
  routeIdsByDate: Record<string, string[]>
  rules: PricingRules
  workloadRules: WorkloadRules
  practice: QuoteScenario
  draftArmed: boolean
  hours: SampleHours[]
  services: SampleToggle[]
  areas: SampleToggle[]
}

export type OperationsAction =
  | { type: 'create'; draft: OrderDraft; at: string }
  | { type: 'update'; id: string; draft: OrderDraft; at: string }
  | { type: 'status'; id: string; status: PracticeStatus; at: string }
  | { type: 'reorder'; date: string; index: number; direction: -1 | 1 }
  | { type: 'rules'; rules: PricingRules }
  | { type: 'workload'; rules: WorkloadRules }
  | { type: 'practice'; scenario: QuoteScenario }
  | { type: 'arm-draft' }
  | { type: 'clear-draft' }
  | { type: 'toggle-hours'; day: string }
  | { type: 'toggle-service'; id: string }
  | { type: 'toggle-area'; id: string }

export function createInitialState(today: string): OperationsState {
  const settings = cloneSettings()

  return {
    today,
    orders: createSeed(today),
    routeIdsByDate: {},
    rules: defaultPricingRules(),
    workloadRules: defaultWorkloadRules(),
    practice: defaultPracticeScenario(),
    draftArmed: false,
    hours: settings.hours,
    services: settings.services,
    areas: settings.areas,
  }
}

function replaceOrder(
  orders: PracticeOrder[],
  id: string,
  next: PracticeOrder,
): PracticeOrder[] {
  return orders.map((order) => (order.id === id ? next : order))
}

export function operationsReducer(
  state: OperationsState,
  action: OperationsAction,
): OperationsState {
  switch (action.type) {
    case 'create':
      return {
        ...state,
        orders: [
          createPracticeOrder(state.orders, action.draft, action.at),
          ...state.orders,
        ],
        draftArmed: false,
      }
    case 'update': {
      const current = state.orders.find((order) => order.id === action.id)
      if (!current) {
        return state
      }

      return {
        ...state,
        orders: replaceOrder(
          state.orders,
          action.id,
          applyOrderDraft(current, action.draft, action.at),
        ),
      }
    }
    case 'status': {
      const current = state.orders.find((order) => order.id === action.id)
      if (!current) {
        return state
      }

      return {
        ...state,
        orders: replaceOrder(
          state.orders,
          action.id,
          applyStatus(current, action.status, action.at),
        ),
      }
    }
    case 'reorder':
      return {
        ...state,
        routeIdsByDate: {
          ...state.routeIdsByDate,
          [action.date]: reorderRoute(
            state.orders,
            action.date,
            state.routeIdsByDate[action.date] ?? [],
            action.index,
            action.direction,
          ),
        },
      }
    case 'rules':
      return { ...state, rules: action.rules }
    case 'workload':
      return { ...state, workloadRules: action.rules }
    case 'practice':
      return { ...state, practice: action.scenario }
    case 'arm-draft':
      return { ...state, draftArmed: true }
    case 'clear-draft':
      return { ...state, draftArmed: false }
    case 'toggle-hours':
      return {
        ...state,
        hours: state.hours.map((item) =>
          item.day === action.day ? { ...item, open: !item.open } : item,
        ),
      }
    case 'toggle-service':
      return {
        ...state,
        services: state.services.map((item) =>
          item.id === action.id ? { ...item, on: !item.on } : item,
        ),
      }
    case 'toggle-area':
      return {
        ...state,
        areas: state.areas.map((item) =>
          item.id === action.id ? { ...item, on: !item.on } : item,
        ),
      }
  }
}
