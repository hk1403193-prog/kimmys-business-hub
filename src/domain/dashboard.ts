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
  const todayJobs = detailed.filter(
    (item) =>
      item.order.requestedDate === today && item.order.status !== 'Canceled',
  )
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
    todayPoints: sum(todayJobs.map((item) => item.workload.points)),
    todayMinutes: sum(todayJobs.map((item) => item.workload.minutes)),
    todayEarnings: sum(todayJobs.map((item) => item.quote.earnings)),
    upcoming,
  }
}
