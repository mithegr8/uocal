import { describe, expect, it } from 'vitest'
import type { Calendar, CalendarEvent } from '../types'
import { getVisibleEvents } from './events'
import { getFreeSlots, type FreeSlotOptions } from './freeSlots'

const monday = new Date(2026, 10, 23)

const event = (fields: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: 'e1',
  calendarId: 'c1',
  title: 'Event',
  date: '2026-11-23',
  ...fields,
})
const at = (start: string, end: string, fields: Partial<CalendarEvent> = {}) =>
  event({ start, end, ...fields })

// Free slots on one date, as "start-end" text.
const slotsOn = (date: string, events: CalendarEvent[], options?: FreeSlotOptions) =>
  getFreeSlots(events, monday, options)
    .filter((slot) => slot.date === date)
    .map((slot) => `${slot.start}-${slot.end}`)
const mondaySlots = (events: CalendarEvent[], options?: FreeSlotOptions) =>
  slotsOn('2026-11-23', events, options)

describe('getFreeSlots: the week', () => {
  it('gives one full slot per day, Monday to Sunday, when nothing is planned', () => {
    const dates = [23, 24, 25, 26, 27, 28, 29].map((d) => `2026-11-${d}`)
    expect(getFreeSlots([], monday)).toEqual(
      dates.map((date) => ({ date, start: '08:00', end: '22:00' })),
    )
  })
  it('accepts any day of the week', () => {
    expect(getFreeSlots([], new Date(2026, 10, 29, 18))).toEqual(getFreeSlots([], monday))
  })
  it.each([
    ['spring', new Date(2026, 2, 2), '2026-03-08'],
    ['fall', new Date(2026, 9, 26), '2026-11-01'],
  ])('handles the %s clock change', (_, start, sunday) => {
    const slots = getFreeSlots([], start)
    expect(slots).toHaveLength(7)
    expect(slots[6]).toEqual({ date: sunday, start: '08:00', end: '22:00' })
  })
  it('ignores events in other weeks', () => {
    expect(getFreeSlots([at('10:00', '11:00', { date: '2026-11-30' })], monday)).toEqual(
      getFreeSlots([], monday),
    )
  })
  it('counts repeating events', () => {
    const lecture = at('10:00', '11:30', {
      date: '2026-09-08',
      repeat: { days: ['Tue', 'Thu'], until: '2026-12-04' },
    })
    expect(slotsOn('2026-11-24', [lecture])).toEqual(['08:00-10:00', '11:30-22:00'])
    expect(slotsOn('2026-11-25', [lecture])).toEqual(['08:00-22:00'])
    expect(slotsOn('2026-11-26', [lecture])).toEqual(['08:00-10:00', '11:30-22:00'])
  })
})

describe('getFreeSlots: gaps', () => {
  it('splits the day, whatever order events come in', () => {
    const events = [at('14:00', '15:00'), at('10:00', '11:00')]
    expect(mondaySlots(events)).toEqual(['08:00-10:00', '11:00-14:00', '15:00-22:00'])
  })
  it('merges overlapping, nested and touching events', () => {
    expect(mondaySlots([at('10:00', '12:00'), at('11:00', '13:00')])).toEqual([
      '08:00-10:00',
      '13:00-22:00',
    ])
    expect(mondaySlots([at('10:00', '14:00'), at('11:00', '12:00')])).toEqual([
      '08:00-10:00',
      '14:00-22:00',
    ])
    expect(mondaySlots([at('10:00', '11:00'), at('11:00', '12:00')])).toEqual([
      '08:00-10:00',
      '12:00-22:00',
    ])
  })
  it('clips events at the edges of the day and ignores those outside it', () => {
    expect(mondaySlots([at('07:00', '09:00'), at('21:00', '23:00')])).toEqual(['09:00-21:00'])
    expect(mondaySlots([at('05:00', '06:00'), at('22:30', '23:30')])).toEqual(['08:00-22:00'])
  })
  it('gives nothing on a full day', () => {
    expect(mondaySlots([at('08:00', '22:00')])).toEqual([])
  })
  it('skips gaps under 30 minutes but keeps gaps of exactly 30', () => {
    const short = [at('08:00', '12:00'), at('12:29', '22:00')]
    const exact = [at('08:00', '12:00'), at('12:30', '22:00')]
    expect(mondaySlots(short)).toEqual([])
    expect(mondaySlots(exact)).toEqual(['12:00-12:30'])
  })
  it('follows the options', () => {
    expect(
      mondaySlots([at('10:00', '11:00'), at('11:45', '13:00')], {
        dayStart: '00:00',
        dayEnd: '24:00',
        minMinutes: 60,
      }),
    ).toEqual(['00:00-10:00', '13:00-24:00'])
  })
  it('never returns empty slots, even with no minimum', () => {
    expect(mondaySlots([at('08:00', '22:00')], { minMinutes: 0 })).toEqual([])
  })
})

describe('getFreeSlots: what blocks time', () => {
  it('lets all-day events, deadlines and zero-length events pass', () => {
    const events = [event(), at('12:00', '13:00', { dueKind: 'deadline' }), at('15:00', '15:00')]
    expect(mondaySlots(events)).toEqual(['08:00-22:00'])
  })
  it('blocks exams', () => {
    expect(mondaySlots([at('09:00', '12:00', { dueKind: 'exam' })])).toEqual([
      '08:00-09:00',
      '12:00-22:00',
    ])
  })
  it('treats a start with no end as all day, like the grid', () => {
    expect(mondaySlots([event({ start: '10:00' })])).toEqual(['08:00-22:00'])
  })
})

describe('getFreeSlots: overnight events', () => {
  const wholeDay = { dayStart: '00:00', dayEnd: '24:00' }
  it('blocks both sides of midnight', () => {
    const shift = [at('22:00', '02:00')]
    expect(mondaySlots(shift, wholeDay)).toEqual(['00:00-22:00'])
    expect(slotsOn('2026-11-24', shift, wholeDay)).toEqual(['02:00-24:00'])
  })
  it('carries over from the Sunday before the week', () => {
    expect(mondaySlots([at('20:00', '10:00', { date: '2026-11-22' })])).toEqual(['10:00-22:00'])
  })
  it('carries over the last repeat past its until date', () => {
    const shift = at('22:00', '09:00', {
      date: '2026-11-16',
      repeat: { days: ['Mon'], until: '2026-11-23' },
    })
    expect(slotsOn('2026-11-24', [shift])).toEqual(['09:00-22:00'])
  })
})

describe('getFreeSlots with getVisibleEvents', () => {
  it('counts every visible calendar and no hidden one', () => {
    const calendar = (id: string, visible: boolean): Calendar => ({
      id,
      studentId: 's1',
      name: id,
      kind: 'other',
      color: '#000000',
      visible,
    })
    const calendars = [calendar('classes', true), calendar('work', true), calendar('gym', false)]
    const events = [
      at('09:00', '10:00', { calendarId: 'classes' }),
      at('12:00', '13:00', { calendarId: 'work' }),
      at('16:00', '17:00', { calendarId: 'gym' }),
    ]
    expect(mondaySlots(getVisibleEvents(events, calendars))).toEqual([
      '08:00-09:00',
      '10:00-12:00',
      '13:00-22:00',
    ])
  })
})
