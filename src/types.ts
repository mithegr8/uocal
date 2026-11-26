// Shared data types for uoCalendar.
// These match the class diagram. Both lanes use them, so change them together.

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

// "YYYY-MM-DD", e.g. "2026-11-12"
export type DateString = string
// "HH:MM" in 24-hour time, e.g. "14:30"
export type TimeString = string

export type Student = {
  id: string
  name: string
  email: string
  faculty: string // e.g. "Engineering"
  program: string // e.g. "Computer Science"
  year: number // 1, 2, 3, 4…
  isInternational: boolean
  interests: string[] // e.g. ["co-op", "hackathons", "soccer"]
}

export type Course = {
  id: string
  code: string // e.g. "CSI 2110"
  title: string
  term: string // e.g. "Fall 2026"
  professor?: string // the ? means "optional"
  color: string // e.g. "#e11d48", used on the calendar
}

// A student has several calendars, like in Google Calendar:
// "Classes", "Work", "Personal"… each with its own color, shown or hidden.
export type CalendarKind = 'classes' | 'work' | 'personal' | 'other'

export type Calendar = {
  id: string
  studentId: string
  name: string // the student's own name for it, e.g. "Job at Tim Hortons"
  kind: CalendarKind
  color: string // e.g. "#0ea5e9"
  visible: boolean // unticked = hidden from the grid
}

// How an event repeats. A lecture or a work shift repeats every week.
export type Repeat = {
  days: Weekday[] // e.g. ["Tue", "Thu"]
  until: DateString // last possible date, e.g. the end of term
}

// Anything that goes on the grid: a lecture, a shift, a dentist visit, a deadline.
export type CalendarEvent = {
  id: string
  calendarId: string // which Calendar it belongs to
  title: string
  date: DateString // the date of the first (or only) time it happens
  start?: TimeString // no start = all day
  end?: TimeString
  location?: string
  notes?: string
  repeat?: Repeat // no repeat = happens once
  // Only for classes:
  courseId?: string
  sessionType?: 'LEC' | 'LAB' | 'TUT'
  // Only for school deadlines and exams:
  dueKind?: 'deadline' | 'exam'
}

export type CampusEvent = {
  id: string
  title: string
  date: DateString
  start: TimeString
  end: TimeString
  location: string
  flags: string[] // e.g. ["international", "engineering"]
  keywords: string[] // e.g. ["career", "résumé"]
  url?: string // link to the event on uOttawa's site
}

export type Recommendation = {
  id: string
  studentId: string
  eventId: string
  score: number // 0 to 1: how good a match
  reason: string // e.g. "Matches: international, co-op"
  status: 'suggested' | 'added' | 'dismissed'
}
