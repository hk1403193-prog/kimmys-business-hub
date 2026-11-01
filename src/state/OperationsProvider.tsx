import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { localISODate } from '../domain/dates'
import {
  createInitialState,
  operationsReducer,
  type OperationsState,
} from '../domain/operations'
import type {
  OrderDraft,
  PracticeStatus,
  PricingRules,
  QuoteScenario,
  WorkloadRules,
} from '../domain/types'

type OperationsApi = {
  state: OperationsState
  createOrder: (draft: OrderDraft) => void
  updateOrder: (id: string, draft: OrderDraft) => void
  setStatus: (id: string, status: PracticeStatus) => void
  reorder: (date: string, index: number, direction: -1 | 1) => void
  updateRules: (rules: PricingRules) => void
  updateWorkload: (rules: WorkloadRules) => void
  updatePractice: (scenario: QuoteScenario) => void
  armDraft: () => void
  clearDraft: () => void
  toggleHours: (day: string) => void
  toggleService: (id: string) => void
  toggleArea: (id: string) => void
}

const OperationsContext = createContext<OperationsApi | null>(null)

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    operationsReducer,
    localISODate(),
    createInitialState,
  )
  const api = useMemo<OperationsApi>(() => {
    const at = () => new Date().toISOString()

    return {
      state,
      createOrder: (draft) => dispatch({ type: 'create', draft, at: at() }),
      updateOrder: (id, draft) =>
        dispatch({ type: 'update', id, draft, at: at() }),
      setStatus: (id, status) =>
        dispatch({ type: 'status', id, status, at: at() }),
      reorder: (date, index, direction) =>
        dispatch({ type: 'reorder', date, index, direction }),
      updateRules: (rules) => dispatch({ type: 'rules', rules }),
      updateWorkload: (rules) => dispatch({ type: 'workload', rules }),
      updatePractice: (scenario) => dispatch({ type: 'practice', scenario }),
      armDraft: () => dispatch({ type: 'arm-draft' }),
      clearDraft: () => dispatch({ type: 'clear-draft' }),
      toggleHours: (day) => dispatch({ type: 'toggle-hours', day }),
      toggleService: (id) => dispatch({ type: 'toggle-service', id }),
      toggleArea: (id) => dispatch({ type: 'toggle-area', id }),
    }
  }, [state])

  return (
    <OperationsContext.Provider value={api}>
      {children}
    </OperationsContext.Provider>
  )
}

export function useOperations(): OperationsApi {
  const api = useContext(OperationsContext)
  if (!api) {
    throw new Error('Operations are only available inside the command center.')
  }

  return api
}
