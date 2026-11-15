import type { CompletionMap, DateKey, Habit } from '../types'
import { daysBetween, lastDays, weekdayIndex } from './date'
import { currentStreak, longestStreak, streakAtRisk } from './streaks'

const NONE: ReadonlySet<DateKey> = new Set()

export function doneDays(completions: CompletionMap, habitId: string): ReadonlySet<DateKey> {
  return completions.get(habitId) ?? NONE
}

/** Habits that were live on a day: created by then and not archived. */
export function activeHabits(habits: readonly Habit[], day?: DateKey): Habit[] {
  return habits.filter((h) => h.archivedAt === null && (day === undefined || h.createdAt <= day))
}

/** Share of the last `windowDays` days (but never counting days before the habit existed) that were ticked, from 0 to 1. */
export function completionRate(done: ReadonlySet<DateKey>, today: DateKey, windowDays: number, createdAt: DateKey): number {
  const available = Math.min(windowDays, daysBetween(createdAt, today) + 1)
  if (available <= 0) return 0
  const ticked = lastDays(today, available).filter((d) => done.has(d)).length
  return ticked / available
}

export interface HabitSummary {
  current: number
  longest: number
  total: number
  rate30: number
  atRisk: boolean
}

export function habitSummary(habit: Habit, done: ReadonlySet<DateKey>, today: DateKey): HabitSummary {
  return {
    current: currentStreak(done, today),
    longest: longestStreak(done),
    total: done.size,
    rate30: completionRate(done, today, 30, habit.createdAt),
    atRisk: streakAtRisk(done, today),
  }
}

export interface OverallSummary {
  habitCount: number
  doneToday: number
  totalCheckIns: number
  bestCurrent: { name: string; days: number } | null
  longestEver: { name: string; days: number } | null
  rate30: number
  perfectDays30: number
}

export function overallSummary(habits: readonly Habit[], completions: CompletionMap, today: DateKey): OverallSummary {
  const active = activeHabits(habits)
  let bestCurrent: OverallSummary['bestCurrent'] = null
  let longestEver: OverallSummary['longestEver'] = null
  let totalCheckIns = 0
  let doneToday = 0
  for (const habit of active) {
    const done = doneDays(completions, habit.id)
    totalCheckIns += done.size
    if (done.has(today)) doneToday++
    const current = currentStreak(done, today)
    if (current > (bestCurrent?.days ?? 0)) bestCurrent = { name: habit.name, days: current }
    const longest = longestStreak(done)
    if (longest > (longestEver?.days ?? 0)) longestEver = { name: habit.name, days: longest }
  }

  let possible = 0
  let ticked = 0
  let perfectDays30 = 0
  for (const day of lastDays(today, 30)) {
    const live = activeHabits(active, day)
    const doneCount = live.filter((h) => doneDays(completions, h.id).has(day)).length
    possible += live.length
    ticked += doneCount
    if (live.length > 0 && doneCount === live.length) perfectDays30++
  }
  return { habitCount: active.length, doneToday, totalCheckIns, bestCurrent, longestEver, rate30: possible === 0 ? 0 : ticked / possible, perfectDays30 }
}

/** True when every habit that was live on the day has been ticked, and there was at least one. */
export function dayComplete(habits: readonly Habit[], completions: CompletionMap, day: DateKey): boolean {
  const live = activeHabits(habits, day)
  return live.length > 0 && live.every((h) => doneDays(completions, h.id).has(day))
}

/** For each weekday (Monday first), the share of possible check-ins that were done over the last `windowDays` days. */
export function weekdayRates(habits: readonly Habit[], completions: CompletionMap, today: DateKey, windowDays = 90): number[] {
  const possible = Array<number>(7).fill(0)
  const ticked = Array<number>(7).fill(0)
  for (const day of lastDays(today, windowDays)) {
    const index = weekdayIndex(day)
    for (const habit of activeHabits(habits, day)) {
      possible[index] = (possible[index] ?? 0) + 1
      if (doneDays(completions, habit.id).has(day)) ticked[index] = (ticked[index] ?? 0) + 1
    }
  }
  return possible.map((p, i) => (p === 0 ? 0 : (ticked[i] ?? 0) / p))
}

