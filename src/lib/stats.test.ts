import { describe, expect, it } from 'vitest'
import type { CompletionMap, Habit } from '../types'
import { addDays } from './date'
import { activeHabits, completionRate, dayComplete, habitSummary, overallSummary, weekdayRates } from './stats'

const today = '2026-11-18' // a Wednesday

function habit(id: string, createdAt = '2026-01-01', archivedAt: string | null = null): Habit {
  return { id, name: `Habit ${id}`, category: 'Health', color: '#16a34a', createdAt, archivedAt }
}

const run = (end: string, length: number): string[] => Array.from({ length }, (_, i) => addDays(end, -i))

function map(entries: Record<string, string[]>): CompletionMap {
  return new Map(Object.entries(entries).map(([id, days]) => [id, new Set(days)]))
}

describe('activeHabits', () => {
  it('drops archived habits and, for a given day, habits not created yet', () => {
    const habits = [habit('a'), habit('b', '2026-11-10'), habit('c', '2026-01-01', '2026-06-01')]
    expect(activeHabits(habits).map((h) => h.id)).toEqual(['a', 'b'])
    expect(activeHabits(habits, '2026-11-01').map((h) => h.id)).toEqual(['a'])
  })
})

describe('completionRate', () => {
  it('is the share of the window that was ticked', () => {
    expect(completionRate(new Set(run(today, 15)), today, 30, '2026-01-01')).toBe(0.5)
  })

  it('does not count days before the habit existed', () => {
    // Created 4 days ago (5 days including today) and ticked on 5 of them.
    expect(completionRate(new Set(run(today, 5)), today, 30, '2026-11-14')).toBe(1)
  })

  it('is zero for a habit created in the future', () => {
    expect(completionRate(new Set(), today, 30, '2026-12-01')).toBe(0)
  })
})

describe('habitSummary', () => {
  it('combines streaks, total and rate', () => {
    const done = new Set([...run('2026-11-17', 10), '2026-09-01'])
    const summary = habitSummary(habit('a'), done, today)
    expect(summary).toMatchObject({ current: 10, longest: 10, total: 11, atRisk: true })
    expect(summary.rate30).toBeCloseTo(10 / 30)
  })
})

describe('overallSummary', () => {
  const habits = [habit('a'), habit('b'), habit('arch', '2026-01-01', '2026-10-01')]
  const completions = map({ a: run(today, 7), b: run('2026-11-17', 3), arch: run(today, 30) })
  const summary = overallSummary(habits, completions, today)

  it('ignores archived habits', () => {
    expect(summary.habitCount).toBe(2)
    expect(summary.totalCheckIns).toBe(10)
  })

  it('reports today, the best current streak and the longest ever', () => {
    expect(summary.doneToday).toBe(1)
    expect(summary.bestCurrent).toEqual({ name: 'Habit a', days: 7 })
    expect(summary.longestEver).toEqual({ name: 'Habit a', days: 7 })
  })

  it('computes the 30-day rate and perfect days', () => {
    // a ticked 7 of 30 days, b ticked 3 of 30: 10 of 60 possible.
    expect(summary.rate30).toBeCloseTo(10 / 60)
    expect(summary.perfectDays30).toBe(3) // the 15th, 16th and 17th are the only days both habits were ticked
  })

  it('handles having no habits', () => {
    expect(overallSummary([], new Map(), today)).toMatchObject({ habitCount: 0, rate30: 0, bestCurrent: null, perfectDays30: 0 })
  })
})

describe('dayComplete', () => {
  it('needs at least one habit and every one ticked', () => {
    const habits = [habit('a'), habit('b')]
    expect(dayComplete(habits, map({ a: [today], b: [today] }), today)).toBe(true)
    expect(dayComplete(habits, map({ a: [today] }), today)).toBe(false)
    expect(dayComplete([], new Map(), today)).toBe(false)
  })

  it('does not require a habit that did not exist yet', () => {
    const habits = [habit('a'), habit('late', '2026-11-18')]
    expect(dayComplete(habits, map({ a: ['2026-11-10'] }), '2026-11-10')).toBe(true)
  })
})

describe('weekdayRates', () => {
  it('measures each weekday separately, Monday first', () => {
    // One habit ticked only on Mondays over the last 90 days.
    const mondays: string[] = []
    for (let i = 0; i < 90; i++) {
      const day = addDays(today, -i)
      if (new Date(`${day}T00:00:00Z`).getUTCDay() === 1) mondays.push(day)
    }
    const rates = weekdayRates([habit('a')], map({ a: mondays }), today)
    expect(rates[0]).toBe(1)
    expect(rates.slice(1).every((r) => r === 0)).toBe(true)
  })
})
