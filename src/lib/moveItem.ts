export function moveItem<T>(
  items: readonly T[],
  index: number,
  direction: -1 | 1,
): T[] {
  const nextIndex = index + direction

  if (
    index < 0 ||
    index >= items.length ||
    nextIndex < 0 ||
    nextIndex >= items.length
  ) {
    return [...items]
  }

  const copy = [...items]
  const [item] = copy.splice(index, 1)
  copy.splice(nextIndex, 0, item)
  return copy
}
