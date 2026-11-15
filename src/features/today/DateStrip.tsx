import { useEffect, useRef } from 'react'
import { dayOfMonth, formatDate, lastDays, shortWeekday } from '../../lib/date'
import { dayComplete } from '../../lib/stats'
import { useHabits } from '../../providers/habits'
import type { DateKey } from '../../types'

const DAYS_SHOWN = 14

interface Props {
  selected: DateKey
  onSelect: (day: DateKey) => void
}

/** The last two weeks as tappable days, so a missed check-in can be filled in. A dot marks days where everything was done. */
export function DateStrip({ selected, onSelect }: Props) {
  const { today, habits, completions } = useHabits()
  const strip = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = strip.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  return (
    <div ref={strip} role="group" aria-label="Choose a day" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
      {lastDays(today, DAYS_SHOWN).map((day) => {
        const active = day === selected
        const complete = dayComplete(habits, completions, day)
        return (
          <button
            key={day}
            type="button"
            aria-pressed={active}
            aria-label={`${formatDate(day)}${day === today ? ', today' : ''}${complete ? ', all habits done' : ''}`}
            onClick={() => onSelect(day)}
            className={`flex min-h-16 w-12 shrink-0 flex-col items-center justify-center rounded-xl border text-xs transition-colors ${
              active
                ? 'border-emerald-700 bg-emerald-700 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <span>{shortWeekday(day)}</span>{' '}
            <span className="text-base font-semibold">{dayOfMonth(day)}</span>
            <span aria-hidden className={`mt-0.5 size-1.5 rounded-full ${complete ? (active ? 'bg-white' : 'bg-emerald-600') : 'bg-transparent'}`} />
          </button>
        )
      })}
    </div>
  )
}
