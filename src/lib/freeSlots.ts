import type { CalendarEvent, DateString, TimeString } from '../types'
import { addDays, minutesToTime, startOfWeek, toDateString, toMinutes } from './dates'
import { occursOn } from './events'

export type FreeSlot = {
  date: DateString
  start: TimeString
  end: TimeString // "24:00" when dayEnd is midnight
}

export type FreeSlotOptions = {
  dayStart?: TimeString // ignore time before this
  dayEnd?: TimeString // ignore time after this, up to "24:00"
  minMinutes?: number // skip gaps shorter than this
}

type Busy = { start: number; end: number } // minutes since midnight

const DAY = 24 * 60

// The minutes an event takes up, from midnight of the day it starts.
// Returns null when it doesn't block time. "end" passes 1440 for overnight events.
function busyTime(event: CalendarEvent): Busy | null {
  // No start or no end = all day, the same rule as the grid (e.g. a birthday).
  if (!event.start || !event.end) return null
  if (event.dueKind === 'deadline') return null // a due time, not time spent
  const start = toMinutes(event.start)
  const end = toMinutes(event.end)
  if (end === start) return null
  return { start, end: end < start ? end + DAY : end }
}

// Every busy stretch on one day, including last night's events that run past midnight.
function busyOnDay(events: CalendarEvent[], day: Date): Busy[] {
  const dayBefore = addDays(day, -1)
  const result: Busy[] = []
  for (const event of events) {
    const busy = busyTime(event)
    if (!busy) continue
    if (occursOn(event, day)) result.push(busy)
    if (busy.end > DAY && occursOn(event, dayBefore)) {
      result.push({ start: 0, end: busy.end - DAY })
    }
  }
  return result.sort((a, b) => a.start - b.start)
}

// The free time in the Monday–Sunday week containing weekStart, in date order.
// Pass only visible events: getFreeSlots(getVisibleEvents(events, calendars), weekStart)
export function getFreeSlots(
  events: CalendarEvent[],
  weekStart: Date,
  { dayStart = '08:00', dayEnd = '22:00', minMinutes = 30 }: FreeSlotOptions = {},
): FreeSlot[] {
  const monday = startOfWeek(weekStart)
  const opens = toMinutes(dayStart)
  const closes = toMinutes(dayEnd)
  const slots: FreeSlot[] = []

  for (let i = 0; i < 7; i++) {
    const day = addDays(monday, i)
    let freeFrom = opens // everything before this is already handled

    const addSlot = (until: number) => {
      const end = Math.min(until, closes)
      if (end > freeFrom && end - freeFrom >= minMinutes) {
        slots.push({
          date: toDateString(day),
          start: minutesToTime(freeFrom),
          end: minutesToTime(end),
        })
      }
    }

    for (const busy of busyOnDay(events, day)) {
      addSlot(busy.start)
      freeFrom = Math.max(freeFrom, busy.end) // max: overlapping events merge
    }
    addSlot(closes)
  }
  return slots
}
