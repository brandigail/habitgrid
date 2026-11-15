import { Plus } from 'lucide-react'
import { useState } from 'react'
import { mutedText, primaryButton } from '../../components/ui'
import { useHabits } from '../../providers/habits'
import { HabitForm } from './HabitForm'
import { HabitListItem } from './HabitListItem'

export default function HabitsView() {
  const { habits, addHabit, updateHabit, setArchived, removeHabit } = useHabits()
  const active = habits.filter((h) => h.archivedAt === null)
  const archived = habits.filter((h) => h.archivedAt !== null)
  const categories = [...new Set(habits.map((h) => h.category).filter(Boolean))].sort()
  const [adding, setAdding] = useState(active.length === 0)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <section className="space-y-4" aria-labelledby="habits-heading">
      <div className="flex items-center justify-between gap-2">
        <h1 id="habits-heading" className="text-2xl font-bold">
          Habits
        </h1>
        {!adding && (
          <button type="button" className={primaryButton} onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden /> Add habit
          </button>
        )}
      </div>

      {adding && (
        <HabitForm
          submitLabel="Add habit"
          categories={categories}
          onSubmit={(input) => {
            addHabit(input)
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {active.length === 0 && !adding && <p className={mutedText}>No active habits. Add one to get started.</p>}

      <ul className="space-y-2" aria-label="Active habits">
        {active.map((habit) =>
          editingId === habit.id ? (
            <li key={habit.id}>
              <HabitForm
                initial={{ name: habit.name, category: habit.category, color: habit.color }}
                submitLabel="Save changes"
                categories={categories}
                onSubmit={(input) => {
                  updateHabit(habit.id, input)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            </li>
          ) : (
            <HabitListItem
              key={habit.id}
              habit={habit}
              onEdit={() => setEditingId(habit.id)}
              onArchive={() => setArchived(habit.id, true)}
              onDelete={() => removeHabit(habit.id)}
            />
          ),
        )}
      </ul>

      {archived.length > 0 && (
        <details className="space-y-2">
          <summary className="min-h-11 py-2 text-sm font-medium">Archived ({archived.length})</summary>
          <p className={`text-sm ${mutedText}`}>Archived habits are hidden from your day but keep their history. Restore one any time.</p>
          <ul className="space-y-2" aria-label="Archived habits">
            {archived.map((habit) => (
              <HabitListItem key={habit.id} habit={habit} onRestore={() => setArchived(habit.id, false)} onDelete={() => removeHabit(habit.id)} />
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
