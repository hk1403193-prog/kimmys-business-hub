import { countsAsOpenWork, isUpcomingOrder } from './orders'
import { calculateServiceQuote } from './pricing'
import {
  activePracticeStatuses,
  deliveryWindows,
  type PracticeOrder,
  type PricingRules,
  type WorkloadRules,
} from './types'
import { summarizeDayWorkload } from './workload'

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
  todayRemainingEarnings: number
  todayCompletedEarnings: number
  upcoming: PracticeOrder[]
}

function windowRank(window: string): number {
  const index = (deliveryWindows as readonly string[]).indexOf(window)
  return index === -1 ? deliveryWindows.length : index
}

function sum(values: number[]): number {
  return Math.round(values.reduce((total, value) => total + value, 0) * 100) / 100
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
  }))
  const day = summarizeDayWorkload(orders, workloadRules, today)
  const expected = detailed.filter((item) =>
    countsAsOpenWork(item.order.status),
  )
  const completed = detailed.filter((item) => item.order.status === 'Completed')
  const todayJobs = detailed.filter(
    (item) =>
      item.order.requestedDate === today && item.order.status !== 'Canceled',
  )
  const todayRemaining = todayJobs.filter((item) =>
    countsAsOpenWork(item.order.status),
  )
  const todayCompleted = todayJobs.filter(
    (item) => item.order.status === 'Completed',
  )
  const todayRemainingEarnings = sum(
    todayRemaining.map((item) => item.quote.earnings),
  )
  const todayCompletedEarnings = sum(
    todayCompleted.map((item) => item.quote.earnings),
  )
  const upcoming = detailed
    .filter((item) => isUpcomingOrder(item.order, today))
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
    todayPoints: day.totalPoints,
    todayMinutes: day.totalMinutes,
    todayRemainingPoints: day.remainingPoints,
    todayRemainingMinutes: day.remainingMinutes,
    todayCompletedPoints: day.completedPoints,
    todayCompletedMinutes: day.completedMinutes,
    todayRemainingEarnings,
    todayCompletedEarnings,
    todayEarnings: sum([todayRemainingEarnings, todayCompletedEarnings]),
    upcoming,
  }
}
