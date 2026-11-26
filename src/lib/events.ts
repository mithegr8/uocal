import type { Calendar, CalendarEvent, Weekday } from '../types'
import { addDays, toDateString, weekdayOf } from './dates'

const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Which days of this week does the event happen on?
// A one-time event: only its own date. A repeating event: every matching weekday
// between its first date and its "until" date.
export function occurrencesInWeek(event: CalendarEvent, weekStart: Date): Date[] {
  const result: Date[] = []

  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i)
    const dayString = toDateString(day)

    if (dayString < event.date) continue // before it starts

    if (event.repeat) {
      if (dayString > event.repeat.until) continue // after it ends
      if (event.repeat.days.includes(WEEKDAYS[i])) result.push(day)
    } else if (dayString === event.date) {
      result.push(day)
    }
  }

  return result
}

// Does the event happen on this one day? Same rules as occurrencesInWeek.
export function occursOn(event: CalendarEvent, day: Date): boolean {
  const dayString = toDateString(day)
  if (dayString < event.date) return false // before it starts
  if (!event.repeat) return dayString === event.date
  return dayString <= event.repeat.until && event.repeat.days.includes(weekdayOf(day))
}

// Keeps only the events whose calendar is ticked (visible), like the grid does.
export function getVisibleEvents(events: CalendarEvent[], calendars: Calendar[]): CalendarEvent[] {
  const visibleIds = new Set(calendars.filter((c) => c.visible).map((c) => c.id))
  return events.filter((event) => visibleIds.has(event.calendarId))
}
