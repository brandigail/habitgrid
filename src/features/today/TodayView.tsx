import { useState } from 'react'
import { CategoryFilter } from '../../components/CategoryFilter'
import { cardClass, mutedText, primaryButton } from '../../components/ui'
import { formatDate } from '../../lib/date'
import { activeHabits, doneDays } from '../../lib/stats'
import { useHabits } from '../../providers/habits'
import type { DateKey } from '../../types'
import { DateStrip } from './DateStrip'
import { HabitRow } from './HabitRow'

interface Props {
  onAddHabit: () => void
}

export function TodayView({ onAddHabit }: Props) {
  const { today, habits, completions } = useHabits()
  const [picked, setPicked] = useState<DateKey | null>(null)
  const [category, setCategory] = useState<string | null>(null)

  // "Today" follows midnight; a picked past day stays put.
  const day = picked !== null && picked < today ? picked : today
  const active = activeHabits(habits)
  const categories = [...new Set(active.map((h) => h.category).filter(Boolean))].sort()
  const selectedCategory = category !== null && categories.includes(category) ? category : null
  const shown = active.filter((h) => selectedCategory === null || h.category === selectedCategory)
  const doneCount = shown.filter((h) => doneDays(completions, h.id).has(day)).length
  const percent = shown.length === 0 ? 0 : Math.round((doneCount / shown.length) * 100)

  if (active.length === 0) {
    return (
      <section className={`${cardClass} space-y-3 p-6 text-center`}>
        <h1 className="text-xl font-bold">No habits yet</h1>
        <p className={mutedText}>Add your first habit and tick it off each day. Your year fills in as you go.</p>
        <button type="button" className={primaryButton} onClick={onAddHabit}>
          Add a habit
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-4" aria-labelledby="today-heading">
      <div>
        <h1 id="today-heading" className="text-2xl font-bold">
          {day === today ? 'Today' : formatDate(day)}
        </h1>
        <p className={`text-sm ${mutedText}`}>{day === today ? formatDate(today) : 'Filling in a past day'}</p>
      </div>

      <DateStrip selected={day} onSelect={(d) => setPicked(d === today ? null : d)} />

      {day !== today && (
        <button type="button" className="text-sm font-medium text-emerald-800 underline dark:text-emerald-300" onClick={() => setPicked(null)}>
          Back to today
        </button>
      )}

      <div className={`${cardClass} p-4`}>
        <div className="flex items-baseline justify-between">
          <p className="font-medium" data-testid="progress-text">
            {doneCount} of {shown.length} done
          </p>
          <p className={`text-sm ${mutedText}`}>{percent}%</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="progressbar" aria-label="Habits done" aria-valuemin={0} aria-valuemax={shown.length} aria-valuenow={doneCount}>
          <div className="h-full rounded-full bg-emerald-600 transition-[width]" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <CategoryFilter categories={categories} value={selectedCategory} onChange={setCategory} />

      <ul className="space-y-2" aria-label="Habits">
        {shown.map((habit) => (
          <HabitRow key={habit.id} habit={habit} day={day} />
        ))}
      </ul>
    </section>
  )
}
