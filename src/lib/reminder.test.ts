import { describe, expect, it } from 'vitest'
import { isDue, nextFireAt } from './reminder'

describe('nextFireAt', () => {
  it('is later today when the time has not passed', () => {
    expect(nextFireAt('20:30', new Date(2026, 10, 18, 9, 0))).toEqual(new Date(2026, 10, 18, 20, 30))
  })

  it('is tomorrow once the time has passed, including exactly at the time', () => {
    expect(nextFireAt('08:00', new Date(2026, 10, 18, 9, 0))).toEqual(new Date(2026, 10, 19, 8, 0))
    expect(nextFireAt('08:00', new Date(2026, 10, 18, 8, 0))).toEqual(new Date(2026, 10, 19, 8, 0))
  })

  it('rolls over month and year ends', () => {
    expect(nextFireAt('08:00', new Date(2026, 11, 31, 23, 0))).toEqual(new Date(2027, 0, 1, 8, 0))
  })
})

describe('isDue', () => {
  const now = new Date(2026, 10, 18, 21, 0)

  it('is due after the time when nothing was shown today', () => {
    expect(isDue('20:30', now, null)).toBe(true)
    expect(isDue('20:30', now, '2026-11-17')).toBe(true)
  })

  it('is not due before the time', () => {
    expect(isDue('22:00', now, null)).toBe(false)
  })

  it('is not due again once shown today', () => {
    expect(isDue('20:30', now, '2026-11-18')).toBe(false)
  })
})
