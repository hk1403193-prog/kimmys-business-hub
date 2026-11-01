import { roundMoney } from './money'

export type QuoteInput = {
  baseFee: number
  perExtraMile: number
  includedMiles: number
  miles: number
  subtotal: number
  smallOrderThreshold: number
  smallOrderFee: number
  shopping: boolean
  shoppingFee: number
}

export type QuoteResult = {
  extraMiles: number
  deliveryFee: number
  smallOrderFee: number
  shoppingFee: number
  total: number
}

export function calculateSampleQuote(input: QuoteInput): QuoteResult {
  const baseFee = roundMoney(input.baseFee)
  const perExtraMile = roundMoney(input.perExtraMile)
  const includedMiles = roundMoney(input.includedMiles)
  const miles = roundMoney(input.miles)
  const extraMiles = roundMoney(Math.max(0, miles - includedMiles))
  const deliveryFee = roundMoney(baseFee + extraMiles * perExtraMile)
  const smallOrderFee =
    roundMoney(input.subtotal) < roundMoney(input.smallOrderThreshold)
      ? roundMoney(input.smallOrderFee)
      : 0
  const shoppingFee = input.shopping ? roundMoney(input.shoppingFee) : 0

  return {
    extraMiles,
    deliveryFee,
    smallOrderFee,
    shoppingFee,
    total: roundMoney(deliveryFee + smallOrderFee + shoppingFee),
  }
}

export function stepValue(
  value: number,
  delta: number,
  min: number,
  max: number,
): number {
  const next = Math.round((value + delta) * 100) / 100
  return Math.min(max, Math.max(min, next))
}
