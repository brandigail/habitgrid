import type { Completion, DateKey, Habit } from '../types'
import { addDays, weekdayIndex } from './date'

export interface DemoData {
  habits: Habit[]
  completions: Completion[]
}

interface Profile {
  slug: string
  name: string
  category: string
  color: string
  /** Days ago the habit was created. */
  startedDaysAgo: number
  /** Chance of ticking a normal day. */
  rate: number
  /** Multiplier per weekday, Monday first, so habits have a believable rhythm. */
  rhythm: readonly number[]
  /** The streak ending yesterday; the day before it is always missed so the streak is exact. */
  streakEndingYesterday: number
  doneToday: boolean
}

const EVEN = [1, 1, 1, 1, 1, 1, 1] as const

const PROFILES: readonly Profile[] = [
  { slug: 'run', name: 'Morning run', category: 'Health', color: '#16a34a', startedDaysAgo: 364, rate: 0.62, rhythm: [1.2, 0.5, 1.2, 0.5, 1.2, 1.1, 0.3], streakEndingYesterday: 4, doneToday: false },
  { slug: 'read', name: 'Read 20 pages', category: 'Learning', color: '#4f46e5', startedDaysAgo: 364, rate: 0.78, rhythm: EVEN, streakEndingYesterday: 22, doneToday: true },
  { slug: 'meditate', name: 'Meditate', category: 'Mind', color: '#7c3aed', startedDaysAgo: 364, rate: 0.72, rhythm: [1, 1, 1, 1, 0.9, 0.7, 0.8], streakEndingYesterday: 40, doneToday: true },
  { slug: 'water', name: 'Drink 2L of water', category: 'Health', color: '#0284c7', startedDaysAgo: 330, rate: 0.85, rhythm: EVEN, streakEndingYesterday: 2, doneToday: false },
  { slug: 'journal', name: 'Evening journal', category: 'Mind', color: '#d97706', startedDaysAgo: 280, rate: 0.5, rhythm: [0.7, 0.7, 0.7, 0.7, 0.5, 1.2, 1.4], streakEndingYesterday: 0, doneToday: false },
  { slug: 'stretch', name: 'Stretch for 10 minutes', category: 'Health', color: '#db2777', startedDaysAgo: 210, rate: 0.55, rhythm: EVEN, streakEndingYesterday: 8, doneToday: false },
  { slug: 'spanish', name: 'Practise Spanish', category: 'Learning', color: '#0d9488', startedDaysAgo: 150, rate: 0.42, rhythm: [1, 1, 1, 1, 0.8, 0.5, 0.5], streakEndingYesterday: 1, doneToday: false },
]

/** A small seeded random number generator, so the demo year is the same every time it is built. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A year of believable history ending today, with a mix of long, short and broken streaks and some habits still to tick. */
export function makeDemo(today: DateKey, seed = 7): DemoData {
  const random = mulberry32(seed)
  const habits: Habit[] = []
  const completions: Completion[] = []

  for (const profile of PROFILES) {
    const id = `demo-${profile.slug}`
    habits.push({ id, name: profile.name, category: profile.category, color: profile.color, createdAt: addDays(today, -profile.startedDaysAgo), archivedAt: null })

    for (let ago = profile.startedDaysAgo; ago >= 0; ago--) {
      const day = addDays(today, -ago)
      const chance = profile.rate * (profile.rhythm[weekdayIndex(day)] ?? 1)
      let done = random() < chance
      if (ago === 0) done = profile.doneToday
      else if (ago <= profile.streakEndingYesterday) done = true
      else if (ago === profile.streakEndingYesterday + 1) done = false
      if (done) completions.push({ habitId: id, date: day })
    }
  }
  return { habits, completions }
}
