import { useEffect, useRef, useState } from 'react'
import { toDateKey } from '../lib/date'
import { permissionState, showNotification } from '../lib/notify'
import { isDue, nextFireAt } from '../lib/reminder'

const LAST_KEY = 'habitgrid-last-reminder'
const MAX_TIMEOUT = 2 ** 31 - 1

function lastNotified(): string | null {
  try {
    return localStorage.getItem(LAST_KEY)
  } catch {
    return null
  }
}

function markNotified(day: string): void {
  try {
    localStorage.setItem(LAST_KEY, day)
  } catch {
    // ignore: the worst case is a second reminder today
  }
}

/**
 * Shows the daily reminder while the app is open: at the chosen time, and straight away when the app is opened or
 * brought back after that time. A web app cannot wake a closed phone by itself, so this is a best-effort nudge.
 * `remaining` is how many habits are still to do today, or null while data is loading.
 */
export function useReminder(time: string | null, remaining: number | null): void {
  const remainingRef = useRef(remaining)
  const [tick, setTick] = useState(0)
  const loading = remaining === null

  useEffect(() => {
    remainingRef.current = remaining
  }, [remaining])

  useEffect(() => {
    if (!time || loading || permissionState() !== 'granted') return

    const check = () => {
      const now = new Date()
      if (!isDue(time, now, lastNotified())) return
      markNotified(toDateKey(now))
      const left = remainingRef.current ?? 0
      if (left > 0) void showNotification('HabitGrid', `${left} habit${left === 1 ? '' : 's'} left today. Keep your streak going.`)
    }

    check()
    const wait = Math.min(MAX_TIMEOUT, nextFireAt(time, new Date()).getTime() - Date.now() + 500)
    const timer = window.setTimeout(() => setTick((n) => n + 1), wait)
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [time, loading, tick])
}
