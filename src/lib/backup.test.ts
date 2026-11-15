import { describe, expect, it } from 'vitest'
import type { Habit, Settings } from '../types'
import { isValidTime, parseBackup, toBackup } from './backup'

const habit: Habit = { id: 'h1', name: 'Read', category: 'Learning', color: '#4f46e5', createdAt: '2026-01-01', archivedAt: null }
const settings: Settings = { reminderTime: '20:30', theme: 'dark' }
const file = (patch: Record<string, unknown> = {}) =>
  JSON.stringify({ ...toBackup([habit], [{ habitId: 'h1', date: '2026-02-01' }], settings, new Date('2026-11-18T10:00:00Z')), ...patch })

describe('toBackup and parseBackup', () => {
  it('round-trips habits, check-ins and settings', () => {
    const result = parseBackup(file())
    expect(result).toEqual({ ok: true, data: expect.objectContaining({ habits: [habit], completions: [{ habitId: 'h1', date: '2026-02-01' }], settings }) })
  })

  it('drops duplicate check-ins instead of failing', () => {
    const result = parseBackup(file({ completions: [{ habitId: 'h1', date: '2026-02-01' }, { habitId: 'h1', date: '2026-02-01' }] }))
    expect(result.ok && result.data.completions).toHaveLength(1)
  })

  it('falls back to safe settings when they are missing or wrong', () => {
    const result = parseBackup(file({ settings: { theme: 'neon', reminderTime: '25:99' } }))
    expect(result.ok && result.data.settings).toEqual({ theme: 'system', reminderTime: null })
  })
})

describe('parseBackup rejects bad files', () => {
  const cases: [string, string][] = [
    ['not JSON', 'nope'],
    ['a different app', file({ app: 'other' })],
    ['a different version', file({ version: 2 })],
    ['missing arrays', JSON.stringify({ app: 'habitgrid', version: 1 })],
    ['an invalid colour', file({ habits: [{ ...habit, color: 'red' }] })],
    ['an impossible date', file({ completions: [{ habitId: 'h1', date: '2026-02-30' }] })],
    ['an unknown habit', file({ completions: [{ habitId: 'ghost', date: '2026-02-01' }] })],
    ['duplicate ids', file({ habits: [habit, habit] })],
    ['an empty name', file({ habits: [{ ...habit, name: '  ' }] })],
    ['a very long name', file({ habits: [{ ...habit, name: 'x'.repeat(61) }] })],
  ]
  it.each(cases)('rejects %s', (_label, text) => {
    const result = parseBackup(text)
    expect(result.ok).toBe(false)
    expect(!result.ok && result.error.length).toBeGreaterThan(5)
  })
})

describe('isValidTime', () => {
  it('accepts HH:MM in 24 hour time only', () => {
    expect(['00:00', '08:05', '23:59'].every(isValidTime)).toBe(true)
    expect(['24:00', '8:05', '12:60', '', 'noon'].some(isValidTime)).toBe(false)
  })
})
