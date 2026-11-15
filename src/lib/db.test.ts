import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Habit } from '../types'
import { DEFAULT_SETTINGS, deleteHabit, loadAll, openHabitDb, putHabit, replaceAll, saveSettings, setCompletion, type HabitDb } from './db'
import { makeDemo } from './demo'

const habit = (id: string): Habit => ({ id, name: `Habit ${id}`, category: 'Health', color: '#16a34a', createdAt: '2026-01-01', archivedAt: null })

let db: HabitDb
let counter = 0

beforeEach(async () => {
  db = await openHabitDb(`test-${counter++}`)
})

describe('storage', () => {
  it('starts empty with default settings', async () => {
    expect(await loadAll(db)).toEqual({ habits: [], completions: [], settings: DEFAULT_SETTINGS })
  })

  it('saves and updates a habit', async () => {
    await putHabit(db, habit('a'))
    await putHabit(db, { ...habit('a'), name: 'Renamed' })
    expect((await loadAll(db)).habits).toEqual([{ ...habit('a'), name: 'Renamed' }])
  })

  it('ticks and unticks a day, and ticking twice keeps one record', async () => {
    await putHabit(db, habit('a'))
    await setCompletion(db, 'a', '2026-11-18', true)
    await setCompletion(db, 'a', '2026-11-18', true)
    expect((await loadAll(db)).completions).toEqual([{ habitId: 'a', date: '2026-11-18' }])
    await setCompletion(db, 'a', '2026-11-18', false)
    await setCompletion(db, 'a', '2026-11-18', false)
    expect((await loadAll(db)).completions).toEqual([])
  })

  it('deleting a habit removes its check-ins and leaves other habits alone', async () => {
    await Promise.all([putHabit(db, habit('a')), putHabit(db, habit('b'))])
    await setCompletion(db, 'a', '2026-11-17', true)
    await setCompletion(db, 'a', '2026-11-18', true)
    await setCompletion(db, 'b', '2026-11-18', true)
    await deleteHabit(db, 'a')
    const data = await loadAll(db)
    expect(data.habits.map((h) => h.id)).toEqual(['b'])
    expect(data.completions).toEqual([{ habitId: 'b', date: '2026-11-18' }])
  })

  it('keeps settings across loads', async () => {
    await saveSettings(db, { reminderTime: '08:00', theme: 'dark' })
    expect((await loadAll(db)).settings).toEqual({ reminderTime: '08:00', theme: 'dark' })
  })

  it('replaces everything at once', async () => {
    await putHabit(db, habit('old'))
    await setCompletion(db, 'old', '2026-11-18', true)
    const demo = makeDemo('2026-11-18')
    await replaceAll(db, { ...demo, settings: { reminderTime: null, theme: 'light' } })
    const data = await loadAll(db)
    expect(data.habits).toHaveLength(demo.habits.length)
    expect(data.completions).toHaveLength(demo.completions.length)
    expect(data.habits.some((h) => h.id === 'old')).toBe(false)
    expect(data.settings.theme).toBe('light')
  })
})
