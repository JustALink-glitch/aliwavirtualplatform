/** Splits a list into pages of 25 and clamps the current page. */
export function paginate<T>(items: T[], page: number, size = 25) {
  const pageCount = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(Math.max(1, page), pageCount)
  return { rows: items.slice((current - 1) * size, current * size), page: current, pageCount }
}
