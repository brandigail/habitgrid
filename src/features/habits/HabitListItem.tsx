import { Archive, ArchiveRestore, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { dangerButton, iconButton, mutedText } from '../../components/ui'
import { formatDate } from '../../lib/date'
import type { Habit } from '../../types'

interface Props {
  habit: Habit
  /** Active habits can be edited and archived; archived ones can be restored. Each button only shows when its action is given. */
  onEdit?: () => void
  onArchive?: () => void
  onRestore?: () => void
  onDelete: () => void
}

export function HabitListItem({ habit, onEdit, onArchive, onRestore, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 pl-4 dark:border-slate-800 dark:bg-slate-900">
      <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: habit.color }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{habit.name}</p>
        <p className={`truncate text-xs ${mutedText}`}>
          {habit.category || 'No category'} · {habit.archivedAt ? `archived ${formatDate(habit.archivedAt)}` : `since ${formatDate(habit.createdAt)}`}
        </p>
      </div>
      {confirming ? (
        <button type="button" className={dangerButton} onClick={onDelete} onBlur={() => setConfirming(false)} autoFocus>
          Confirm delete
        </button>
      ) : (
        <>
          {onEdit && (
            <button type="button" className={iconButton} onClick={onEdit} aria-label={`Edit ${habit.name}`}>
              <Pencil className="size-5" aria-hidden />
            </button>
          )}
          {onArchive && (
            <button type="button" className={iconButton} onClick={onArchive} aria-label={`Archive ${habit.name}`}>
              <Archive className="size-5" aria-hidden />
            </button>
          )}
          {onRestore && (
            <button type="button" className={iconButton} onClick={onRestore} aria-label={`Restore ${habit.name}`}>
              <ArchiveRestore className="size-5" aria-hidden />
            </button>
          )}
          <button type="button" className={iconButton} onClick={() => setConfirming(true)} aria-label={`Delete ${habit.name}`}>
            <Trash2 className="size-5" aria-hidden />
          </button>
        </>
      )}
    </li>
  )
}
