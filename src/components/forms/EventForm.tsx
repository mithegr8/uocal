import { useEffect, useState, type FormEvent } from 'react'
import type { Calendar, CalendarEvent, Weekday } from '../../types'
import { useLanguage } from '../../i18n/context'
import { toDateString, toMinutes } from '../../lib/dates'

const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
type SessionType = 'LEC' | 'LAB' | 'TUT'
type DueKind = 'none' | 'deadline' | 'exam'

type EventFormProps = {
  calendars: Calendar[]
  defaultDate: Date
  initial?: CalendarEvent // given = editing that event; missing = a new event
  onSave: (event: CalendarEvent) => void
  onDelete?: (eventId: string) => void
  onCancel: () => void
}

function EventForm({ calendars, defaultDate, initial, onSave, onDelete, onCancel }: EventFormProps) {
  const { t } = useLanguage()
  const editing = initial !== undefined

  // One piece of state per field, starting from the event being edited (if any).
  const [title, setTitle] = useState(initial?.title ?? '')
  const [calendarId, setCalendarId] = useState(initial?.calendarId ?? calendars[0]?.id ?? '')
  const [date, setDate] = useState(initial?.date ?? toDateString(defaultDate))
  const [allDay, setAllDay] = useState(editing && !initial?.start)
  const [start, setStart] = useState(initial?.start ?? '09:00')
  const [end, setEnd] = useState(initial?.end ?? '10:00')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [sessionType, setSessionType] = useState<SessionType>(initial?.sessionType ?? 'LEC')
  const [dueKind, setDueKind] = useState<DueKind>(initial?.dueKind ?? 'none')
  const [repeats, setRepeats] = useState(initial?.repeat !== undefined)
  const [repeatDays, setRepeatDays] = useState<Weekday[]>(initial?.repeat?.days ?? [])
  const [until, setUntil] = useState(initial?.repeat?.until ?? date)
  const [error, setError] = useState('')

  // Pressing Escape closes the form, like clicking outside it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey) // tidy up when the form closes
  }, [onCancel])

  // Is the chosen calendar the Classes one? Then we ask for the type of class.
  const chosenCalendar = calendars.find((calendar) => calendar.id === calendarId)
  const isClass = chosenCalendar?.kind === 'classes'

  // Tick or untick one day: a new list with that day added or removed.
  function toggleDay(day: Weekday) {
    setRepeatDays(repeatDays.includes(day) ? repeatDays.filter((d) => d !== day) : [...repeatDays, day])
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault() // stop the browser from reloading the page

    // Check the answers before saving. Show the first problem found.
    if (title.trim() === '') return setError(t.form.errors.titleRequired)
    if (!allDay && toMinutes(end) <= toMinutes(start)) return setError(t.form.errors.endBeforeStart)
    if (repeats && repeatDays.length === 0) return setError(t.form.errors.pickDays)
    if (repeats && until < date) return setError(t.form.errors.untilBeforeDate)

    onSave({
      id: initial?.id ?? crypto.randomUUID(), // keep the id when editing
      calendarId,
      title: title.trim(),
      date,
      start: allDay ? undefined : start,
      end: allDay ? undefined : end,
      location: location.trim() || undefined,
      notes: initial?.notes,
      courseId: initial?.courseId,
      sessionType: isClass && !allDay ? sessionType : undefined,
      dueKind: dueKind === 'none' ? undefined : dueKind,
      repeat: repeats ? { days: repeatDays, until } : undefined,
    })
  }

  const inputStyle = 'w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:border-stone-400 focus:outline-none'
  const labelStyle = 'mb-1 block text-xs font-medium text-stone-500'

  return (
    // The dark background covering the page. Clicking it closes the form.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onCancel}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()} // clicks inside the form don't reach the background
        className="max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-stone-800">{editing ? t.form.editHeading : t.form.heading}</h2>

        <div>
          <label className={labelStyle} htmlFor="title">{t.form.title}</label>
          <input id="title" className={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelStyle} htmlFor="calendar">{t.form.calendar}</label>
            <select id="calendar" className={inputStyle} value={calendarId} onChange={(e) => setCalendarId(e.target.value)}>
              {calendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.name || t.calendarKinds[calendar.kind]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelStyle} htmlFor="dueKind">{t.form.dueKind}</label>
            <select id="dueKind" className={inputStyle} value={dueKind} onChange={(e) => setDueKind(e.target.value as DueKind)}>
              {(['none', 'deadline', 'exam'] as const).map((kind) => (
                <option key={kind} value={kind}>{t.form.dueKinds[kind]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Only shown for timed classes */}
        {isClass && !allDay && (
          <div>
            <label className={labelStyle} htmlFor="sessionType">{t.form.sessionType}</label>
            <select
              id="sessionType"
              className={inputStyle}
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
            >
              {(['LEC', 'LAB', 'TUT'] as const).map((code) => (
                <option key={code} value={code}>{t.sessionTypes[code]}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={labelStyle} htmlFor="date">{t.form.date}</label>
            <input id="date" type="date" className={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {!allDay && (
            <>
              <div>
                <label className={labelStyle} htmlFor="start">{t.form.start}</label>
                <input id="start" type="time" className={inputStyle} value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div>
                <label className={labelStyle} htmlFor="end">{t.form.end}</label>
                <input id="end" type="time" className={inputStyle} value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
          {t.form.allDay}
        </label>

        <div>
          <label className={labelStyle} htmlFor="location">{t.form.location}</label>
          <input id="location" className={inputStyle} value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={repeats} onChange={(e) => setRepeats(e.target.checked)} />
          {t.form.repeatWeekly}
        </label>

        {/* Only shown when "repeats" is ticked */}
        {repeats && (
          <div className="space-y-2 rounded-lg bg-stone-50 p-3">
            <div className={labelStyle}>{t.form.repeatOn}</div>
            <div className="flex flex-wrap gap-1">
              {WEEKDAYS.map((day, i) => (
                <button
                  key={day}
                  type="button" // a plain button: clicking it must not submit the form
                  onClick={() => toggleDay(day)}
                  aria-pressed={repeatDays.includes(day)}
                  className={
                    repeatDays.includes(day)
                      ? 'rounded-full bg-stone-800 px-3 py-1 text-xs text-white'
                      : 'rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600'
                  }
                >
                  {t.days[i]}
                </button>
              ))}
            </div>
            <div>
              <label className={labelStyle} htmlFor="until">{t.form.until}</label>
              <input id="until" type="date" className={inputStyle} value={until} onChange={(e) => setUntil(e.target.value)} />
            </div>
            {editing && <p className="text-xs text-stone-500">{t.form.seriesNote}</p>}
          </div>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex items-center gap-2 pt-2">
          {editing && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(initial.id)}
              className="rounded-lg px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
            >
              {t.form.delete}
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-1.5 text-sm text-stone-600 hover:bg-stone-100">
              {t.form.cancel}
            </button>
            <button type="submit" className="rounded-lg bg-stone-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-stone-700">
              {t.form.save}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EventForm
