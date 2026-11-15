export interface HabitColor {
  name: string
  hex: string
}

/** Colours a habit can have. All read clearly as a heatmap square on both light and dark backgrounds. */
export const HABIT_COLORS: readonly HabitColor[] = [
  { name: 'Green', hex: '#16a34a' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Blue', hex: '#0284c7' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Pink', hex: '#db2777' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Amber', hex: '#d97706' },
]

export const DEFAULT_COLOR = HABIT_COLORS[0]?.hex ?? '#16a34a'

export const CATEGORY_SUGGESTIONS: readonly string[] = ['Health', 'Mind', 'Learning', 'Work', 'Home', 'Social']
