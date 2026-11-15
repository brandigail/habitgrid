import { Flame } from 'lucide-react'
import { Heatmap } from '../../components/Heatmap'
import { cardClass, mutedText } from '../../components/ui'
import { daysBetween } from '../../lib/date'
import { doneDays, habitSummary } from '../../lib/stats'
import { useHabits } from '../../providers/habits'
import type { Habit } from '../../types'

/** One habit's own yearly heatmap with its streaks and 30-day rate. */
export function HabitCard({ habit }: { habit: Habit }) {
  const { today, completions } = useHabits()
  const done = doneDays(completions, habit.id)
  const summary = habitSummary(habit, done, today)
  const lastYear = [...done].filter((d) => daysBetween(d, today) < 365).length

  return (
    <article className={`${cardClass} space-y-3 p-4`} aria-label={habit.name}>
      <header className="flex items-start gap-3">
        <span aria-hidden className="mt-1 size-3 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{habit.name}</h3>
          <p className={`text-xs ${mutedText}`}>{habit.category || 'No category'}</p>
        </div>
        {summary.current > 0 && (
          <span className="flex items-center gap-1 text-sm font-semibold text-orange-700 dark:text-orange-400">
            <Flame className="size-4" aria-hidden />
            {summary.current}
            <span className="sr-only">day streak</span>
          </span>
        )}
      </header>
      <Heatmap
        today={today}
        color={habit.color}
        levelOf={(day) => (done.has(day) ? 4 : 0)}
        describe={(day) => (done.has(day) ? 'done' : 'not done')}
        summary={`${habit.name}: ${lastYear} days done in the last year`}
      />
      <dl className="grid grid-cols-4 gap-2 text-center">
        {[
          ['Current', `${summary.current}d`],
          ['Longest', `${summary.longest}d`],
          ['30 days', `${Math.round(summary.rate30 * 100)}%`],
          ['Total', String(summary.total)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className={`text-xs ${mutedText}`}>{label}</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
