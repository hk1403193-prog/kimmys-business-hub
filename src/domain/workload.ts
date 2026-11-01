import { roundMoney } from '../lib/money'
import type { PracticeOrder, QuoteScenario, WorkloadRules } from './types'

export type Workload = {
  points: number
  minutes: number
}

export function calculateWorkload(
  rules: WorkloadRules,
  scenario: QuoteScenario,
): Workload {
  const extraStops = Math.max(0, Math.round(scenario.extraStops))
  const items = Math.max(0, Math.round(scenario.itemCount))
  const shopping = scenario.shoppingTierId !== 'none'
  const points =
    roundMoney(rules.basePoints) +
    extraStops * roundMoney(rules.pointsPerExtraStop) +
    (scenario.rush ? roundMoney(rules.rushPoints) : 0) +
    (shopping ? roundMoney(rules.shoppingPoints) : 0)
  const minutes =
    roundMoney(rules.baseMinutes) +
    extraStops * roundMoney(rules.minutesPerExtraStop) +
    items * roundMoney(rules.minutesPerItem) +
    (scenario.rush ? roundMoney(rules.rushMinutes) : 0)

  return {
    points: roundMoney(points),
    minutes: roundMoney(minutes),
  }
}

export type DayWorkload = {
  totalPoints: number
  totalMinutes: number
  remainingPoints: number
  remainingMinutes: number
  completedPoints: number
  completedMinutes: number
}

function sumWorkload(
  rules: WorkloadRules,
  orders: readonly PracticeOrder[],
): Workload {
  const totals = orders.reduce(
    (sum, order) => {
      const work = calculateWorkload(rules, order.scenario)
      return {
        points: sum.points + work.points,
        minutes: sum.minutes + work.minutes,
      }
    },
    { points: 0, minutes: 0 },
  )

  return {
    points: roundMoney(totals.points),
    minutes: roundMoney(totals.minutes),
  }
}

export function summarizeDayWorkload(
  orders: readonly PracticeOrder[],
  rules: WorkloadRules,
  date: string,
): DayWorkload {
  const onDay = orders.filter(
    (order) => order.requestedDate === date && order.status !== 'Canceled',
  )
  const remaining = sumWorkload(
    rules,
    onDay.filter((order) => order.status !== 'Completed'),
  )
  const completed = sumWorkload(
    rules,
    onDay.filter((order) => order.status === 'Completed'),
  )
  const total = sumWorkload(rules, onDay)

  return {
    totalPoints: total.points,
    totalMinutes: total.minutes,
    remainingPoints: remaining.points,
    remainingMinutes: remaining.minutes,
    completedPoints: completed.points,
    completedMinutes: completed.minutes,
  }
}
