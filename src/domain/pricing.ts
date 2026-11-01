import { roundMoney } from '../lib/money'
import type {
  FeeKey,
  PricingRules,
  QuoteLine,
  QuoteScenario,
  ServiceQuote,
} from './types'

export const negativeServiceFeeMessage =
  'That change would make the service fee negative, so it was not applied. A service fee cannot go below zero. Merchandise stays separate and was not changed.'

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
  const requestedAdjustment = dollars(scenario.adjustment)
  const unadjustedEarnings = dollars(serviceSubtotal - discount)
  const rawEarnings = dollars(unadjustedEarnings + requestedAdjustment)
  const adjustmentRejected = rawEarnings < 0
  const adjustment = adjustmentRejected ? 0 : requestedAdjustment
  const earnings = adjustmentRejected ? unadjustedEarnings : rawEarnings
  const dueSubtotal = dollars(
    lines
      .filter((line) => line.dueBeforeShopping)
      .reduce((sum, line) => sum + line.amount, 0),
  )
  const dueAfterDiscount = dollars(
    dueSubtotal - Math.min(discount, dueSubtotal),
  )
  const rawDue = dollars(dueAfterDiscount + adjustment)
  const dueBeforeShopping = dollars(Math.min(earnings, Math.max(0, rawDue)))

  return {
    lines,
    extraMiles,
    serviceSubtotal,
    discount,
    adjustment,
    requestedAdjustment,
    adjustmentRejected,
    validationMessage: adjustmentRejected ? negativeServiceFeeMessage : null,
    dueNote:
      !adjustmentRejected && rawDue < 0
        ? 'The manual adjustment is larger than the fees due before shopping, so nothing is due before shopping. The service fee stays separate from merchandise.'
        : null,
    merchandiseTotal,
    earnings,
    dueBeforeShopping,
  }
}

export function acceptScenario(
  rules: PricingRules,
  current: QuoteScenario,
  next: QuoteScenario,
): { scenario: QuoteScenario; message: string | null } {
  const quote = calculateServiceQuote(rules, next)
  if (!quote.adjustmentRejected) {
    return { scenario: next, message: null }
  }

  const keptAdjustment = { ...next, adjustment: current.adjustment }
  if (!calculateServiceQuote(rules, keptAdjustment).adjustmentRejected) {
    return {
      scenario: keptAdjustment,
      message: quote.validationMessage,
    }
  }

  return { scenario: current, message: quote.validationMessage }
}
