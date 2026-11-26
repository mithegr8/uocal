import { describe, expect, it } from 'vitest'
import {
  addDays,
  isSameDay,
  minutesToTime,
  parseDate,
  startOfWeek,
  toMinutes,
  toDateString,
  weekdayOf,
} from './dates'

describe('addDays', () => {
  it('crosses month and year ends, forwards and back', () => {
    expect(toDateString(addDays(new Date(2026, 11, 31), 1))).toBe('2027-01-01')
    expect(toDateString(addDays(new Date(2026, 2, 1), -1))).toBe('2026-02-28')
    expect(toDateString(addDays(new Date(2028, 1, 28), 1))).toBe('2028-02-29')
  })
  it('does not change the original date', () => {
    const date = new Date(2026, 10, 25)
    addDays(date, 3)
    expect(date).toEqual(new Date(2026, 10, 25))
  })
  it('stays at midnight across both clock changes', () => {
    expect(addDays(new Date(2026, 2, 8), 1)).toEqual(new Date(2026, 2, 9))
    expect(addDays(new Date(2026, 10, 1), 1)).toEqual(new Date(2026, 10, 2))
  })
})

describe('startOfWeek', () => {
  it('gives the same Monday at midnight for all seven days', () => {
    for (let day = 23; day <= 29; day++) {
      expect(startOfWeek(new Date(2026, 10, day, 15, 30))).toEqual(new Date(2026, 10, 23))
    }
  })
  it('crosses a year end', () => {
    expect(startOfWeek(new Date(2027, 0, 1))).toEqual(new Date(2026, 11, 28))
  })
  it('does not change the original date', () => {
    const date = new Date(2026, 10, 25, 15)
    startOfWeek(date)
    expect(date).toEqual(new Date(2026, 10, 25, 15))
  })
})

describe('isSameDay', () => {
  const day = new Date(2026, 10, 25, 0, 0)
  it('ignores the time', () => {
    expect(isSameDay(day, new Date(2026, 10, 25, 23, 59))).toBe(true)
  })
  it('compares day, month and year', () => {
    expect(isSameDay(day, new Date(2026, 10, 26))).toBe(false)
    expect(isSameDay(day, new Date(2026, 9, 25))).toBe(false)
    expect(isSameDay(day, new Date(2025, 10, 25))).toBe(false)
  })
})

describe('weekdayOf', () => {
  it('names each day, Monday to Sunday', () => {
    const names = [23, 24, 25, 26, 27, 28, 29].map((d) => weekdayOf(new Date(2026, 10, d)))
    expect(names).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
  })
})

describe('parseDate and toDateString', () => {
  it('reads a date as local midnight', () => {
    expect(parseDate('2026-11-12')).toEqual(new Date(2026, 10, 12))
  })
  it('pads and uses the local day, early and late', () => {
    expect(toDateString(new Date(2026, 0, 5, 0, 0))).toBe('2026-01-05')
    expect(toDateString(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
  it('round-trips', () => {
    expect(toDateString(parseDate('2028-02-29'))).toBe('2028-02-29')
  })
})

describe('toMinutes and minutesToTime', () => {
  it.each([
    ['00:00', 0],
    ['09:05', 545],
    ['14:30', 870],
    ['24:00', 1440],
  ])('%s is %i minutes', (time, minutes) => {
    expect(toMinutes(time)).toBe(minutes)
    expect(minutesToTime(minutes)).toBe(time)
  })
})
