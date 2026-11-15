import { cardClass, mutedText } from '../../components/ui'
import { weekdayRates } from '../../lib/stats'
import type { CompletionMap, DateKey, Habit } from '../../types'

const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Props {
  habits: readonly Habit[]
  completions: CompletionMap
  today: DateKey
}

/** How consistent each day of the week has been over the last 90 days, so weak days are easy to spot. */
export function WeekdayBars({ habits, completions, today }: Props) {
  const rates = weekdayRates(habits, completions, today)
  const best = rates.indexOf(Math.max(...rates))
  const worst = rates.indexOf(Math.min(...rates))

  return (
    <section className={`${cardClass} p-4`} aria-labelledby="weekday-heading">
      <h2 id="weekday-heading" className="font-semibold">
        By day of the week
      </h2>
      <p className={`text-sm ${mutedText}`}>
        {rates.every((r) => r === 0) ? 'Tick a few habits to see your pattern.' : `Strongest on ${LABELS[best]}, weakest on ${LABELS[worst]} (last 90 days).`}
      </p>
      <ul className="mt-3 flex h-28 items-end gap-2" aria-label="Completion by weekday">
        {rates.map((rate, i) => (
          <li key={LABELS[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-xs font-medium">{Math.round(rate * 100)}%</span>
            <div className="w-full rounded-t bg-emerald-600" style={{ height: `${Math.max(rate * 100, 2)}%`, opacity: i === best ? 1 : 0.55 }} />
            <span className={`text-xs ${mutedText}`}>{LABELS[i]}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
