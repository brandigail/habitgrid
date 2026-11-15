import { useState } from 'react'
import { cardClass, errorText, inputClass, mutedText, secondaryButton } from '../../components/ui'
import { isValidTime } from '../../lib/backup'
import { permissionState, requestPermission, showNotification, type PermissionState } from '../../lib/notify'
import { useHabits } from '../../providers/habits'

const DEFAULT_TIME = '20:00'

export function ReminderSettings() {
  const { settings, updateSettings } = useHabits()
  const [permission, setPermission] = useState<PermissionState>(permissionState)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const enabled = settings.reminderTime !== null

  async function setEnabled(on: boolean) {
    setMessage(null)
    if (!on) {
      updateSettings({ reminderTime: null })
      return
    }
    let state = permission
    if (state === 'default') {
      state = await requestPermission()
      setPermission(state)
    }
    if (state === 'granted') {
      updateSettings({ reminderTime: DEFAULT_TIME })
    } else {
      const text = state === 'unsupported' ? 'This browser does not support notifications.' : 'Notifications are blocked. Allow them in your browser or phone settings, then try again.'
      setMessage({ text, error: true })
    }
  }

  async function sendTest() {
    const shown = await showNotification('HabitGrid', 'This is how your daily reminder will look.')
    setMessage(shown ? { text: 'Test notification sent.', error: false } : { text: 'The notification could not be shown.', error: true })
  }

  return (
    <section className={`${cardClass} space-y-4 p-4`} aria-labelledby="reminder-heading">
      <h2 id="reminder-heading" className="text-lg font-semibold">
        Daily reminder
      </h2>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" className="size-5 accent-emerald-700" checked={enabled} onChange={(e) => void setEnabled(e.target.checked)} />
        <span className="font-medium">Remind me about unticked habits</span>
      </label>

      {enabled && (
        <div className="space-y-3">
          <div>
            <label htmlFor="reminder-time" className="text-sm font-medium">
              Time
            </label>
            <input
              id="reminder-time"
              type="time"
              className={`${inputClass} max-w-40`}
              value={settings.reminderTime ?? DEFAULT_TIME}
              onChange={(e) => isValidTime(e.target.value) && updateSettings({ reminderTime: e.target.value })}
            />
          </div>
          {permission === 'granted' ? (
            <button type="button" className={secondaryButton} onClick={() => void sendTest()}>
              Send a test notification
            </button>
          ) : (
            <p className={`text-sm ${errorText}`}>Notifications are not allowed right now, so no reminder will show.</p>
          )}
        </div>
      )}

      {message && (
        <p role="status" className={`text-sm ${message.error ? errorText : mutedText}`}>
          {message.text}
        </p>
      )}

      <p className={`text-sm ${mutedText}`}>
        A web app cannot wake a closed phone on its own. The reminder shows while HabitGrid is open or running in the background, and as soon as you open it after the chosen time.
        On iPhone, add HabitGrid to your Home Screen first (iOS 16.4 or later).
      </p>
    </section>
  )
}
