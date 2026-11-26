import type { Calendar, CalendarEvent } from '../types'
import type { Translations } from '../i18n/en'
import type { GridItem } from './gridConfig'
import { occurrencesInWeek } from '../lib/events'
import { addDays, toDateString } from '../lib/dates'

// Turns events + calendars into the things to draw, for one or more weeks
// starting on a Monday. Hidden calendars produce nothing.
export function buildGridItems(
  events: CalendarEvent[],
  calendars: Calendar[],
  firstMonday: Date,
  t: Translations,
  weeks = 1,
): GridItem[] {
  const items: GridItem[] = []

  for (const event of events) {
    const calendar = calendars.find((cal) => cal.id === event.calendarId)
    if (!calendar || !calendar.visible) continue

    const allDay = !event.start || !event.end

    // "Lecture · STE B0138" for a class, just the place for anything else
    const parts = [event.sessionType ? t.sessionTypes[event.sessionType] : '', event.location ?? '']
    const detail = parts.filter((part) => part !== '').join(' · ')

    for (let week = 0; week < weeks; week++) {
      for (const day of occurrencesInWeek(event, addDays(firstMonday, week * 7))) {
        items.push({
          id: `${event.id}-${toDateString(day)}`,
          eventId: event.id,
          date: day,
          allDay,
          start: event.start ?? '',
          end: event.end ?? '',
          title: event.title,
          detail,
          color: calendar.color,
          dueKind: event.dueKind,
        })
      }
    }
  }

  // Earliest first; all-day items before timed ones on the same day.
  return items.sort((a, b) =>
    a.date.getTime() - b.date.getTime() || (a.allDay === b.allDay ? a.start.localeCompare(b.start) : a.allDay ? -1 : 1),
  )
}
