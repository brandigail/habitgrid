import type { DateKey } from '../types'
import { addDays, daysBetween } from './date'

/**
 * The current streak: how many days in a row end today. A streak is still alive if today is not ticked yet but
 * yesterday was, because the day is not over; it only breaks once a whole day has passed without a check-in.
 */
export function currentStreak(done: ReadonlySet<DateKey>, today: DateKey): number {
  let day = done.has(today) ? today : addDays(today, -1)
  let count = 0
  while (done.has(day)) {
    count++
    day = addDays(day, -1)
  }
  return count
}

/** The longest run of consecutive days anywhere in the history. */
export function longestStreak(done: ReadonlySet<DateKey>): number {
  const days = [...done].sort()
  let longest = 0
  let run = 0
  let previous: DateKey | null = null
  for (const day of days) {
    run = previous !== null && daysBetween(previous, day) === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
    previous = day
  }
  return longest
}

/** True when the streak is worth protecting: it has days in it but today is not ticked yet. */
export function streakAtRisk(done: ReadonlySet<DateKey>, today: DateKey): boolean {
  return !done.has(today) && currentStreak(done, today) > 0
}
