import { roundMoney } from '../lib/money'
import type { QuoteScenario, WorkloadRules } from './types'

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
