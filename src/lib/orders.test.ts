import { describe, expect, it } from 'vitest'
import { sampleOrders } from '../sample/data'
import { filterOrders, summarizeOrders } from './orders'

describe('filterOrders', () => {
  it('splits the fictional orders into new, active, and done', () => {
    expect(filterOrders(sampleOrders, 'All')).toHaveLength(6)
    expect(filterOrders(sampleOrders, 'New').map((order) => order.id)).toEqual([
      'S-1042',
    ])
    expect(filterOrders(sampleOrders, 'Active').map((order) => order.id)).toEqual([
      'S-1041',
      'S-1038',
      'S-1036',
    ])
    expect(filterOrders(sampleOrders, 'Done').map((order) => order.id)).toEqual([
      'S-1033',
      'S-1029',
    ])
  })
})

describe('summarizeOrders', () => {
  it('totals the open sample day', () => {
    expect(summarizeOrders(sampleOrders)).toEqual({
      total: 6,
      fresh: 1,
      active: 3,
      open: 4,
      expected: 177,
    })
  })
})
