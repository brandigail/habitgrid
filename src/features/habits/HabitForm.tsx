import { useId, useState, type CSSProperties, type FormEvent } from 'react'
import { errorText, inputClass, primaryButton, secondaryButton } from '../../components/ui'
import { LIMITS } from '../../lib/backup'
import { CATEGORY_SUGGESTIONS, DEFAULT_COLOR, HABIT_COLORS } from '../../lib/palette'
import type { HabitInput } from '../../providers/habits'

interface Props {
  initial?: HabitInput
  submitLabel: string
  categories: readonly string[]
  onSubmit: (input: HabitInput) => void
  onCancel: () => void
}

export function HabitForm({ initial, submitLabel, categories, onSubmit, onCancel }: Props) {
  const id = useId()
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [color, setColor] = useState(initial?.color ?? DEFAULT_COLOR)
  const [error, setError] = useState<string | null>(null)
  const suggestions = [...new Set([...categories, ...CATEGORY_SUGGESTIONS])]

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Give the habit a name.')
      return
    }
    onSubmit({ name: name.trim(), category: category.trim(), color })
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-emerald-300 bg-white p-4 dark:border-emerald-800 dark:bg-slate-900" aria-label={initial ? 'Edit habit' : 'New habit'}>
      <div>
        <label htmlFor={`${id}-name`} className="text-sm font-medium">
          Name
        </label>
        <input
          id={`${id}-name`}
          className={inputClass}
          value={name}
          maxLength={LIMITS.nameLength}
          placeholder="For example: Read 20 pages"
          aria-invalid={error !== null}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
          autoFocus
        />
        {error && (
          <p id={`${id}-error`} role="alert" className={`mt-1 text-sm ${errorText}`}>
            {error}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={`${id}-category`} className="text-sm font-medium">
          Category
        </label>
        <input id={`${id}-category`} className={inputClass} value={category} maxLength={LIMITS.categoryLength} list={`${id}-categories`} placeholder="Health, Mind, Learning…" onChange={(e) => setCategory(e.target.value)} />
        <datalist id={`${id}-categories`}>
          {suggestions.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <fieldset>
        <legend className="text-sm font-medium">Colour</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {HABIT_COLORS.map((c) => (
            <label key={c.hex} className="relative">
              <input type="radio" name={`${id}-color`} value={c.hex} checked={color === c.hex} onChange={() => setColor(c.hex)} className="peer sr-only" />
              <span
                className="flex size-11 items-center justify-center rounded-full ring-offset-2 ring-offset-white peer-checked:ring-2 peer-focus-visible:ring-2 dark:ring-offset-slate-900"
                style={{ backgroundColor: c.hex, '--tw-ring-color': c.hex } as CSSProperties}
              >
                {color === c.hex && <span aria-hidden className="size-3 rounded-full bg-white" />}
              </span>
              <span className="sr-only">{c.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={primaryButton}>
          {submitLabel}
        </button>
        <button type="button" className={secondaryButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
