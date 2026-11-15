import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, weekdayIndex } from './date'
import { buildGrid, levelFor } from './heatmap'

describe('buildGrid', () => {
  const today = '2026-11-18' // a Wednesday
  const grid = buildGrid(today)

  it('has 53 weeks of seven days, Monday first', () => {
    expect(grid.weeks).toHaveLength(53)
    expect(grid.weeks.every((w) => w.length === 7)).toBe(true)
    expect(grid.weeks.every((w) => weekdayIndex(w[0]?.key ?? '') === 0)).toBe(true)
  })

  it('has no gaps or repeats between days', () => {
    const keys = grid.weeks.flat().map((c) => c.key)
    expect(keys.every((k, i) => i === 0 || daysBetween(keys[i - 1] ?? k, k) === 1)).toBe(true)
  })

  it('ends with the current week and marks the rest of it as future', () => {
    const last = grid.weeks[52] ?? []
    expect(last[0]?.key).toBe('2026-11-16')
    expect(last.map((c) => c.future)).toEqual([false, false, false, true, true, true, true])
    expect(grid.weeks.flat().filter((c) => !c.future).at(-1)?.key).toBe(today)
  })

  it('covers a full year back from today', () => {
    const first = grid.weeks[0]?.[0]?.key ?? ''
    expect(daysBetween(first, today)).toBeGreaterThanOrEqual(365)
  })

  it('labels months at the week they start, without overlapping labels', () => {
    const columns = grid.monthLabels.map((m) => m.column)
    expect(columns).toEqual([...columns].sort((a, b) => a - b))
    expect(grid.monthLabels.every((m, i) => i === 0 || m.column - (grid.monthLabels[i - 1]?.column ?? 0) >= 3)).toBe(true)
    expect(grid.monthLabels.some((m) => m.label === 'Nov')).toBe(true)
    expect(new Set(grid.monthLabels.map((m) => m.label)).size).toBeGreaterThanOrEqual(12)
  })

  it('works when today is a Monday or a Sunday', () => {
    expect(buildGrid('2026-11-16').weeks[52]?.[0]?.key).toBe('2026-11-16')
    expect(buildGrid('2026-11-22').weeks[52]?.every((c) => !c.future)).toBe(true)
    expect(addDays('2026-11-16', 6)).toBe('2026-11-22')
  })
})

describe('levelFor', () => {
  it('is empty with nothing done or nothing to do', () => {
    expect(levelFor(0, 5)).toBe(0)
    expect(levelFor(0, 0)).toBe(0)
  })

  it('is darkest only when everything is done', () => {
    expect(levelFor(5, 5)).toBe(4)
    expect(levelFor(1, 1)).toBe(4)
    expect(levelFor(4, 5)).toBe(4 - 1)
  })

  it('shows any progress as at least the lightest shade', () => {
    expect(levelFor(1, 10)).toBe(1)
    expect(levelFor(5, 10)).toBe(2)
    expect(levelFor(7, 10)).toBe(3)
  })
})
