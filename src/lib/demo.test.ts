import { describe, expect, it } from 'vitest'
import { currentStreak, longestStreak } from './streaks'
import { makeDemo } from './demo'
import { daysBetween, isDateKey } from './date'

const today = '2026-11-18'

describe('makeDemo', () => {
  const demo = makeDemo(today)
  const byHabit = (id: string) => new Set(demo.completions.filter((c) => c.habitId === id).map((c) => c.date))

  it('is the same every time', () => {
    expect(makeDemo(today)).toEqual(demo)
  })

  it('has several habits across categories with unique ids', () => {
    expect(demo.habits.length).toBeGreaterThanOrEqual(6)
    expect(new Set(demo.habits.map((h) => h.id)).size).toBe(demo.habits.length)
    expect(new Set(demo.habits.map((h) => h.category)).size).toBeGreaterThanOrEqual(3)
  })

  it('only holds real days, none in the future or before the habit existed, with no duplicates', () => {
    const seen = new Set<string>()
    for (const c of demo.completions) {
      const habit = demo.habits.find((h) => h.id === c.habitId)
      expect(habit).toBeDefined()
      expect(isDateKey(c.date)).toBe(true)
      expect(c.date <= today).toBe(true)
      expect(c.date >= (habit?.createdAt ?? '')).toBe(true)
      const key = `${c.habitId}|${c.date}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })

  it('fills most of a year', () => {
    const oldest = demo.habits.map((h) => h.createdAt).sort()[0] ?? today
    expect(daysBetween(oldest, today)).toBeGreaterThanOrEqual(360)
    expect(demo.completions.length).toBeGreaterThan(1200)
  })

  it('has live streaks of different lengths and leaves some habits to tick today', () => {
    expect(currentStreak(byHabit('demo-meditate'), today)).toBe(41)
    expect(currentStreak(byHabit('demo-read'), today)).toBe(23)
    expect(currentStreak(byHabit('demo-run'), today)).toBe(4)
    expect(currentStreak(byHabit('demo-journal'), today)).toBe(0)
    expect(longestStreak(byHabit('demo-meditate'))).toBeGreaterThanOrEqual(41)
    const doneToday = demo.habits.filter((h) => byHabit(h.id).has(today)).length
    expect(doneToday).toBeGreaterThan(0)
    expect(doneToday).toBeLessThan(demo.habits.length)
  })
})
