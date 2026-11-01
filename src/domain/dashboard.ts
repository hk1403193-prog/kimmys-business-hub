import { calculateServiceQuote } from './pricing'
import {
  activePracticeStatuses,
  deliveryWindows,
  type PracticeOrder,
  type PricingRules,
  type WorkloadRules,
} from './types'
import { calculateWorkload } from './workload'

export type OperationsSummary = {
  fresh: number
  active: number
  completed: number
  expectedRevenue: number
  completedRevenue: number
  todayPoints: number
  todayMinutes: number
  todayRemainingPoints: number
  todayRemainingMinutes: number
  todayCompletedPoints: number
  todayCompletedMinutes: number
  todayEarnings: number
  upcoming: PracticeOrder[]
}

function windowRank(window: string): number {
  const index = (deliveryWindows as readonly string[]).indexOf(window)
  return index === -1 ? deliveryWindows.length : index
}

function sum(values: number[]): number {
  return Math.round(values.reduce((total, value) => total + value, 0) * 100) / 100
}

export type DayWorkload = {
  totalPoints: number
  totalMinutes: number
  remainingPoints: number
  remainingMinutes: number
  completedPoints: number
  completedMinutes: number
}

export function dayWorkload(
  orders: readonly PracticeOrder[],
  workloadRules: WorkloadRules,
  date: string,
): DayWorkload {
  const jobs = orders.filter(
    (order) => order.requestedDate === date && order.status !== 'Canceled',
  )
  const load = (group: readonly PracticeOrder[]) => {
    const items = group.map((order) =>
      calculateWorkload(workloadRules, order.scenario),
    )

    return {
      points: sum(items.map((item) => item.points)),
      minutes: sum(items.map((item) => item.minutes)),
    }
  }
  const total = load(jobs)
  const remaining = load(jobs.filter((order) => order.status !== 'Completed'))
  const completed = load(jobs.filter((order) => order.status === 'Completed'))

  return {
    totalPoints: total.points,
    totalMinutes: total.minutes,
    remainingPoints: remaining.points,
    remainingMinutes: remaining.minutes,
    completedPoints: completed.points,
    completedMinutes: completed.minutes,
  }
}

export function summarizeOperations(
  orders: readonly PracticeOrder[],
  rules: PricingRules,
  workloadRules: WorkloadRules,
  today: string,
): OperationsSummary {
  const detailed = orders.map((order) => ({
    order,
    quote: calculateServiceQuote(rules, order.scenario),
    workload: calculateWorkload(workloadRules, order.scenario),
  }))
  const expected = detailed.filter(
    (item) =>
      item.order.status !== 'Completed' && item.order.status !== 'Canceled',
  )
  const completed = detailed.filter((item) => item.order.status === 'Completed')
  const todayLoad = dayWorkload(orders, workloadRules, today)
  const upcoming = detailed
    .filter(
      (item) =>
        item.order.status !== 'Canceled' &&
        item.order.status !== 'Completed' &&
        item.order.requestedDate >= today,
    )
    .map((item) => item.order)
    .sort((left, right) => {
      const byDate = left.requestedDate.localeCompare(right.requestedDate)
      if (byDate !== 0) {
        return byDate
      }

      return windowRank(left.deliveryWindow) - windowRank(right.deliveryWindow)
    })

  return {
    fresh: detailed.filter((item) => item.order.status === 'New').length,
    active: detailed.filter((item) =>
      activePracticeStatuses.includes(item.order.status),
    ).length,
    completed: completed.length,
    expectedRevenue: sum(expected.map((item) => item.quote.earnings)),
    completedRevenue: sum(completed.map((item) => item.quote.earnings)),
    todayPoints: todayLoad.totalPoints,
    todayMinutes: todayLoad.totalMinutes,
    todayRemainingPoints: todayLoad.remainingPoints,
    todayRemainingMinutes: todayLoad.remainingMinutes,
    todayCompletedPoints: todayLoad.completedPoints,
    todayCompletedMinutes: todayLoad.completedMinutes,
    todayEarnings: sum(
      detailed
        .filter(
          (item) =>
            item.order.requestedDate === today &&
            item.order.status !== 'Canceled',
        )
        .map((item) => item.quote.earnings),
    ),
    upcoming,
  }
}
