import { useEffect, useMemo, useRef } from 'react'
import { formatDate } from '../lib/date'
import { buildGrid, type HeatLevel } from '../lib/heatmap'
import type { DateKey } from '../types'

const CELL = 11
const GAP = 3
const STEP = CELL + GAP
const LEFT = 26
const TOP = 18
const OPACITY: Record<HeatLevel, number> = { 0: 1, 1: 0.3, 2: 0.55, 3: 0.78, 4: 1 }
const WEEKDAY_LABELS: readonly [number, string][] = [[0, 'Mon'], [2, 'Wed'], [4, 'Fri']]

interface Props {
  today: DateKey
  color: string
  /** Shade for each day, 0 (none) to 4 (everything done). */
  levelOf: (day: DateKey) => HeatLevel
  /** Plain-language text for a day, used for hover and for assistive technology. */
  describe: (day: DateKey) => string
  /** A one-sentence summary of the whole grid for screen readers. */
  summary: string
}

/** A year of days as a grid of squares, one column per week. The newest week is scrolled into view. */
export function Heatmap({ today, color, levelOf, describe, summary }: Props) {
  const grid = useMemo(() => buildGrid(today), [today])
  const scroller = useRef<HTMLDivElement>(null)
  const width = LEFT + grid.weeks.length * STEP
  const height = TOP + 7 * STEP

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [today])

  return (
    <div ref={scroller} className="overflow-x-auto pb-1">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={summary} className="block text-slate-600 dark:text-slate-400">
        {grid.monthLabels.map((m) => (
          <text key={`${m.column}-${m.label}`} x={LEFT + m.column * STEP} y={11} fontSize={10} fill="currentColor">
            {m.label}
          </text>
        ))}
        {WEEKDAY_LABELS.map(([row, label]) => (
          <text key={label} x={0} y={TOP + row * STEP + CELL - 1} fontSize={10} fill="currentColor">
            {label}
          </text>
        ))}
        {grid.weeks.map((week, c) =>
          week.map((cell, r) => {
            if (cell.future) return null
            const level = levelOf(cell.key)
            return (
              <rect
                key={cell.key}
                x={LEFT + c * STEP}
                y={TOP + r * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                fill={level === 0 ? undefined : color}
                fillOpacity={level === 0 ? undefined : OPACITY[level]}
                className={level === 0 ? 'fill-slate-200 dark:fill-slate-800' : undefined}
                data-level={level}
              >
                <title>{`${formatDate(cell.key)}: ${describe(cell.key)}`}</title>
              </rect>
            )
          }),
        )}
      </svg>
    </div>
  )
}
