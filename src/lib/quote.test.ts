import { describe, expect, it } from 'vitest'
import { calculateSampleQuote, stepValue } from './quote'

const practiceQuote = {
  baseFee: 8,
  perExtraMile: 1.5,
  includedMiles: 3,
  miles: 5,
  subtotal: 20,
  smallOrderThreshold: 25,
  smallOrderFee: 4,
  shopping: true,
  shoppingFee: 15,
}

describe('calculateSampleQuote', () => {
  it('adds extra miles, a small-order fee, and shopping', () => {
    expect(calculateSampleQuote(practiceQuote)).toEqual({
      extraMiles: 2,
      deliveryFee: 11,
      smallOrderFee: 4,
      shoppingFee: 15,
      total: 30,
    })
  })

  it('skips the small-order fee once the subtotal reaches the threshold', () => {
    const result = calculateSampleQuote({
      ...practiceQuote,
      subtotal: 25,
      shopping: false,
      miles: 2,
    })

    expect(result.extraMiles).toBe(0)
    expect(result.deliveryFee).toBe(8)
    expect(result.smallOrderFee).toBe(0)
    expect(result.shoppingFee).toBe(0)
    expect(result.total).toBe(8)
  })

  it('treats invalid numbers as zero', () => {
    const result = calculateSampleQuote({
      ...practiceQuote,
      baseFee: Number.NaN,
      miles: -4,
      shopping: false,
    })

    expect(result.deliveryFee).toBe(0)
    expect(result.extraMiles).toBe(0)
    expect(result.total).toBe(result.smallOrderFee)
  })
})

describe('stepValue', () => {
  it('stays inside the allowed range', () => {
    expect(stepValue(0, -1, 0, 10)).toBe(0)
    expect(stepValue(10, 1, 0, 10)).toBe(10)
    expect(stepValue(1.5, 0.25, 0, 10)).toBe(1.75)
  })
})
