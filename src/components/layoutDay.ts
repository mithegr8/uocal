import type { GridItem } from './gridConfig'
import { toMinutes } from '../lib/dates'

// A block plus where it sits across the width of its day.
export type PlacedItem = GridItem & {
  column: number // 0 = leftmost
  columnCount: number // how many columns share this time
}

// Places one day's blocks so that overlapping ones sit side by side.
export function layoutDay(items: GridItem[]): PlacedItem[] {
  // 1. Sort by start time (longest first when two start together).
  const sorted = [...items].sort(
    (a, b) => toMinutes(a.start) - toMinutes(b.start) || toMinutes(b.end) - toMinutes(a.end),
  )

  const placed: PlacedItem[] = []
  let group: PlacedItem[] = [] // blocks that overlap each other, directly or through a chain
  let columnEnds: number[] = [] // for each column: when its last block ends
  let groupEnd = 0 // when the whole group ends

  // When a group is finished, every block in it gets the same number of columns.
  function closeGroup() {
    for (const item of group) item.columnCount = columnEnds.length
    placed.push(...group)
    group = []
    columnEnds = []
  }

  for (const item of sorted) {
    const start = toMinutes(item.start)
    const end = toMinutes(item.end)

    // 2. Starts after everything in the group has ended? Then a new group begins.
    if (group.length > 0 && start >= groupEnd) closeGroup()

    // 3. Use the first column that is free by now, or open a new column.
    let column = columnEnds.findIndex((columnEnd) => columnEnd <= start)
    if (column === -1) {
      column = columnEnds.length
      columnEnds.push(end)
    } else {
      columnEnds[column] = end
    }

    group.push({ ...item, column, columnCount: 1 })
    groupEnd = group.length === 1 ? end : Math.max(groupEnd, end)
  }
  closeGroup()

  return placed
}
