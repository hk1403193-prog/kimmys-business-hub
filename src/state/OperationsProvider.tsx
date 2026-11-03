import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { requireOwnerProof, type OwnerProof } from '../auth/access'
import { browserSupabase, publicConfigFromEnv } from '../auth/client'
import { guardedDispatch } from '../auth/guard'
import {
  loadPracticeOrders,
  practiceOrderFailureMessage,
  savePracticeOrder,
  type PracticeOrdersClient,
} from '../auth/practiceOrders'
import { localISODate } from '../domain/dates'
import { decidePracticeWrite } from '../domain/fictional'
import {
  createInitialState,
  operationsReducer,
  type OperationsAction,
  type OperationsState,
} from '../domain/operations'
import { createSeed } from '../domain/seed'
import type {
  OrderDraft,
  PracticeOrder,
  PracticeStatus,
  PricingRules,
  QuoteScenario,
  WorkloadRules,
} from '../domain/types'
import {
  MEMORY_SAVE_MESSAGE,
  orderSyncText,
  practiceWriteSuccess,
  type OrderSync,
  type OrderWriteResult,
} from './orderSync'

const SAVED_ORDER_CAP = 100

type OperationsApi = {
  state: OperationsState
  orderSync: OrderSync
  createOrder: (draft: OrderDraft) => Promise<OrderWriteResult>
  updateOrder: (id: string, draft: OrderDraft) => Promise<OrderWriteResult>
  setStatus: (id: string, status: PracticeStatus) => Promise<OrderWriteResult>
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

function freshOrder(
  before: readonly PracticeOrder[],
  after: readonly PracticeOrder[],
): PracticeOrder | null {
  return after.find((order) => !before.some((current) => current.id === order.id)) ?? null
}

function failure(message: string, sync: OrderSync): OrderSync {
  return { ...sync, phase: 'error', message }
}

export function OperationsProvider({
  proof,
  children,
}: {
  proof: OwnerProof
  children: ReactNode
}) {
  const config = useMemo(() => publicConfigFromEnv(import.meta.env), [])
  const supabase = useMemo(() => browserSupabase(config), [config])
  const client = supabase as unknown as PracticeOrdersClient | null
  const [state, dispatch] = useReducer(
    operationsReducer,
    localISODate(),
    (today: string) => ({
      ...createInitialState(today),
      orders: [],
    }),
  )
  const [orderSync, setOrderSync] = useState<OrderSync>({
    persistence: 'loading',
    phase: 'loading',
    message: null,
  })
  const stateRef = useRef(state)
  const syncRef = useRef(orderSync)
  const proofRef = useRef(proof)
  const saving = useRef(false)
  stateRef.current = state
  syncRef.current = orderSync
  proofRef.current = proof

  useEffect(() => {
    let active = true

    if (!client) {
      setOrderSync({
        persistence: 'blocked',
        phase: 'error',
        message: practiceOrderFailureMessage({ status: 'unavailable' }),
      })
      return () => {
        active = false
      }
    }

    setOrderSync({ persistence: 'loading', phase: 'loading', message: null })
    void loadPracticeOrders(client, proofRef.current).then((result) => {
      if (!active) return
      if (result.status === 'ok') {
        dispatch({ type: 'replace-orders', orders: result.orders })
        const withheld =
          result.withheld > 0
            ? `${result.withheld} saved ${result.withheld === 1 ? 'row was' : 'rows were'} hidden because ${result.withheld === 1 ? 'it was' : 'they were'} not fictional.`
            : null
        const empty =
          result.orders.length === 0 && result.withheld === 0
            ? 'No practice orders are saved yet. Create a sample order and it will stay after a refresh.'
            : null
        const capped =
          result.orders.length === SAVED_ORDER_CAP
            ? `Showing the ${SAVED_ORDER_CAP} most recently updated practice orders.`
            : null
        setOrderSync({
          persistence: 'database',
          phase: 'idle',
          message: withheld ?? empty ?? capped,
        })
        return
      }

      if (result.status === 'not-installed') {
        dispatch({
          type: 'replace-orders',
          orders: createSeed(stateRef.current.today),
        })
        setOrderSync({
          persistence: 'memory',
          phase: 'idle',
          message:
            'Saved practice orders are not installed yet. These samples stay in this browser until you refresh. Run the Phase 3.1 SQL in the practice project only.',
        })
        return
      }

      dispatch({ type: 'replace-orders', orders: [] })
      setOrderSync({
        persistence: 'blocked',
        phase: 'error',
        message: practiceOrderFailureMessage(result),
      })
    }).catch(() => {
      if (!active) return
      dispatch({ type: 'replace-orders', orders: [] })
      setOrderSync({
        persistence: 'blocked',
        phase: 'error',
        message: practiceOrderFailureMessage({ status: 'unavailable' }),
      })
    })

    return () => {
      active = false
    }
  }, [client, proof.userId, proof.assurance])

  const api = useMemo<OperationsApi>(() => {
    const at = () => new Date().toISOString()
    const send = (action: OperationsAction) => {
      guardedDispatch(proof, dispatch, action)
    }

    async function commitSaved(
      preview: OperationsState,
      changed: PracticeOrder,
      mode: 'insert' | 'update',
      memoryAction: OperationsAction,
      successMessage: string,
      clearDraft: boolean,
      stamp: string,
    ): Promise<OrderWriteResult> {
      try {
        requireOwnerProof(proof)
      } catch {
        const message = practiceOrderFailureMessage({ status: 'refused' })
        setOrderSync((current) => failure(message, current))
        return { ok: false, message }
      }

      const decision = decidePracticeWrite(syncRef.current.persistence, changed)
      if (decision.kind === 'invalid') {
        setOrderSync((current) => failure(decision.message, current))
        return { ok: false, message: decision.message }
      }
      if (decision.kind === 'unavailable') {
        const message = syncRef.current.message ?? decision.message
        setOrderSync((current) => failure(message, current))
        return { ok: false, message }
      }
      if (decision.kind === 'memory') {
        send(memoryAction)
        setOrderSync({ persistence: 'memory', phase: 'saved', message: MEMORY_SAVE_MESSAGE })
        return { ok: true, message: MEMORY_SAVE_MESSAGE }
      }
      if (!client) {
        const message = practiceOrderFailureMessage({ status: 'unavailable' })
        setOrderSync({ persistence: 'blocked', phase: 'error', message })
        return { ok: false, message }
      }
      if (saving.current) {
        return { ok: false, message: 'A practice order is already being saved.' }
      }

      saving.current = true
      setOrderSync({
        persistence: 'database',
        phase: 'saving',
        message: orderSyncText({
          persistence: 'database',
          phase: 'saving',
          message: null,
        }),
      })
      try {
        const result = await savePracticeOrder(client, proof, changed, mode, stamp)
        if (result.status !== 'ok') {
          const message = practiceOrderFailureMessage(result)
          setOrderSync({ persistence: 'database', phase: 'error', message })
          return { ok: false, message }
        }
        send({
          type: 'commit-orders',
          orders: preview.orders.map((order) =>
            order.id === result.order.id ? result.order : order,
          ),
          feeNotice: preview.feeNotice,
          clearDraft,
        })
        setOrderSync({ persistence: 'database', phase: 'saved', message: successMessage })
        return { ok: true, message: successMessage }
      } catch {
        const message = practiceOrderFailureMessage({ status: 'unavailable' })
        setOrderSync({ persistence: 'database', phase: 'error', message })
        return { ok: false, message }
      } finally {
        saving.current = false
      }
    }

    return {
      state,
      orderSync,
      createOrder: async (draft) => {
        const stamp = at()
        const current = stateRef.current
        const action: OperationsAction = { type: 'create', draft, at: stamp }
        const preview = operationsReducer(current, action)
        const changed = freshOrder(current.orders, preview.orders)
        if (!changed) {
          const message = 'That practice order could not be prepared.'
          setOrderSync((sync) => failure(message, sync))
          return { ok: false, message }
        }
        return commitSaved(
          preview,
          changed,
          'insert',
          action,
          practiceWriteSuccess(changed.status),
          true,
          stamp,
        )
      },
      updateOrder: async (id, draft) => {
        const stamp = at()
        const current = stateRef.current
        const action: OperationsAction = { type: 'update', id, draft, at: stamp }
        const preview = operationsReducer(current, action)
        const changed = preview.orders.find((order) => order.id === id) ?? null
        if (!changed || !current.orders.some((order) => order.id === id)) {
          const message = 'That practice order is not on this screen.'
          setOrderSync((sync) => failure(message, sync))
          return { ok: false, message }
        }
        return commitSaved(
          preview,
          changed,
          'update',
          action,
          'Sample order updated. It stays after a refresh.',
          false,
          stamp,
        )
      },
      setStatus: async (id, status) => {
        const current = stateRef.current
        const existing = current.orders.find((order) => order.id === id)
        if (!existing) {
          const message = 'That practice order is not on this screen.'
          setOrderSync((sync) => failure(message, sync))
          return { ok: false, message }
        }
        if (existing.status === status) {
          return { ok: true, message: 'That status is already saved.' }
        }
        const stamp = at()
        const action: OperationsAction = { type: 'status', id, status, at: stamp }
        const preview = operationsReducer(current, action)
        const changed = preview.orders.find((order) => order.id === id)
        if (!changed) {
          const message = 'That practice order is not on this screen.'
          setOrderSync((sync) => failure(message, sync))
          return { ok: false, message }
        }
        return commitSaved(
          preview,
          changed,
          'update',
          action,
          practiceWriteSuccess(changed.status),
          false,
          stamp,
        )
      },
      reorder: (date, index, direction) => send({ type: 'reorder', date, index, direction }),
      updateRules: (rules) => send({ type: 'rules', rules }),
      updateWorkload: (rules) => send({ type: 'workload', rules }),
      updatePractice: (scenario) => send({ type: 'practice', scenario }),
      armDraft: () => send({ type: 'arm-draft' }),
      clearDraft: () => send({ type: 'clear-draft' }),
      toggleHours: (day) => send({ type: 'toggle-hours', day }),
      toggleService: (id) => send({ type: 'toggle-service', id }),
      toggleArea: (id) => send({ type: 'toggle-area', id }),
    }
  }, [state, proof, client, orderSync])

  return <OperationsContext.Provider value={api}>{children}</OperationsContext.Provider>
}

export function useOperations(): OperationsApi {
  const api = useContext(OperationsContext)
  if (!api) {
    throw new Error('Operations are only available inside the command center.')
  }

  return api
}
