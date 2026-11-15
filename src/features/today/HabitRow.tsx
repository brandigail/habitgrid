import { Check, Flame } from 'lucide-react'
import { currentStreak, streakAtRisk } from '../../lib/streaks'
import { doneDays } from '../../lib/stats'
import { useHabits } from '../../providers/habits'
import type { DateKey, Habit } from '../../types'

interface Props {
  habit: Habit
  day: DateKey
}

/** One habit for the chosen day: a big tap target that toggles it, with the live streak beside it. */
export function HabitRow({ habit, day }: Props) {
  const { today, completions, toggle } = useHabits()
  const done = doneDays(completions, habit.id)
  const ticked = done.has(day)
  const streak = currentStreak(done, today)
  const atRisk = day === today && streakAtRisk(done, today)

  return (
    <li>
      <button
        type="button"
        aria-pressed={ticked}
        onClick={() => toggle(habit.id, day)}
        className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
          ticked ? 'border-transparent' : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
        }`}
        style={ticked ? { backgroundColor: `${habit.color}22` } : undefined}
      >
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
          style={{ borderColor: habit.color, backgroundColor: ticked ? habit.color : 'transparent' }}
        >
          {ticked && <Check className="size-5 text-white" strokeWidth={3} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate font-medium ${ticked ? 'text-slate-900 dark:text-slate-100' : ''}`}>{habit.name}</span>
          <span className="block truncate text-xs text-slate-600 dark:text-slate-400">{atRisk ? `Tick it to keep your ${streak} day streak` : habit.category}</span>
        </span>
        {streak > 0 && (
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-orange-700 dark:text-orange-400">
            <Flame className="size-4" aria-hidden />
            {streak}
            <span className="sr-only">day streak</span>
          </span>
        )}
      </button>
    </li>
  )
}
