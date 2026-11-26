import { useState } from 'react'
import type { Calendar } from '../types'
import { CALENDAR_COLORS } from './gridConfig'
import { useLanguage } from '../i18n/context'

type CalendarListProps = {
  calendars: Calendar[]
  eventCount: (calendarId: string) => number
  onToggle: (calendarId: string) => void
  onAdd: (name: string, color: string) => void
  onUpdate: (calendarId: string, changes: { name: string; color: string }) => void
  onDelete: (calendarId: string) => void
}

// "My calendars": show/hide, add, rename, recolor and delete calendars.
function CalendarList({ calendars, eventCount, onToggle, onAdd, onUpdate, onDelete }: CalendarListProps) {
  const { t } = useLanguage()

  // Which calendar is being edited ("new" = the add form), and the draft values.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftColor, setDraftColor] = useState(CALENDAR_COLORS[0])
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function startEditing(calendar: Calendar | null) {
    setEditingId(calendar ? calendar.id : 'new')
    setDraftName(calendar ? calendar.name || t.calendarKinds[calendar.kind] : '')
    setDraftColor(calendar ? calendar.color : CALENDAR_COLORS[4])
    setConfirmingDelete(false)
  }

  function save() {
    const name = draftName.trim()
    if (name === '') return
    if (editingId === 'new') onAdd(name, draftColor)
    else if (editingId) onUpdate(editingId, { name, color: draftColor })
    setEditingId(null)
  }

  const editor = (
    <div className="space-y-2 rounded-lg bg-stone-100 p-2">
      <input
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && save()}
        placeholder={t.calendarsUi.newName}
        aria-label={t.calendarsUi.newName}
        className="w-full rounded-md border border-stone-200 bg-white px-2 py-1 text-sm"
        autoFocus
      />
      <div className="flex flex-wrap gap-1" role="group" aria-label={t.calendarsUi.color}>
        {CALENDAR_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setDraftColor(color)}
            aria-label={color}
            aria-pressed={draftColor === color}
            className={`h-5 w-5 rounded-full ${draftColor === color ? 'ring-2 ring-stone-800 ring-offset-1' : ''}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="flex justify-end gap-1">
        <button onClick={() => setEditingId(null)} className="rounded px-2 py-0.5 text-xs text-stone-600 hover:bg-stone-200">
          {t.calendarsUi.cancel}
        </button>
        <button onClick={save} className="rounded bg-stone-800 px-2 py-0.5 text-xs text-white">
          {t.calendarsUi.save}
        </button>
      </div>

      {/* Deleting: only for an existing calendar, and never the last one */}
      {editingId !== 'new' && calendars.length > 1 && editingId && (
        confirmingDelete ? (
          <div className="space-y-1 border-t border-stone-200 pt-2 text-xs">
            <p className="text-stone-700">{t.calendarsUi.confirmDelete(eventCount(editingId))}</p>
            <div className="flex justify-end gap-1">
              <button onClick={() => setConfirmingDelete(false)} className="rounded px-2 py-0.5 text-stone-600 hover:bg-stone-200">
                {t.calendarsUi.cancel}
              </button>
              <button
                onClick={() => {
                  onDelete(editingId)
                  setEditingId(null)
                }}
                className="rounded bg-rose-600 px-2 py-0.5 text-white"
              >
                {t.calendarsUi.yesDelete}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmingDelete(true)} className="text-xs text-rose-600 hover:underline">
            {t.calendarsUi.delete}
          </button>
        )
      )}
    </div>
  )

  return (
    <aside className="w-56 shrink-0">
      <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-stone-400">{t.myCalendars}</h2>
      <ul className="space-y-0.5">
        {calendars.map((calendar) => (
          <li key={calendar.id}>
            {editingId === calendar.id ? (
              editor
            ) : (
              <div className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-stone-100">
                <label className="flex flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={calendar.visible}
                    onChange={() => onToggle(calendar.id)}
                    className="h-4 w-4"
                    style={{ accentColor: calendar.color }}
                  />
                  <span className="text-sm text-stone-700">{calendar.name || t.calendarKinds[calendar.kind]}</span>
                </label>
                <button
                  onClick={() => startEditing(calendar)}
                  aria-label={t.calendarsUi.edit}
                  className="text-xs text-stone-400 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  ✎
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-2 px-1">
        {editingId === 'new' ? (
          editor
        ) : (
          <button onClick={() => startEditing(null)} className="px-1 text-sm text-stone-500 hover:text-stone-800">
            {t.calendarsUi.add}
          </button>
        )}
      </div>
    </aside>
  )
}

export default CalendarList
