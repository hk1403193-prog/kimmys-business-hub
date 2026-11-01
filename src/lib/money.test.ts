import { describe, expect, it } from 'vitest'
import { sampleMoneyItems } from '../sample/data'
import { formatMoney, summarizeMoney } from './money'

describe('summarizeMoney', () => {
  it('adds the fictional week into income, expenses, and profit', () => {
    expect(summarizeMoney(sampleMoneyItems)).toEqual({
      income: 728,
      expenses: 105,
      profit: 623,
    })
  })
})

describe('formatMoney', () => {
  it('shows dollars and cents', () => {
    expect(formatMoney(1.5)).toBe('$1.50')
  })
})
