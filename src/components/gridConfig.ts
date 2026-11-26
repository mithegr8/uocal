// Settings shared by every part of the calendar views.
// Change them here and every view follows.

export const HOURS = Array.from({ length: 24 }, (_, hour) => hour) // [0, 1, 2, … 23]
export const HOUR_HEIGHT = 48 // pixels per hour
export const SCROLL_TO_HOUR = 7 // the week grid opens scrolled to 7 AM

// Colors offered when creating or editing a calendar.
export const CALENDAR_COLORS = ['#e11d48', '#f97316', '#eab308', '#16a34a', '#0ea5e9', '#6366f1', '#a855f7', '#78716c']

// One thing to draw: one occurrence of an event, ready to display.
export type GridItem = {
  id: string
  eventId: string // the CalendarEvent it comes from (to open it for editing)
  date: Date
  allDay: boolean
  start: string // "10:00" ("" when all day)
  end: string // "11:20" ("" when all day)
  title: string // "CSI 2110"
  detail: string // "Lecture · STE B0138"
  color: string // the calendar's color
  dueKind?: 'deadline' | 'exam'
}
