/** A calendar day as YYYY-MM-DD in the user's local time. Never a UTC timestamp, so streaks cannot shift with timezones. */
export type DateKey = string

export interface Habit {
  id: string
  name: string
  category: string
  /** Hex colour such as `#16a34a`, used for the habit's heatmap and check mark. */
  color: string
  createdAt: DateKey
  /** Set when the habit is archived: it leaves the daily list but its history is kept. */
  archivedAt: DateKey | null
}

export interface Completion {
  habitId: string
  date: DateKey
}

export type ThemePreference = 'light' | 'dark' | 'system'

export interface Settings {
  /** Local time of day as HH:MM, or null when reminders are off. */
  reminderTime: string | null
  theme: ThemePreference
}

/** Completed days per habit, for fast lookups while rendering. */
export type CompletionMap = ReadonlyMap<string, ReadonlySet<DateKey>>

/** The file written by Export and read by Import. */
export interface BackupFile {
  app: 'habitgrid'
  version: 1
  exportedAt: string
  habits: Habit[]
  completions: Completion[]
  settings: Settings
}
