import type { SampleMoneyItem } from '../sample/types'

export function roundMoney(amount: number): number {
  if (!Number.isFinite(amount)) {
    return 0
  }

  return Math.round(Math.max(0, amount) * 100) / 100
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(roundMoney(amount))
}

export function formatSignedMoney(amount: number): string {
  const rounded = Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(rounded)
}

export function summarizeMoney(items: readonly SampleMoneyItem[]) {
  const income = roundMoney(
    items
      .filter((item) => item.kind === 'Income')
      .reduce((sum, item) => sum + item.amount, 0),
  )
  const expenses = roundMoney(
    items
      .filter((item) => item.kind === 'Expense')
      .reduce((sum, item) => sum + item.amount, 0),
  )

  return {
    income,
    expenses,
    profit: Math.round((income - expenses) * 100) / 100,
  }
}
