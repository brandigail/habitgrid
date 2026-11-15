import { cardClass, inputClass } from '../../components/ui'
import { useHabits } from '../../providers/habits'
import type { ThemePreference } from '../../types'
import { DataSettings } from './DataSettings'
import { ReminderSettings } from './ReminderSettings'

const THEMES: readonly { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Match my device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function isTheme(value: string): value is ThemePreference {
  return THEMES.some((t) => t.value === value)
}

export default function SettingsView() {
  const { settings, updateSettings } = useHabits()
  return (
    <section className="space-y-4" aria-labelledby="settings-heading">
      <h1 id="settings-heading" className="text-2xl font-bold">
        Settings
      </h1>
      <section className={`${cardClass} p-4`} aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="text-lg font-semibold">
          Appearance
        </h2>
        <label htmlFor="theme-select" className="mt-2 block text-sm font-medium">
          Theme
        </label>
        <select id="theme-select" className={`${inputClass} max-w-xs`} value={settings.theme} onChange={(e) => isTheme(e.target.value) && updateSettings({ theme: e.target.value })}>
          {THEMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </section>
      <ReminderSettings />
      <DataSettings />
    </section>
  )
}
