import { createContext, useContext } from 'react'
import type { BackupFile, CompletionMap, DateKey, Habit, Settings } from '../types'

export interface HabitInput {
  name: string
  category: string
  color: string
}

export interface HabitsApi {
  /** False until the saved data has been read from the device. */
  ready: boolean
  /** Today as a local calendar day; it moves on at midnight. */
  today: DateKey
  habits: Habit[]
  completions: CompletionMap
  settings: Settings
  /** False when the browser would not let us store anything, so changes only last until the page closes. */
  persistent: boolean
  /** Set when the latest change could not be written to the device. */
  saveError: string | null
  toggle: (habitId: string, date: DateKey) => void
  addHabit: (input: HabitInput) => void
  updateHabit: (id: string, input: HabitInput) => void
  setArchived: (id: string, archived: boolean) => void
  removeHabit: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  exportData: () => BackupFile
  /** Replaces everything with an already validated backup. */
  importData: (data: BackupFile) => void
  loadDemo: () => void
  clearAll: () => void
}

export const HabitsContext = createContext<HabitsApi | null>(null)

export function useHabits(): HabitsApi {
  const ctx = useContext(HabitsContext)
  if (!ctx) throw new Error('useHabits must be used within HabitProvider')
  return ctx
}
