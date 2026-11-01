import { describe, expect, it } from 'vitest'
import { summarizeOperations } from './dashboard'
import { blankDraft, draftFromOrder } from './seed'
import { createInitialState, operationsReducer } from './operations'
import { searchOrders } from './orders'
import { calculateServiceQuote, negativeServiceFeeMessage } from './pricing'
import { routeForDate } from './schedule'
import { calculateWorkload } from './workload'

const today = '2026-11-01'
const at = '2026-11-01T18:00:00.000Z'

describe('order creation and editing', () => {
  it('adds a fictional order and then saves edits', () => {
    let state = createInitialState(today)
    const draft = blankDraft(today, state.practice)
    draft.customer = 'Riley Sample'
    draft.shoppingText = 'Practice crackers'
    draft.instructions = 'Fictional porch drop.'

    state = operationsReducer(state, { type: 'create', draft, at })
    const created = state.orders.find((order) => order.customer === 'Riley Sample')

    expect(created).toMatchObject({
      status: 'New',
      shoppingList: ['Practice crackers'],
      instructions: 'Fictional porch drop.',
    })
    expect(created?.timeline).toHaveLength(1)

    state = operationsReducer(state, {
      type: 'update',
      id: created?.id ?? '',
      draft: {
        ...draft,
        customer: 'Riley Example',
        shoppingText: 'Practice crackers\nPractice tea',
        instructions: 'Updated fictional note.',
      },
      at,
    })
    const edited = state.orders.find((order) => order.id === created?.id)

    expect(edited?.customer).toBe('Riley Example')
    expect(edited?.shoppingList).toEqual(['Practice crackers', 'Practice tea'])
    expect(edited?.scenario.itemCount).toBe(2)
    expect(edited?.timeline.at(-1)?.note).toBe('Sample details updated.')
  })
})

describe('status changes', () => {
  it('records each status and can complete or cancel a sample order', () => {
    let state = createInitialState(today)

    state = operationsReducer(state, {
      type: 'status',
      id: 'S-1042',
      status: 'Quoted',
      at,
    })
    state = operationsReducer(state, {
      type: 'status',
      id: 'S-1042',
      status: 'Completed',
      at,
    })

    const completed = state.orders.find((order) => order.id === 'S-1042')
    expect(completed?.status).toBe('Completed')
    expect(completed?.timeline.map((entry) => entry.status)).toEqual([
      'New',
      'Quoted',
      'Completed',
    ])

    state = operationsReducer(state, {
      type: 'status',
      id: 'S-1041',
      status: 'Canceled',
      at,
    })
    expect(state.orders.find((order) => order.id === 'S-1041')?.status).toBe(
      'Canceled',
    )
    expect(searchOrders(state.orders, 'blake', 'Canceled').map((order) => order.id)).toEqual([
      'S-1041',
    ])
  })

  it('searches fictional orders by item text', () => {
    const state = createInitialState(today)

    expect(searchOrders(state.orders, 'apples', 'All').map((order) => order.id)).toEqual([
      'S-1042',
    ])
    expect(searchOrders(state.orders, 'blake', 'New')).toEqual([])
  })
})

describe('dashboard totals', () => {
  it('sums live service revenue, workload, and upcoming stops', () => {
    const state = createInitialState(today)
    const summary = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )

    expect(summary.fresh).toBe(1)
    expect(summary.active).toBe(4)
    expect(summary.completed).toBe(1)
    expect(summary.expectedRevenue).toBe(121)
    expect(summary.completedRevenue).toBe(8)
    expect(summary.todayPoints).toBe(9)
    expect(summary.todayMinutes).toBe(118)
    expect(summary.todayEarnings).toBe(75.5)
    expect(summary.upcoming.map((order) => order.id)).toEqual([
      'S-1041',
      'S-1038',
      'S-1042',
      'S-1036',
    ])
  })

  it('updates totals when a sample order is completed', () => {
    let state = createInitialState(today)
    const avery = state.orders.find((order) => order.id === 'S-1042')
    const averyEarnings = calculateServiceQuote(
      state.rules,
      avery?.scenario ?? state.practice,
    ).earnings

    state = operationsReducer(state, {
      type: 'status',
      id: 'S-1042',
      status: 'Completed',
      at,
    })
    const summary = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )

    expect(averyEarnings).toBe(26)
    expect(summary.fresh).toBe(0)
    expect(summary.completed).toBe(2)
    expect(summary.completedRevenue).toBe(34)
    expect(summary.expectedRevenue).toBe(95)
  })
})

