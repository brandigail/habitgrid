import { useEffect, useSyncExternalStore } from 'react'
import { useHabits } from './habits'

const QUERY = '(prefers-color-scheme: dark)'
const STORAGE_KEY = 'habitgrid-theme'

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** Whether the screen is currently dark: the saved choice, or the device setting when the choice is "system". */
export function useIsDark(): boolean {
  const { settings } = useHabits()
  const systemDark = useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false)
  return settings.theme === 'dark' || (settings.theme === 'system' && systemDark)
}

/** Applies the theme to the page and keeps a copy where the page can read it before the app loads, to avoid a flash. */
export function useApplyTheme(): void {
  const { settings, ready } = useHabits()
  const dark = useIsDark()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, settings.theme)
    } catch {
      // ignore: the choice is still saved in the database
    }
  }, [settings.theme, ready])
}
