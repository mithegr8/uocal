import { describe, expect, it } from 'vitest'
import type { Calendar, CalendarEvent } from '../types'
import { addDays, parseDate, toDateString } from './dates'
import { getVisibleEvents, occurrencesInWeek, occursOn } from './events'

const event = (fields: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: 'e1',
  calendarId: 'c1',
  title: 'Event',
  date: '2026-11-24', // a Tuesday
  ...fields,
})

const calendar = (id: string, visible: boolean): Calendar => ({
  id,
  studentId: 's1',
  name: id,
  kind: 'classes',
  color: '#000000',
  visible,
})

describe('getVisibleEvents', () => {
  const a = event({ id: 'a', calendarId: 'c1' })
  const b = event({ id: 'b', calendarId: 'c2' })
  it('drops events from hidden calendars', () => {
    expect(getVisibleEvents([a, b], [calendar('c1', true), calendar('c2', false)])).toEqual([a])
  })
  it('keeps events from every visible calendar, in order', () => {
    expect(getVisibleEvents([a, b], [calendar('c2', true), calendar('c1', true)])).toEqual([a, b])
  })
  it('drops events whose calendar does not exist', () => {
    expect(getVisibleEvents([a], [])).toEqual([])
  })
})

describe('occursOn', () => {
  it('matches a one-time event only on its date', () => {
    expect(occursOn(event(), parseDate('2026-11-24'))).toBe(true)
    expect(occursOn(event(), parseDate('2026-12-01'))).toBe(false)
  })

  const repeating = event({ repeat: { days: ['Tue', 'Thu'], until: '2026-12-03' } })
  it.each([
    ['2026-11-19', false], // right weekday, before the first time
    ['2026-11-24', true], // first time
    ['2026-11-25', false], // wrong weekday
    ['2026-11-26', true],
    ['2026-12-03', true], // last day is included
    ['2026-12-08', false], // after the last day
  ])('repeating event on %s: %s', (date, expected) => {
    expect(occursOn(repeating, parseDate(date))).toBe(expected)
  })

  it('skips the first date if its weekday is not in the repeat days', () => {
    const odd = event({ repeat: { days: ['Fri'], until: '2026-12-31' } })
    expect(occursOn(odd, parseDate('2026-11-24'))).toBe(false)
    expect(occursOn(odd, parseDate('2026-11-27'))).toBe(true)
  })
})

describe('occurrencesInWeek', () => {
  const monday = new Date(2026, 10, 23)
  const days = (e: CalendarEvent, weekStart = monday) =>
    occurrencesInWeek(e, weekStart).map(toDateString)

  it('finds a one-time event in its week only', () => {
    expect(days(event())).toEqual(['2026-11-24'])
    expect(days(event({ date: '2026-12-01' }))).toEqual([])
  })
  it('finds each repeat day, in order', () => {
    const lecture = event({ date: '2026-09-01', repeat: { days: ['Thu', 'Mon'], until: '2026-12-31' } })
    expect(days(lecture)).toEqual(['2026-11-23', '2026-11-26'])
  })
  it('cuts the week at the first date and at "until" (included)', () => {
    const starts = event({ date: '2026-11-25', repeat: { days: ['Mon', 'Fri'], until: '2026-12-31' } })
    const ends = event({ date: '2026-09-01', repeat: { days: ['Mon', 'Fri'], until: '2026-11-27' } })
    const ended = event({ date: '2026-09-01', repeat: { days: ['Mon', 'Fri'], until: '2026-11-22' } })
    expect(days(starts)).toEqual(['2026-11-27'])
    expect(days(ends)).toEqual(['2026-11-23', '2026-11-27'])
    expect(days(ended)).toEqual([])
  })
  it('crosses a year end', () => {
    const daily = event({
      date: '2026-12-01',
      repeat: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], until: '2027-01-02' },
    })
    expect(days(daily, new Date(2026, 11, 28))).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ])
  })
  it('agrees with occursOn on every day', () => {
    const lecture = event({ date: '2026-11-17', repeat: { days: ['Tue', 'Sun'], until: '2026-11-29' } })
    for (let i = 0; i < 7; i++) {
      const day = addDays(monday, i)
      expect(days(lecture).includes(toDateString(day))).toBe(occursOn(lecture, day))
    }
  })
})
