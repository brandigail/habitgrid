import { Flame, Trophy } from 'lucide-react'
import { cardClass, mutedText } from '../../components/ui'
import type { OverallSummary } from '../../lib/stats'

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

export function SummaryCards({ summary }: { summary: OverallSummary }) {
  const cards = [
    { label: 'Done today', value: `${summary.doneToday} / ${summary.habitCount}`, note: `${plural(summary.totalCheckIns, 'check-in')} all time` },
    {
      label: 'Best current streak',
      value: plural(summary.bestCurrent?.days ?? 0, 'day'),
      note: summary.bestCurrent?.name ?? 'Start one today',
      icon: <Flame className="size-4 text-orange-600" aria-hidden />,
    },
    {
      label: 'Longest streak ever',
      value: plural(summary.longestEver?.days ?? 0, 'day'),
      note: summary.longestEver?.name ?? 'Not yet',
      icon: <Trophy className="size-4 text-amber-600" aria-hidden />,
    },
    { label: 'Last 30 days', value: `${Math.round(summary.rate30 * 100)}%`, note: `${plural(summary.perfectDays30, 'perfect day')}` },
  ]
  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className={`${cardClass} p-4`}>
          <dt className={`flex items-center gap-1.5 text-xs ${mutedText}`}>
            {c.icon}
            {c.label}
          </dt>
          <dd className="mt-1 text-2xl font-bold">{c.value}</dd>
          <dd className={`truncate text-xs ${mutedText}`}>{c.note}</dd>
        </div>
      ))}
    </dl>
  )
}
