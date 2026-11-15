import type { DateKey } from '../types'
import { toDateKey } from './date'

function atTime(day: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number)
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h ?? 0, m ?? 0, 0, 0)
}

/** The next moment the reminder should fire: later today if the time has not passed, otherwise tomorrow. */
export function nextFireAt(time: string, now: Date): Date {
  const today = atTime(now, time)
  if (today.getTime() > now.getTime()) return today
  return atTime(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), time)
}

/**
 * True when today's reminder time has passed and today's reminder has not been shown yet. This is what lets a
 * reminder show up when the app is reopened after its time, since a closed web app cannot wake itself up.
 */
export function isDue(time: string, now: Date, lastNotified: DateKey | null): boolean {
  return now.getTime() >= atTime(now, time).getTime() && lastNotified !== toDateKey(now)
}
