import { describe, expect, it } from 'vitest'
import { summarizeOperations } from './dashboard'
import { blankDraft, draftFromOrder } from './seed'
import { createInitialState, operationsReducer } from './operations'
import { countsAsOpenWork, searchOrders } from './orders'
import { calculateServiceQuote } from './pricing'
import { completedOnDate, routeForDate } from './schedule'
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
  it('keeps a canceled order in history and removes it from upcoming deliveries', () => {
    let state = createInitialState(today)
    const draft = blankDraft(today, state.practice)
    draft.customer = 'Quinn Example'
    draft.scenario = { ...draft.scenario, adjustment: -80 }

    state = operationsReducer(state, { type: 'create', draft, at })
    const created = state.orders.find((order) => order.customer === 'Quinn Example')

    expect(created?.status).toBe('New')
    expect(created?.scenario.adjustment).toBe(0)
    expect(state.feeNotice).toMatch(/negative/i)
    expect(summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    ).upcoming.map((order) => order.id)).toContain(created?.id)

    state = operationsReducer(state, {
      type: 'status',
      id: created?.id ?? '',
      status: 'Canceled',
      at,
    })
    const summary = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )

    expect(state.orders.find((order) => order.id === created?.id)?.status).toBe(
      'Canceled',
    )
    expect(summary.upcoming.map((order) => order.id)).not.toContain(created?.id)
    expect(routeForDate(state.orders, today).map((order) => order.id)).not.toContain(
      created?.id,
    )
    expect(searchOrders(state.orders, 'quinn', 'Canceled')).toHaveLength(1)
  })
})

describe('delivered and completed', () => {
  it('keeps a delivered order upcoming until it is closed', () => {
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

    expect(state.orders.find((order) => order.id === 'S-1041')?.status).toBe(
      'Delivered',
    )
    expect(summary.upcoming.map((order) => order.id)).toContain('S-1041')
    expect(routeForDate(state.orders, today).map((order) => order.id)).toContain(
      'S-1041',
    )
    expect(summary.active).toBe(4)

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
    const closed = state.orders.find((order) => order.id === 'S-1041')

    expect(closed?.status).toBe('Completed')
    expect(closed?.timeline.map((entry) => entry.status)).toEqual([
      'Out for Delivery',
      'Delivered',
      'Completed',
    ])
    expect(summary.upcoming.map((order) => order.id)).not.toContain('S-1041')
    expect(routeForDate(state.orders, today).map((order) => order.id)).not.toContain(
      'S-1041',
    )
    expect(completedOnDate(state.orders, today).map((order) => order.id)).toContain(
      'S-1041',
    )
    expect(searchOrders(state.orders, 'blake', 'Completed').map((order) => order.id)).toEqual([
      'S-1041',
    ])
    expect(summary.completed).toBe(2)
    expect(summary.expectedRevenue).toBeLessThan(121)
    expect(summary.completedRevenue).toBeGreaterThan(8)
  })
})

