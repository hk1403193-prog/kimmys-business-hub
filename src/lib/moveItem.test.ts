import { describe, expect, it } from 'vitest'
import { moveItem } from './moveItem'

describe('moveItem', () => {
  it('moves an item later or earlier without changing the original list', () => {
    const original = ['Blake', 'Casey', 'Avery']

    expect(moveItem(original, 0, 1)).toEqual(['Casey', 'Blake', 'Avery'])
    expect(moveItem(original, 2, -1)).toEqual(['Blake', 'Avery', 'Casey'])
    expect(original).toEqual(['Blake', 'Casey', 'Avery'])
  })

  it('leaves the ends in place', () => {
    const original = ['Blake', 'Casey']

    expect(moveItem(original, 0, -1)).toEqual(original)
    expect(moveItem(original, 1, 1)).toEqual(original)
  })
})
