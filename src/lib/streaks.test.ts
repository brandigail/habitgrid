import { describe, expect, it } from 'vitest'
import { addDays } from './date'
import { currentStreak, longestStreak, streakAtRisk } from './streaks'

const run = (start: string, length: number): string[] => Array.from({ length }, (_, i) => addDays(start, i))

describe('currentStreak', () => {
  const today = '2026-11-16'

  it('is zero with no check-ins', () => {
    expect(currentStreak(new Set(), today)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    expect(currentStreak(new Set(run('2026-11-12', 5)), today)).toBe(5)
  })

  it('stays alive when only today is still to do', () => {
    expect(currentStreak(new Set(run('2026-11-12', 4)), today)).toBe(4)
  })

  it('breaks after a full missed day', () => {
    expect(currentStreak(new Set(run('2026-11-10', 4)), today)).toBe(0)
  })

  it('ignores older runs separated by a gap', () => {
    const done = new Set([...run('2026-10-01', 20), ...run('2026-11-15', 2)])
    expect(currentStreak(done, today)).toBe(2)
  })

  it('counts across month, year and leap-day boundaries', () => {
    expect(currentStreak(new Set(run('2025-12-30', 5)), '2026-01-03')).toBe(5)
    expect(currentStreak(new Set(run('2028-02-27', 4)), '2028-03-01')).toBe(4)
  })

  it('counts a single day today', () => {
    expect(currentStreak(new Set([today]), today)).toBe(1)
  })

  it('ignores check-ins in the future', () => {
    expect(currentStreak(new Set(['2026-11-17', '2026-11-18']), today)).toBe(0)
  })
})

describe('longestStreak', () => {
  it('is zero with no check-ins', () => {
    expect(longestStreak(new Set())).toBe(0)
  })

  it('finds the best run regardless of insertion order', () => {
    const done = new Set([...run('2026-05-01', 3), ...run('2026-06-10', 9), ...run('2026-07-01', 5)].reverse())
    expect(longestStreak(done)).toBe(9)
  })

  it('treats a one-day gap as a break', () => {
    expect(longestStreak(new Set(['2026-03-01', '2026-03-02', '2026-03-04', '2026-03-05']))).toBe(2)
  })

  it('runs across a year boundary', () => {
    expect(longestStreak(new Set(run('2025-12-29', 6)))).toBe(6)
  })
})

describe('streakAtRisk', () => {
  it('flags a live streak that is not ticked today', () => {
    expect(streakAtRisk(new Set(run('2026-11-12', 4)), '2026-11-16')).toBe(true)
  })

  it('is false once today is ticked, or when there is no streak', () => {
    expect(streakAtRisk(new Set(run('2026-11-12', 5)), '2026-11-16')).toBe(false)
    expect(streakAtRisk(new Set(), '2026-11-16')).toBe(false)
  })
})
