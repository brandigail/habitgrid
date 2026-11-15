import type { BackupFile, Completion, Habit, Settings } from '../types'
import { isDateKey } from './date'

export const LIMITS = { habits: 200, completions: 200_000, nameLength: 60, categoryLength: 30 } as const

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

export function isValidTime(value: string): boolean {
  return TIME.test(value)
}

export function toBackup(habits: readonly Habit[], completions: readonly Completion[], settings: Settings, now: Date = new Date()): BackupFile {
  return { app: 'habitgrid', version: 1, exportedAt: now.toISOString(), habits: [...habits], completions: [...completions], settings }
}

export type ParseResult = { ok: true; data: BackupFile } | { ok: false; error: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseHabit(value: unknown): Habit | string {
  if (!isRecord(value)) return 'a habit is not an object'
  const { id, name, category, color, createdAt, archivedAt } = value
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) return 'a habit has no valid id'
  if (typeof name !== 'string' || name.trim().length === 0 || name.length > LIMITS.nameLength) return 'a habit has an invalid name'
  if (typeof category !== 'string' || category.length > LIMITS.categoryLength) return `habit "${name}" has an invalid category`
  if (typeof color !== 'string' || !HEX_COLOR.test(color)) return `habit "${name}" has an invalid colour`
  if (typeof createdAt !== 'string' || !isDateKey(createdAt)) return `habit "${name}" has an invalid start date`
  if (archivedAt !== null && (typeof archivedAt !== 'string' || !isDateKey(archivedAt))) return `habit "${name}" has an invalid archive date`
  return { id, name: name.trim(), category: category.trim(), color, createdAt, archivedAt }
}

function parseSettings(value: unknown): Settings {
  const theme = isRecord(value) && (value.theme === 'light' || value.theme === 'dark' || value.theme === 'system') ? value.theme : 'system'
  const reminder = isRecord(value) && typeof value.reminderTime === 'string' && isValidTime(value.reminderTime) ? value.reminderTime : null
  return { theme, reminderTime: reminder }
}

/**
 * Checks a backup file thoroughly before anything is changed. A file is either accepted whole or rejected with a
 * reason; nothing is partly imported.
 */
export function parseBackup(text: string): ParseResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' }
  }
  if (!isRecord(json) || json.app !== 'habitgrid' || json.version !== 1) return { ok: false, error: 'That does not look like a HabitGrid backup.' }
  if (!Array.isArray(json.habits) || !Array.isArray(json.completions)) return { ok: false, error: 'The backup is missing its habits or check-ins.' }
  if (json.habits.length > LIMITS.habits) return { ok: false, error: `Too many habits (the limit is ${LIMITS.habits}).` }
  if (json.completions.length > LIMITS.completions) return { ok: false, error: 'Too many check-ins in that file.' }

  const habits: Habit[] = []
  for (const raw of json.habits) {
    const habit = parseHabit(raw)
    if (typeof habit === 'string') return { ok: false, error: `The backup is invalid: ${habit}.` }
    if (habits.some((h) => h.id === habit.id)) return { ok: false, error: 'The backup is invalid: two habits share an id.' }
    habits.push(habit)
  }

  const ids = new Set(habits.map((h) => h.id))
  const seen = new Set<string>()
  const completions: Completion[] = []
  for (const raw of json.completions) {
    if (!isRecord(raw) || typeof raw.habitId !== 'string' || typeof raw.date !== 'string' || !isDateKey(raw.date)) {
      return { ok: false, error: 'The backup is invalid: a check-in has a bad date.' }
    }
    if (!ids.has(raw.habitId)) return { ok: false, error: 'The backup is invalid: a check-in belongs to an unknown habit.' }
    const key = `${raw.habitId}|${raw.date}`
    if (seen.has(key)) continue
    seen.add(key)
    completions.push({ habitId: raw.habitId, date: raw.date })
  }

  return { ok: true, data: { app: 'habitgrid', version: 1, exportedAt: typeof json.exportedAt === 'string' ? json.exportedAt : '', habits, completions, settings: parseSettings(json.settings) } }
}
