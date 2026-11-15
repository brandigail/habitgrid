import { Moon, Sun } from 'lucide-react'
import { TABS, type Tab } from '../hooks/useTab'
import { useHabits } from '../providers/habits'
import { useIsDark } from '../providers/theme'
import { iconButton } from './ui'

interface Props {
  tab: Tab
  onTab: (tab: Tab) => void
}

export function Header({ tab, onTab }: Props) {
  const { updateSettings } = useHabits()
  const dark = useIsDark()
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-2">
        <button type="button" className="flex min-h-11 items-center gap-2 text-lg font-bold" onClick={() => onTab('today')} aria-label="HabitGrid, go to Today">
          <img src="/favicon.svg" alt="" width={28} height={28} className="size-7" />
          <span>HabitGrid</span>
        </button>
        <nav aria-label="Main" className="ml-4 hidden flex-1 gap-1 md:flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-current={tab === t.id ? 'page' : undefined}
              onClick={() => onTab(t.id)}
              className={`min-h-11 rounded-lg px-3 text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className={`${iconButton} ml-auto md:ml-0`}
          onClick={() => updateSettings({ theme: dark ? 'light' : 'dark' })}
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
        </button>
      </div>
    </header>
  )
}
