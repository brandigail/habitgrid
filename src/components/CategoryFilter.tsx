import { chipClass } from './ui'

interface Props {
  categories: readonly string[]
  value: string | null
  onChange: (category: string | null) => void
}

/** Filter chips for the habit categories. Hidden when there is only one category to choose from. */
export function CategoryFilter({ categories, value, onChange }: Props) {
  if (categories.length < 2) return null
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Filter by category">
      <li>
        <button type="button" className={chipClass(value === null)} aria-pressed={value === null} onClick={() => onChange(null)}>
          All
        </button>
      </li>
      {categories.map((c) => (
        <li key={c}>
          <button type="button" className={chipClass(value === c)} aria-pressed={value === c} onClick={() => onChange(value === c ? null : c)}>
            {c}
          </button>
        </li>
      ))}
    </ul>
  )
}
