import { useMemo, useReducer } from 'react'
import type { Calendar, CalendarEvent } from '../types'
import { sampleCalendars, sampleEvents } from '../data/sample'

// The student's calendars and events, in one place.
// Screens call useCalendarData() instead of reading src/data/sample.ts.
// For now everything lives in memory and starts from the sample data;
// saving it (B2.3) will only change this file.

export type CalendarData = {
  calendars: Calendar[]
  events: CalendarEvent[]
}

export type CalendarChanges = { name: string; color: string }

// Every change the app can make. calendarReducer applies one at a time.
export type CalendarAction =
  | { type: 'saveEvent'; event: CalendarEvent }
  | { type: 'deleteEvent'; eventId: string }
  | { type: 'toggleCalendar'; calendarId: string }
  | { type: 'addCalendar'; calendar: Calendar }
  | { type: 'updateCalendar'; calendarId: string; changes: CalendarChanges }
  | { type: 'deleteCalendar'; calendarId: string }

// Takes the data and one change, and returns the new data. Never edits the old data.
export function calendarReducer(data: CalendarData, action: CalendarAction): CalendarData {
  const { calendars, events } = data

  switch (action.type) {
    case 'saveEvent': {
      // Same id = edit, new id = add.
      const { event } = action
      const exists = events.some((e) => e.id === event.id)
      return {
        ...data,
        events: exists ? events.map((e) => (e.id === event.id ? event : e)) : [...events, event],
      }
    }
    case 'deleteEvent':
      return { ...data, events: events.filter((e) => e.id !== action.eventId) }

    case 'toggleCalendar':
      return {
        ...data,
        calendars: calendars.map((c) => (c.id === action.calendarId ? { ...c, visible: !c.visible } : c)),
      }
    case 'addCalendar':
      return { ...data, calendars: [...calendars, action.calendar] }

    case 'updateCalendar':
      return {
        ...data,
        calendars: calendars.map((c) => (c.id === action.calendarId ? { ...c, ...action.changes } : c)),
      }
    case 'deleteCalendar':
      return {
        calendars: calendars.filter((c) => c.id !== action.calendarId),
        events: events.filter((e) => e.calendarId !== action.calendarId), // its events go too
      }
  }
}

const sampleData: CalendarData = { calendars: sampleCalendars, events: sampleEvents }

// The hook screens use. Same names App.tsx used before.
export function useCalendarData(initialData: CalendarData = sampleData) {
  const [data, dispatch] = useReducer(calendarReducer, initialData)

  // dispatch never changes, so these functions are made once.
  const actions = useMemo(
    () => ({
      saveEvent: (event: CalendarEvent) => dispatch({ type: 'saveEvent', event }),
      deleteEvent: (eventId: string) => dispatch({ type: 'deleteEvent', eventId }),
      toggleCalendar: (calendarId: string) => dispatch({ type: 'toggleCalendar', calendarId }),
      addCalendar: (name: string, color: string) =>
        dispatch({
          type: 'addCalendar',
          calendar: { id: crypto.randomUUID(), studentId: 'me', name, kind: 'other', color, visible: true },
        }),
      updateCalendar: (calendarId: string, changes: CalendarChanges) =>
        dispatch({ type: 'updateCalendar', calendarId, changes }),
      deleteCalendar: (calendarId: string) => dispatch({ type: 'deleteCalendar', calendarId }),
    }),
    [],
  )

  return { ...data, ...actions }
}
