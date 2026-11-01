import { roundMoney } from '../lib/money'
import type {
  FeeKey,
  PricingRules,
  QuoteLine,
  QuoteScenario,
  ServiceQuote,
} from './types'

function dollars(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0
  }

  return Math.round(amount * 100) / 100
}

export function calculateServiceQuote(
  rules: PricingRules,
  scenario: QuoteScenario,
): ServiceQuote {
  const miles = roundMoney(scenario.miles)
  const includedMiles = roundMoney(rules.includedMiles)
  const extraMiles = roundMoney(Math.max(0, miles - includedMiles))
  const area = rules.serviceAreas.find(
    (item) => item.id === scenario.serviceAreaId,
  )
  const tier = rules.shoppingTiers.find(
    (item) => item.id === scenario.shoppingTierId,
  )
  const extraStops = Math.max(0, Math.round(scenario.extraStops))
  const blockMinutes = Math.max(1, Math.round(rules.waitingBlockMinutes))
  const waitingMinutes = roundMoney(scenario.waitingMinutes)
  const waitingBlocks =
    waitingMinutes <= 0 ? 0 : Math.ceil(waitingMinutes / blockMinutes)
  const merchandiseTotal = roundMoney(scenario.merchandiseTotal)
  const smallOrder =
    rules.smallOrderEnabled &&
    merchandiseTotal < roundMoney(rules.smallOrderThreshold)
      ? roundMoney(rules.smallOrderFee)
      : 0

  const amounts: Record<FeeKey, number> = {
    base: roundMoney(rules.baseFee),
    mileage: roundMoney(extraMiles * roundMoney(rules.perExtraMile)),
    serviceArea: roundMoney(area?.fee ?? 0),
    extraStops: roundMoney(extraStops * roundMoney(rules.extraStopFee)),
    rush: scenario.rush ? roundMoney(rules.rushFee) : 0,
    waiting: roundMoney(waitingBlocks * roundMoney(rules.waitingBlockFee)),
    shopping: roundMoney(tier?.fee ?? 0),
    smallOrder,
  }

  const labels: Record<FeeKey, string> = {
    base: 'Delivery base fee',
    mileage: 'Mileage fee',
    serviceArea: 'Service-area fee',
    extraStops: 'Additional stops',
    rush: 'Rush delivery',
    waiting: 'Waiting time',
    shopping: 'Shopping fee',
    smallOrder: 'Small-order fee',
  }

  const lines: QuoteLine[] = (Object.keys(amounts) as FeeKey[]).map((key) => ({
    key,
    label: labels[key],
    amount: amounts[key],
    dueBeforeShopping: rules.dueBeforeShopping[key],
  }))

  const serviceSubtotal = dollars(
    lines.reduce((sum, line) => sum + line.amount, 0),
  )
  const discount = Math.min(roundMoney(scenario.discount), serviceSubtotal)
  const adjustment = dollars(scenario.adjustment)
  const dueSubtotal = dollars(
    lines
      .filter((line) => line.dueBeforeShopping)
      .reduce((sum, line) => sum + line.amount, 0),
  )

  return {
    lines,
    extraMiles,
    serviceSubtotal,
    discount,
    adjustment,
    merchandiseTotal,
    earnings: dollars(serviceSubtotal - discount + adjustment),
    dueBeforeShopping: dollars(
      dueSubtotal - Math.min(discount, dueSubtotal) + adjustment,
    ),
  }
}
