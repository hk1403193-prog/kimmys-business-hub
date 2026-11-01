import { describe, expect, it } from 'vitest'
import { calculateServiceQuote } from './pricing'
import { defaultPracticeScenario, defaultPricingRules } from './seed'

const rules = defaultPricingRules()
const practice = defaultPracticeScenario()

describe('calculateServiceQuote', () => {
  it('keeps merchandise separate from the familiar $30 practice quote', () => {
    const quote = calculateServiceQuote(rules, practice)

    expect(quote.merchandiseTotal).toBe(20)
    expect(quote.extraMiles).toBe(2)
    expect(quote.lines.find((line) => line.key === 'base')?.amount).toBe(8)
    expect(quote.lines.find((line) => line.key === 'mileage')?.amount).toBe(3)
    expect(quote.lines.find((line) => line.key === 'shopping')?.amount).toBe(15)
    expect(quote.lines.find((line) => line.key === 'smallOrder')?.amount).toBe(4)
    expect(quote.earnings).toBe(30)
    expect(quote.dueBeforeShopping).toBe(27)
  })

  it('uses editable rules instead of hidden fees', () => {
    const quote = calculateServiceQuote(
      { ...rules, baseFee: 10, rushFee: 12 },
      { ...practice, rush: true },
    )

    expect(quote.earnings).toBe(44)
  })

  it('adds mileage, area, stops, rush, waiting, and a shopping tier', () => {
    const quote = calculateServiceQuote(rules, {
      ...practice,
      miles: 4,
      serviceAreaId: 'surrounding',
      extraStops: 1,
      rush: true,
      waitingMinutes: 20,
      shoppingTierId: 'standard',
      merchandiseTotal: 64,
    })

    expect(quote.lines.find((line) => line.key === 'mileage')?.amount).toBe(1.5)
    expect(quote.lines.find((line) => line.key === 'serviceArea')?.amount).toBe(6)
    expect(quote.lines.find((line) => line.key === 'extraStops')?.amount).toBe(4)
    expect(quote.lines.find((line) => line.key === 'rush')?.amount).toBe(10)
    expect(quote.lines.find((line) => line.key === 'waiting')?.amount).toBe(10)
    expect(quote.lines.find((line) => line.key === 'shopping')?.amount).toBe(22)
    expect(quote.lines.find((line) => line.key === 'smallOrder')?.amount).toBe(0)
    expect(quote.earnings).toBe(61.5)
  })

  it('skips the small-order fee once merchandise reaches the threshold', () => {
    const quote = calculateServiceQuote(rules, {
      ...practice,
      merchandiseTotal: 25,
      shoppingTierId: 'none',
      miles: 2,
    })

    expect(quote.lines.find((line) => line.key === 'smallOrder')?.amount).toBe(0)
    expect(quote.earnings).toBe(8)
  })

  it('applies discounts and manual adjustments without touching merchandise', () => {
    const discounted = calculateServiceQuote(rules, { ...practice, discount: 5 })
    const adjusted = calculateServiceQuote(rules, {
      ...practice,
      adjustment: -5,
    })
    const capped = calculateServiceQuote(rules, { ...practice, discount: 40 })

    expect(discounted.merchandiseTotal).toBe(20)
    expect(discounted.earnings).toBe(25)
    expect(discounted.dueBeforeShopping).toBe(22)
    expect(adjusted.earnings).toBe(25)
    expect(adjusted.dueBeforeShopping).toBe(22)
    expect(capped.earnings).toBe(0)
    expect(capped.dueBeforeShopping).toBe(0)
  })

  it('treats invalid trip numbers as zero', () => {
    const quote = calculateServiceQuote(rules, {
      ...practice,
      miles: Number.NaN,
      merchandiseTotal: -10,
      shoppingTierId: 'missing',
    })

    expect(quote.extraMiles).toBe(0)
    expect(quote.merchandiseTotal).toBe(0)
    expect(quote.lines.find((line) => line.key === 'shopping')?.amount).toBe(0)
  })
})
