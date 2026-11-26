import type { Calendar, CalendarEvent } from '../types'

// Sample data until we have a database. An empty name means
// "use the default name for this kind, in the user's language".
export const sampleCalendars: Calendar[] = [
  { id: 'classes', studentId: 'me', name: '', kind: 'classes', color: '#e11d48', visible: true },
  { id: 'work', studentId: 'me', name: 'Tim Hortons', kind: 'work', color: '#0ea5e9', visible: true },
  { id: 'personal', studentId: 'me', name: '', kind: 'personal', color: '#16a34a', visible: true },
]

const endOfTerm = '2026-12-03'

export const sampleEvents: CalendarEvent[] = [
  // Classes
  { id: 'csi-lec', calendarId: 'classes', title: 'CSI 2110', date: '2026-09-08', start: '10:00', end: '11:20',
    location: 'STE B0138', courseId: 'csi2110', sessionType: 'LEC', repeat: { days: ['Tue', 'Thu'], until: endOfTerm } },
  { id: 'csi-lab', calendarId: 'classes', title: 'CSI 2110', date: '2026-09-11', start: '14:30', end: '15:50',
    location: 'STE 2052', courseId: 'csi2110', sessionType: 'LAB', repeat: { days: ['Fri'], until: endOfTerm } },
  { id: 'mat-lec', calendarId: 'classes', title: 'MAT 1341', date: '2026-09-09', start: '13:00', end: '14:20',
    location: 'MRT 205', courseId: 'mat1341', sessionType: 'LEC', repeat: { days: ['Mon', 'Wed'], until: endOfTerm } },
  { id: 'mat-tut', calendarId: 'classes', title: 'MAT 1341', date: '2026-09-09', start: '17:30', end: '18:50',
    location: 'MRT 211', courseId: 'mat1341', sessionType: 'TUT', repeat: { days: ['Wed'], until: endOfTerm } },

  // Work
  { id: 'shift-sat', calendarId: 'work', title: 'Shift', date: '2026-09-05', start: '09:00', end: '15:00',
    location: 'Rideau Centre', repeat: { days: ['Sat'], until: '2026-12-31' } },
  { id: 'shift-tue', calendarId: 'work', title: 'Shift', date: '2026-09-08', start: '18:00', end: '22:00',
    location: 'Rideau Centre', repeat: { days: ['Tue'], until: '2026-12-31' } },

  // Personal
  { id: 'gym', calendarId: 'personal', title: 'Gym', date: '2026-09-07', start: '07:00', end: '08:00',
    location: 'Minto Sports Complex', repeat: { days: ['Mon', 'Wed', 'Fri'], until: '2027-04-30' } },
  { id: 'dentist', calendarId: 'personal', title: 'Dentist', date: '2026-11-13', start: '16:00', end: '17:00' },
]
