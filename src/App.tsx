import { useState, type ReactNode } from 'react'
import WeekGrid from './components/WeekGrid'
import MonthView from './components/MonthView'
import AgendaView from './components/AgendaView'
import WeekNav from './components/WeekNav'
import ViewSwitcher, { type View } from './components/ViewSwitcher'
import CalendarList from './components/CalendarList'
import EventForm from './components/forms/EventForm'
import LanguageToggle from './components/LanguageToggle'
import { buildGridItems } from './components/buildGridItems'
import { localeOf } from './components/format'
import { useLanguage } from './i18n/context'
import { addDays, startOfWeek } from './lib/dates'
import { sampleCalendars, sampleEvents } from './data/sample'
import type { Calendar, CalendarEvent } from './types'

const AGENDA_DAYS = 14

// What the event form is doing: closed, adding a new event, or editing one.
type FormState = { mode: 'closed' } | { mode: 'new' } | { mode: 'edit'; eventId: string }

function App() {
  const { lang, t } = useLanguage()

  // Today's date, read once when the app opens.
  const [today] = useState(() => new Date())

  // Which view is showing, and the day it is centred on.
  const [view, setView] = useState<View>('week')
  const [focusDate, setFocusDate] = useState(today)

  // The student's calendars and events. (Saving them is Lane B's job: tasks B1.2 / B2.3.)
  const [calendars, setCalendars] = useState<Calendar[]>(sampleCalendars)
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents)
  const [form, setForm] = useState<FormState>({ mode: 'closed' })

  // ---- Events ----
  function saveEvent(event: CalendarEvent) {
    const exists = events.some((e) => e.id === event.id)
    setEvents(exists ? events.map((e) => (e.id === event.id ? event : e)) : [...events, event])
    setForm({ mode: 'closed' })
  }

  function deleteEvent(eventId: string) {
    setEvents(events.filter((e) => e.id !== eventId))
    setForm({ mode: 'closed' })
  }

  // ---- Calendars ----
  function toggleCalendar(calendarId: string) {
    setCalendars(calendars.map((c) => (c.id === calendarId ? { ...c, visible: !c.visible } : c)))
  }

  function addCalendar(name: string, color: string) {
    setCalendars([...calendars, { id: crypto.randomUUID(), studentId: 'me', name, kind: 'other', color, visible: true }])
  }

  function updateCalendar(calendarId: string, changes: { name: string; color: string }) {
    setCalendars(calendars.map((c) => (c.id === calendarId ? { ...c, ...changes } : c)))
  }

  function deleteCalendar(calendarId: string) {
    setCalendars(calendars.filter((c) => c.id !== calendarId))
    setEvents(events.filter((e) => e.calendarId !== calendarId)) // its events go too
  }

  // ---- Moving through time: a week, a month or two weeks at a time ----
  function move(direction: 1 | -1) {
    if (view === 'month') setFocusDate(new Date(focusDate.getFullYear(), focusDate.getMonth() + direction, 1))
    else setFocusDate(addDays(focusDate, direction * (view === 'week' ? 7 : AGENDA_DAYS)))
  }

  // ---- What to draw for the current view ----
  const locale = localeOf(lang)
  const weekStart = startOfWeek(focusDate)
  const monthGridStart = startOfWeek(new Date(focusDate.getFullYear(), focusDate.getMonth(), 1))

  let label: string
  let content: ReactNode
  const open = (eventId: string) => setForm({ mode: 'edit', eventId })

  if (view === 'week') {
    label = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).formatRange(
      weekStart,
      addDays(weekStart, 6),
    )
    content = (
      <WeekGrid weekStart={weekStart} today={today} items={buildGridItems(events, calendars, weekStart, t)} onOpen={open} />
    )
  } else if (view === 'month') {
    label = focusDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
    content = (
      <MonthView
        month={focusDate}
        gridStart={monthGridStart}
        today={today}
        items={buildGridItems(events, calendars, monthGridStart, t, 6)}
        onOpen={open}
        onPickDay={(day) => {
          setFocusDate(day)
          setView('week')
        }}
      />
    )
  } else {
    label = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).formatRange(
      focusDate,
      addDays(focusDate, AGENDA_DAYS - 1),
    )
    content = (
      <AgendaView
        start={focusDate}
        dayCount={AGENDA_DAYS}
        today={today}
        items={buildGridItems(events, calendars, weekStart, t, 3)}
        onOpen={open}
      />
    )
  }

  const editingEvent = form.mode === 'edit' ? events.find((e) => e.id === form.eventId) : undefined

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <header className="mb-4 flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-semibold text-stone-800">{t.appName} 🗓️</h1>
        <WeekNav onPrevious={() => move(-1)} onToday={() => setFocusDate(today)} onNext={() => move(1)} />
        <span className="text-stone-500">{label}</span>
        <div className="ml-auto flex items-center gap-3">
          <ViewSwitcher view={view} onChange={setView} />
          <button
            onClick={() => setForm({ mode: 'new' })}
            className="rounded-lg bg-stone-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-700"
          >
            {t.newEvent}
          </button>
          <LanguageToggle />
        </div>
      </header>

      <div className="flex gap-4">
        <CalendarList
          calendars={calendars}
          eventCount={(calendarId) => events.filter((e) => e.calendarId === calendarId).length}
          onToggle={toggleCalendar}
          onAdd={addCalendar}
          onUpdate={updateCalendar}
          onDelete={deleteCalendar}
        />
        <div className="min-w-0 flex-1">{content}</div>
      </div>

      {/* The form only exists on the page while it is open */}
      {form.mode !== 'closed' && (
        <EventForm
          key={form.mode === 'edit' ? form.eventId : 'new'} // a fresh form for each event
          calendars={calendars}
          defaultDate={focusDate}
          initial={editingEvent}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onCancel={() => setForm({ mode: 'closed' })}
        />
      )}
    </main>
  )
}

export default App
