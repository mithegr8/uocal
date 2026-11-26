import { describe, expect, it } from 'vitest'
import type { Calendar, CalendarEvent } from '../types'
import { calendarReducer, type CalendarAction, type CalendarData } from './store'
import { sampleCalendars, sampleEvents } from '../data/sample'

const calendar = (id: string, visible = true): Calendar => ({
  id,
  studentId: 'me',
  name: id,
  kind: 'other',
  color: '#000000',
  visible,
})
const event = (id: string, calendarId: string, title = id): CalendarEvent => ({
  id,
  calendarId,
  title,
  date: '2026-11-23',
})

const start = (): CalendarData => ({
  calendars: [calendar('school'), calendar('work', false)],
  events: [event('a', 'school'), event('b', 'work'), event('c', 'school')],
})
const ids = (items: { id: string }[]) => items.map((item) => item.id)

describe('calendarReducer: events', () => {
  it('adds an event with a new id at the end', () => {
    const next = calendarReducer(start(), { type: 'saveEvent', event: event('d', 'work') })
    expect(ids(next.events)).toEqual(['a', 'b', 'c', 'd'])
  })
  it('replaces an event with the same id, in place', () => {
    const next = calendarReducer(start(), { type: 'saveEvent', event: event('b', 'work', 'Edited') })
    expect(ids(next.events)).toEqual(['a', 'b', 'c'])
    expect(next.events[1].title).toBe('Edited')
  })
  it('deletes one event', () => {
    const next = calendarReducer(start(), { type: 'deleteEvent', eventId: 'b' })
    expect(ids(next.events)).toEqual(['a', 'c'])
  })
})

describe('calendarReducer: calendars', () => {
  it('toggles only the chosen calendar, both ways', () => {
    const once = calendarReducer(start(), { type: 'toggleCalendar', calendarId: 'work' })
    expect(once.calendars.map((c) => c.visible)).toEqual([true, true])
    const twice = calendarReducer(once, { type: 'toggleCalendar', calendarId: 'work' })
    expect(twice.calendars.map((c) => c.visible)).toEqual([true, false])
  })
  it('adds a calendar at the end', () => {
    const next = calendarReducer(start(), { type: 'addCalendar', calendar: calendar('gym') })
    expect(ids(next.calendars)).toEqual(['school', 'work', 'gym'])
  })
  it('renames and recolours one calendar, keeping the rest of it', () => {
    const next = calendarReducer(start(), {
      type: 'updateCalendar',
      calendarId: 'work',
      changes: { name: 'Tim Hortons', color: '#0ea5e9' },
    })
    expect(next.calendars[1]).toEqual({ ...calendar('work', false), name: 'Tim Hortons', color: '#0ea5e9' })
    expect(next.calendars[0]).toEqual(calendar('school'))
  })
  it('deletes a calendar together with its events', () => {
    const next = calendarReducer(start(), { type: 'deleteCalendar', calendarId: 'school' })
    expect(ids(next.calendars)).toEqual(['work'])
    expect(ids(next.events)).toEqual(['b'])
  })
})

describe('calendarReducer: safety', () => {
  const actions: CalendarAction[] = [
    { type: 'saveEvent', event: event('d', 'work') },
    { type: 'saveEvent', event: event('a', 'school', 'Edited') },
    { type: 'deleteEvent', eventId: 'a' },
    { type: 'toggleCalendar', calendarId: 'school' },
    { type: 'addCalendar', calendar: calendar('gym') },
    { type: 'updateCalendar', calendarId: 'school', changes: { name: 'x', color: '#ffffff' } },
    { type: 'deleteCalendar', calendarId: 'school' },
  ]
  it.each(actions)('$type never edits the old data', (action) => {
    const before = start()
    const copy = structuredClone(before)
    calendarReducer(before, action)
    expect(before).toEqual(copy)
  })
  it.each([
    { type: 'deleteEvent', eventId: 'nope' },
    { type: 'toggleCalendar', calendarId: 'nope' },
    { type: 'updateCalendar', calendarId: 'nope', changes: { name: 'x', color: '#ffffff' } },
    { type: 'deleteCalendar', calendarId: 'nope' },
  ] as CalendarAction[])('$type with an unknown id changes nothing', (action) => {
    expect(calendarReducer(start(), action)).toEqual(start())
  })
})

describe('sample data', () => {
  it('has unique ids, and every event belongs to a calendar', () => {
    const calendarIds = ids(sampleCalendars)
    expect(new Set(calendarIds).size).toBe(calendarIds.length)
    expect(new Set(ids(sampleEvents)).size).toBe(sampleEvents.length)
    for (const e of sampleEvents) expect(calendarIds).toContain(e.calendarId)
  })
})