describe('fee changes and dashboard totals', () => {
  it('uses the same service-fee rule for quotes, dashboard, and reports', () => {
    let state = createInitialState(today)
    const before = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )
    const openOrders = state.orders.filter((order) => countsAsOpenWork(order.status))
    const closedOrders = state.orders.filter((order) => order.status === 'Completed')
    const manualExpected = Math.round(
      openOrders.reduce(
        (total, order) =>
          total + calculateServiceQuote(state.rules, order.scenario).earnings,
        0,
      ) * 100,
    ) / 100

    expect(before.expectedRevenue).toBe(manualExpected)

    state = operationsReducer(state, {
      type: 'rules',
      rules: { ...state.rules, baseFee: state.rules.baseFee + 2 },
    })
    const after = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )

    expect(after.expectedRevenue).toBe(before.expectedRevenue + openOrders.length * 2)
    expect(after.completedRevenue).toBe(
      before.completedRevenue + closedOrders.length * 2,
    )
    expect(
      calculateServiceQuote(state.rules, state.orders[0].scenario).earnings,
    ).toBe(
      calculateServiceQuote(
        { ...state.rules, baseFee: state.rules.baseFee - 2 },
        state.orders[0].scenario,
      ).earnings + 2,
    )
  })

  it('rejects a negative adjustment and leaves the stored service fee unchanged', () => {
    let state = createInitialState(today)
    const before = calculateServiceQuote(state.rules, state.practice)

    state = operationsReducer(state, {
      type: 'practice',
      scenario: { ...state.practice, adjustment: -5 },
    })
    expect(state.practice.adjustment).toBe(-5)
    expect(state.feeNotice).toBeNull()
    expect(calculateServiceQuote(state.rules, state.practice).earnings).toBe(25)

    state = operationsReducer(state, {
      type: 'practice',
      scenario: { ...state.practice, adjustment: -80 },
    })
    const after = calculateServiceQuote(state.rules, state.practice)

    expect(state.practice.adjustment).toBe(-5)
    expect(state.feeNotice).toMatch(/negative/i)
    expect(after.adjustmentRejected).toBe(false)
    expect(after.earnings).toBe(25)
    expect(after.earnings).not.toBe(0)
    expect(after.merchandiseTotal).toBe(before.merchandiseTotal)
  })
})

describe('remaining and completed workload', () => {
  it('keeps the full day total and separates the work still open', () => {
    let state = createInitialState(today)
    const before = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )
    const avery = state.orders.find((order) => order.id === 'S-1042')
    const averyWork = calculateWorkload(
      state.workloadRules,
      avery?.scenario ?? state.practice,
    )

    expect(before.todayCompletedPoints).toBe(0)
    expect(before.todayRemainingPoints).toBe(before.todayPoints)
    expect(before.todayRemainingMinutes).toBe(before.todayMinutes)
    expect(before.upcoming.map((order) => order.id)).not.toContain('S-1029')
    expect(before.upcoming.map((order) => order.id)).not.toContain('S-1048')

    state = operationsReducer(state, {
      type: 'status',
      id: 'S-1042',
      status: 'Completed',
      at,
    })
    const after = summarizeOperations(
      state.orders,
      state.rules,
      state.workloadRules,
      today,
    )

    expect(after.todayPoints).toBe(before.todayPoints)
    expect(after.todayMinutes).toBe(before.todayMinutes)
    expect(after.todayRemainingPoints).toBe(before.todayRemainingPoints - averyWork.points)
    expect(after.todayRemainingMinutes).toBe(
      before.todayRemainingMinutes - averyWork.minutes,
    )
    expect(after.todayCompletedPoints).toBe(averyWork.points)
    expect(after.todayCompletedMinutes).toBe(averyWork.minutes)
    expect(after.upcoming.map((order) => order.id)).not.toContain('S-1042')
    expect(routeForDate(state.orders, today).map((order) => order.id)).not.toContain(
      'S-1042',
    )
    expect(state.orders.find((order) => order.id === 'S-1042')?.status).toBe(
      'Completed',
    )
  })
})

describe('refresh', () => {
  it('starts again from the fictional sample when a session is created', () => {
    let state = createInitialState(today)
    const original = state.orders.map((order) => `${order.id}:${order.status}`)

    state = operationsReducer(state, {
      type: 'status',
      id: 'S-1042',
      status: 'Canceled',
      at,
    })
    state = operationsReducer(state, {
      type: 'rules',
      rules: { ...state.rules, baseFee: 20 },
    })
    state = operationsReducer(state, {
      type: 'practice',
      scenario: { ...state.practice, adjustment: -4 },
    })

    const refreshed = createInitialState(today)

    expect(refreshed.orders.map((order) => `${order.id}:${order.status}`)).toEqual(
      original,
    )
    expect(refreshed.rules.baseFee).toBe(8)
    expect(refreshed.practice.adjustment).toBe(0)
    expect(refreshed.feeNotice).toBeNull()
    expect(state.orders.find((order) => order.id === 'S-1042')?.status).toBe(
      'Canceled',
    )
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
