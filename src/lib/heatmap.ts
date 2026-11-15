import type { DateKey } from '../types'
import { addDays, dayOfMonth, monthIndex, monthName, startOfWeek } from './date'

export interface HeatCell {
  key: DateKey
  /** Days after today are laid out but not drawn. */
  future: boolean
}

export interface MonthLabel {
  column: number
  label: string
}

export interface HeatGrid {
  /** One entry per week, each with seven days from Monday to Sunday. */
  weeks: HeatCell[][]
  monthLabels: MonthLabel[]
}

export type HeatLevel = 0 | 1 | 2 | 3 | 4

export const WEEKS_SHOWN = 53

/** The last `weeks` calendar weeks ending with the week that contains today, as columns of seven days. */
export function buildGrid(today: DateKey, weeks: number = WEEKS_SHOWN): HeatGrid {
  const firstWeek = addDays(startOfWeek(today), -(weeks - 1) * 7)
  const columns: HeatCell[][] = []
  for (let w = 0; w < weeks; w++) {
    const start = addDays(firstWeek, w * 7)
    columns.push(Array.from({ length: 7 }, (_, d) => {
      const key = addDays(start, d)
      return { key, future: key > today }
    }))
  }

  const monthLabels: MonthLabel[] = []
  columns.forEach((column, c) => {
    const first = column.find((cell) => dayOfMonth(cell.key) === 1)
    if (first) monthLabels.push({ column: c, label: monthName(monthIndex(first.key)) })
  })
  // Name the first month too, unless the next label is so close that the two would overlap.
  const firstColumn = columns[0]
  if (firstColumn && (monthLabels[0]?.column ?? weeks) > 2) {
    monthLabels.unshift({ column: 0, label: monthName(monthIndex(firstColumn[6]?.key ?? firstColumn[0]?.key ?? today)) })
  }
  return { weeks: columns, monthLabels }
}

/** Maps "done of total" to one of five shades. Any progress is visible, and only everything done is the darkest. */
export function levelFor(done: number, total: number): HeatLevel {
  if (total <= 0 || done <= 0) return 0
  if (done >= total) return 4
  const level = Math.ceil((done / total) * 4)
  return Math.min(3, Math.max(1, level)) as HeatLevel
}
