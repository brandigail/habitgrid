import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { BackupFile, Completion, DateKey, Habit, Settings } from '../types'

interface HabitGridSchema extends DBSchema {
  habits: { key: string; value: Habit }
  completions: { key: [string, string]; value: Completion; indexes: { 'by-habit': string } }
  settings: { key: string; value: Settings }
}

export type HabitDb = IDBPDatabase<HabitGridSchema>

export const DEFAULT_SETTINGS: Settings = { reminderTime: null, theme: 'system' }

const SETTINGS_KEY = 'app'

export function openHabitDb(name = 'habitgrid'): Promise<HabitDb> {
  return openDB<HabitGridSchema>(name, 1, {
    upgrade(db) {
      db.createObjectStore('habits', { keyPath: 'id' })
      const completions = db.createObjectStore('completions', { keyPath: ['habitId', 'date'] })
      completions.createIndex('by-habit', 'habitId')
      db.createObjectStore('settings')
    },
  })
}

export interface StoredData {
  habits: Habit[]
  completions: Completion[]
  settings: Settings
}

export async function loadAll(db: HabitDb): Promise<StoredData> {
  const [habits, completions, settings] = await Promise.all([db.getAll('habits'), db.getAll('completions'), db.get('settings', SETTINGS_KEY)])
  return { habits, completions, settings: { ...DEFAULT_SETTINGS, ...settings } }
}

export async function putHabit(db: HabitDb, habit: Habit): Promise<void> {
  await db.put('habits', habit)
}

/** Deleting a habit removes its check-ins in the same transaction, so nothing is left behind. */
export async function deleteHabit(db: HabitDb, habitId: string): Promise<void> {
  const tx = db.transaction(['habits', 'completions'], 'readwrite')
  const keys = await tx.objectStore('completions').index('by-habit').getAllKeys(habitId)
  await Promise.all([...keys.map((key) => tx.objectStore('completions').delete(key)), tx.objectStore('habits').delete(habitId), tx.done])
}

export async function setCompletion(db: HabitDb, habitId: string, date: DateKey, done: boolean): Promise<void> {
  if (done) await db.put('completions', { habitId, date })
  else await db.delete('completions', [habitId, date])
}

export async function saveSettings(db: HabitDb, settings: Settings): Promise<void> {
  await db.put('settings', settings, SETTINGS_KEY)
}

/** Replaces everything in one transaction: either all of it is written or none of it is. */
export async function replaceAll(db: HabitDb, data: Pick<BackupFile, 'habits' | 'completions' | 'settings'>): Promise<void> {
  const tx = db.transaction(['habits', 'completions', 'settings'], 'readwrite')
  await Promise.all([tx.objectStore('habits').clear(), tx.objectStore('completions').clear(), tx.objectStore('settings').clear()])
  await Promise.all([
    ...data.habits.map((h) => tx.objectStore('habits').put(h)),
    ...data.completions.map((c) => tx.objectStore('completions').put(c)),
    tx.objectStore('settings').put(data.settings, SETTINGS_KEY),
    tx.done,
  ])
}
