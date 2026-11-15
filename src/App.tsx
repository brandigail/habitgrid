import { lazy, Suspense } from 'react'
import { Header } from './components/Header'
import { TabBar } from './components/TabBar'
import { UpdatePrompt } from './components/UpdatePrompt'
import { mutedText } from './components/ui'
import { TodayView } from './features/today/TodayView'
import { useReminder } from './hooks/useReminder'
import { useTab } from './hooks/useTab'
import { activeHabits, doneDays } from './lib/stats'
import { useHabits } from './providers/habits'
import { useApplyTheme } from './providers/theme'

// Everything except the daily screen loads on demand, which keeps the first load small.
const ProgressView = lazy(() => import('./features/progress/ProgressView'))
const HabitsView = lazy(() => import('./features/habits/HabitsView'))
const SettingsView = lazy(() => import('./features/settings/SettingsView'))

export function App() {
  const { ready, today, habits, completions, settings, persistent, saveError } = useHabits()
  const [tab, go] = useTab()
  useApplyTheme()

  const remaining = ready ? activeHabits(habits).filter((h) => !doneDays(completions, h.id).has(today)).length : null
  useReminder(settings.reminderTime, remaining)

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <UpdatePrompt />
      <Header tab={tab} onTab={go} />
      {(!persistent || saveError) && (
        <p role="alert" className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
          {saveError ?? 'Your browser is blocking storage, so changes will be lost when you close this page.'}
        </p>
      )}
      <main className="mx-auto max-w-4xl px-4 pt-4 pb-28 md:pb-10">
        {!ready ? (
          <p className={mutedText}>Loading your habits…</p>
        ) : (
          <Suspense fallback={<p className={mutedText}>Loading…</p>}>
            {tab === 'today' && <TodayView onAddHabit={() => go('habits')} />}
            {tab === 'progress' && <ProgressView />}
            {tab === 'habits' && <HabitsView />}
            {tab === 'settings' && <SettingsView />}
          </Suspense>
        )}
      </main>
      <TabBar tab={tab} onTab={go} />
    </div>
  )
}