describe('creating and canceling orders', () => {
  it('adds service revenue without merchandise and removes a canceled order', () => {
    let state = createInitialState(today)
    const draft = blankDraft(today, state.practice)
    draft.customer = 'Riley Sample'
    draft.scenario = { ...draft.scenario, merchandiseTotal: 80 }

    state = operationsReducer(state, { type: 'create', draft, at })
    const created = state.orders[0]
    const createdFee = calculateServiceQuote(state.rules, created.scenario)
    let summary = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )

    expect(created.customer).toBe('Riley Sample')
    expect(created.status).toBe('New')
    expect(createdFee.merchandiseTotal).toBe(80)
    expect(createdFee.earnings).toBe(26)
    expect(summary.fresh).toBe(2)
    expect(summary.expectedRevenue).toBe(147)
    expect(summary.todayRemainingPoints).toBe(12)

    state = operationsReducer(state, {
      type: 'status',
      id: 'S-1041',
      status: 'Canceled',
      at,
    })
    summary = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )

    expect(summary.expectedRevenue).toBe(139)
    expect(summary.completedRevenue).toBe(8)
    expect(summary.todayPoints).toBe(10)
    expect(summary.todayRemainingPoints).toBe(10)
    expect(summary.todayCompletedPoints).toBe(0)
    expect(summary.upcoming.map((order) => order.id)).not.toContain('S-1041')
    expect(routeForDate(state.orders, today).map((order) => order.id)).not.toContain(
      'S-1041',
    )
    expect(state.orders.find((order) => order.id === 'S-1041')?.status).toBe(
      'Canceled',
    )
  })
})

describe('delivered and completed', () => {
  it('keeps a delivered order open, then closes it', () => {
    let state = createInitialState(today)

    state = operationsReducer(state, {
      type: 'status',
      id: 'S-1041',
      status: 'Delivered',
      at,
    })
    let summary = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )

    expect(summary.upcoming.map((order) => order.id)).toContain('S-1041')
    expect(summary.expectedRevenue).toBe(121)
    expect(summary.completedRevenue).toBe(8)
    expect(summary.active).toBe(4)
    expect(summary.todayRemainingPoints).toBe(9)
    expect(summary.todayCompletedPoints).toBe(0)

    state = operationsReducer(state, {
      type: 'status',
      id: 'S-1041',
      status: 'Completed',
      at,
    })
    summary = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )

    expect(summary.upcoming.map((order) => order.id)).not.toContain('S-1041')
    expect(summary.upcoming.map((order) => order.id)).not.toContain('S-1048')
    expect(summary.expectedRevenue).toBe(113)
    expect(summary.completedRevenue).toBe(16)
    expect(summary.active).toBe(3)
    expect(summary.todayPoints).toBe(9)
    expect(summary.todayRemainingPoints).toBe(7)
    expect(summary.todayCompletedPoints).toBe(2)
    expect(summary.todayRemainingMinutes).toBe(93)
    expect(summary.todayCompletedMinutes).toBe(25)
    expect(routeForDate(state.orders, today).map((order) => order.id)).not.toContain(
      'S-1041',
    )
    expect(state.orders.find((order) => order.id === 'S-1041')?.status).toBe(
      'Completed',
    )
  })
})

