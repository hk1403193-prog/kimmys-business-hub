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
import type { OwnerProof } from '../auth/access'
import { guardedDispatch } from '../auth/guard'

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

export function OperationsProvider({
  proof,
  children,
}: {
  proof: OwnerProof
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(
    operationsReducer,
    localISODate(),
    createInitialState,
  )
  const api = useMemo<OperationsApi>(() => {
    const at = () => new Date().toISOString()
    const send = (action: Parameters<typeof dispatch>[0]) => {
      guardedDispatch(proof, dispatch, action)
    }

    return {
      state,
      createOrder: (draft) => send({ type: 'create', draft, at: at() }),
      updateOrder: (id, draft) => send({ type: 'update', id, draft, at: at() }),
      setStatus: (id, status) => send({ type: 'status', id, status, at: at() }),
      reorder: (date, index, direction) =>
        send({ type: 'reorder', date, index, direction }),
      updateRules: (rules) => send({ type: 'rules', rules }),
      updateWorkload: (rules) => send({ type: 'workload', rules }),
      updatePractice: (scenario) => send({ type: 'practice', scenario }),
      armDraft: () => send({ type: 'arm-draft' }),
      clearDraft: () => send({ type: 'clear-draft' }),
      toggleHours: (day) => send({ type: 'toggle-hours', day }),
      toggleService: (id) => send({ type: 'toggle-service', id }),
      toggleArea: (id) => send({ type: 'toggle-area', id }),
    }
  }, [state, proof])

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
