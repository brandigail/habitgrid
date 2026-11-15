import { useState } from 'react'
import { CategoryFilter } from '../../components/CategoryFilter'
import { Heatmap } from '../../components/Heatmap'
import { cardClass, mutedText } from '../../components/ui'
import { daysBetween } from '../../lib/date'
import { levelFor } from '../../lib/heatmap'
import { activeHabits, doneDays, overallSummary } from '../../lib/stats'
import { useHabits } from '../../providers/habits'
import { HabitCard } from './HabitCard'
import { SummaryCards } from './SummaryCards'
import { WeekdayBars } from './WeekdayBars'

const OVERALL_COLOR = '#059669'

export default function ProgressView() {
  const { today, habits, completions } = useHabits()
  const [category, setCategory] = useState<string | null>(null)

  const active = activeHabits(habits)
  const categories = [...new Set(active.map((h) => h.category).filter(Boolean))].sort()
  const selectedCategory = category !== null && categories.includes(category) ? category : null
  const shown = active.filter((h) => selectedCategory === null || h.category === selectedCategory)
  const summary = overallSummary(shown, completions, today)

  const doneOn = (day: string) => shown.filter((h) => h.createdAt <= day && doneDays(completions, h.id).has(day)).length
  const liveOn = (day: string) => shown.filter((h) => h.createdAt <= day).length
  const daysWithCheckIns = new Set(shown.flatMap((h) => [...doneDays(completions, h.id)].filter((d) => daysBetween(d, today) < 365))).size

  if (active.length === 0) {
    return (
      <section className={`${cardClass} p-6 text-center`}>
        <h1 className="text-xl font-bold">Progress</h1>
        <p className={`mt-2 ${mutedText}`}>Add a habit and tick it off to start filling in your year.</p>
      </section>
    )
  }

  return (
    <section className="space-y-4" aria-labelledby="progress-heading">
      <h1 id="progress-heading" className="text-2xl font-bold">
        Progress
      </h1>
      <CategoryFilter categories={categories} value={selectedCategory} onChange={setCategory} />
      <SummaryCards summary={summary} />

      <section className={`${cardClass} space-y-3 p-4`} aria-labelledby="overall-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="overall-heading" className="font-semibold">
            Your year{selectedCategory ? `: ${selectedCategory}` : ''}
          </h2>
          <p className={`text-sm ${mutedText}`}>{daysWithCheckIns} days with a check-in</p>
        </div>
        <Heatmap
          today={today}
          color={OVERALL_COLOR}
          levelOf={(day) => levelFor(doneOn(day), liveOn(day))}
          describe={(day) => (liveOn(day) === 0 ? 'no habits yet' : `${doneOn(day)} of ${liveOn(day)} habits done`)}
          summary={`Overall activity over the last year: ${daysWithCheckIns} days with at least one check-in`}
        />
        <div className={`flex items-center justify-end gap-1.5 text-xs ${mutedText}`} aria-hidden>
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`size-3 rounded-sm ${l === 0 ? 'bg-slate-200 dark:bg-slate-800' : ''}`} style={l === 0 ? undefined : { backgroundColor: OVERALL_COLOR, opacity: [0, 0.3, 0.55, 0.78, 1][l] }} />
          ))}
          More
        </div>
      </section>

      <WeekdayBars habits={shown} completions={completions} today={today} />

      <h2 className="pt-2 text-lg font-semibold">Each habit</h2>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        {shown.map((h) => (
          <HabitCard key={h.id} habit={h} />
        ))}
      </div>
    </section>
  )
}
