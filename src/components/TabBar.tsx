import { CalendarCheck, Grid3x3, ListChecks, Settings } from 'lucide-react'
import type { ComponentType } from 'react'
import { TABS, type Tab } from '../hooks/useTab'

const ICONS: Record<Tab, ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  today: CalendarCheck,
  progress: Grid3x3,
  habits: ListChecks,
  settings: Settings,
}

interface Props {
  tab: Tab
  onTab: (tab: Tab) => void
}

/** The phone navigation: fixed to the bottom of the screen, hidden from tablet width up where the header holds the tabs. */
export function TabBar({ tab, onTab }: Props) {
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-slate-800 dark:bg-slate-950">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((t) => {
          const Icon = ICONS[t.id]
          const active = tab === t.id
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onTab(t.id)}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                  active ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="size-5" aria-hidden />
                {t.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