describe('fee changes and refresh', () => {
  it('updates dashboard totals when the shared base fee changes', () => {
    let state = createInitialState(today)
    state = operationsReducer(state, {
      type: 'rules',
      rules: { ...state.rules, baseFee: 9 },
    })
    const summary = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )

    expect(summary.expectedRevenue).toBe(126)
    expect(summary.completedRevenue).toBe(9)
    expect(summary.todayEarnings).toBe(78.5)
  })

  it('rejects a manual adjustment that would make the service fee negative', () => {
    let state = createInitialState(today)
    state = operationsReducer(state, {
      type: 'practice',
      scenario: { ...state.practice, adjustment: -100 },
    })
    const quote = calculateServiceQuote(state.rules, state.practice)

    expect(state.practice.adjustment).toBe(0)
    expect(state.feeNotice).toBe(negativeServiceFeeMessage)
    expect(quote.earnings).toBe(30)
    expect(quote.adjustmentRejected).toBe(false)
    expect(quote.merchandiseTotal).toBe(20)
  })

  it('restores the original sample session on a fresh load', () => {
    let state = createInitialState(today)
    const originalIds = state.orders.map((order) => order.id)

    state = operationsReducer(state, {
      type: 'rules',
      rules: { ...state.rules, baseFee: 20 },
    })
    state = operationsReducer(state, {
      type: 'status',
      id: 'S-1042',
      status: 'Completed',
      at,
    })
    state = operationsReducer(state, {
      type: 'practice',
      scenario: { ...state.practice, adjustment: -4 },
    })

    const reloaded = createInitialState(today)

    expect(reloaded.rules.baseFee).toBe(8)
    expect(reloaded.practice.adjustment).toBe(0)
    expect(reloaded.feeNotice).toBeNull()
    expect(reloaded.orders.map((order) => order.id)).toEqual(originalIds)
    expect(reloaded.orders.find((order) => order.id === 'S-1042')).toMatchObject({
      status: 'New',
      timeline: [expect.objectContaining({ status: 'New' })],
    })
    expect(state.rules.baseFee).toBe(20)
  })
})

describe('workload calculations', () => {
  it('uses editable planning rules and does not invent a drive time', () => {
    const state = createInitialState(today)
    const casey = state.orders.find((order) => order.id === 'S-1038')
    const work = calculateWorkload(
      state.workloadRules,
      casey?.scenario ?? state.practice,
    )

    expect(work).toEqual({ points: 4, minutes: 59 })

    const heavier = calculateWorkload(
      { ...state.workloadRules, baseMinutes: 40, minutesPerItem: 1 },
      casey?.scenario ?? state.practice,
    )
    expect(heavier.minutes).toBe(58)
  })
})

describe('route reordering', () => {
  it('moves a sample stop later without dropping the rest of the day', () => {
    let state = createInitialState(today)
    const before = routeForDate(state.orders, today).map((order) => order.id)

    state = operationsReducer(state, {
      type: 'reorder',
      date: today,
      index: 0,
      direction: 1,
    })
    const after = routeForDate(
      state.orders,
      today,
      state.routeIdsByDate[today],
    ).map((order) => order.id)

    expect(before).toEqual(['S-1041', 'S-1038', 'S-1042'])
    expect(after).toEqual(['S-1038', 'S-1041', 'S-1042'])
  })

  it('keeps an edited order on the day it belongs to', () => {
    let state = createInitialState(today)
    const blake = state.orders.find((order) => order.id === 'S-1041')
    if (!blake) {
      throw new Error('Missing sample order')
    }

    state = operationsReducer(state, {
      type: 'update',
      id: blake.id,
      draft: { ...draftFromOrder(blake), requestedDate: '2026-11-02' },
      at,
    })

    expect(routeForDate(state.orders, today).map((order) => order.id)).toEqual([
      'S-1038',
      'S-1042',
    ])
    expect(routeForDate(state.orders, '2026-11-02').map((order) => order.id)).toContain(
      'S-1041',
    )
  })
})
