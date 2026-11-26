import type { GridItem } from './gridConfig'
import { formatTime, localeOf } from './format'
import { useLanguage } from '../i18n/context'
import { addDays, isSameDay } from '../lib/dates'

type AgendaViewProps = {
  start: Date // first day of the list
  dayCount: number
  today: Date
  items: GridItem[]
  onOpen: (eventId: string) => void
}

// A simple list, day by day: good on phones and for a quick look ahead.
function AgendaView({ start, dayCount, today, items, onOpen }: AgendaViewProps) {
  const { lang, t } = useLanguage()
  const days = Array.from({ length: dayCount }, (_, i) => addDays(start, i))
  const daysWithItems = days.filter((day) => items.some((item) => isSameDay(item.date, day)))

  if (daysWithItems.length === 0) {
    return <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500">{t.nothingPlanned}</div>
  }

  return (
    <div className="h-[calc(100vh-7rem)] space-y-4 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-4">
      {daysWithItems.map((day) => (
        <section key={day.toISOString()}>
          <h3 className={`mb-1 text-sm font-semibold ${isSameDay(day, today) ? 'text-rose-600' : 'text-stone-700'}`}>
            {day.toLocaleDateString(localeOf(lang), { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <ul className="space-y-1">
            {items
              .filter((item) => isSameDay(item.date, day))
              .map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onOpen(item.eventId)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-stone-50"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="w-36 shrink-0 text-xs text-stone-500">
                      {item.allDay ? t.allDay : `${formatTime(item.start, lang)} – ${formatTime(item.end, lang)}`}
                    </span>
                    <span className="text-sm font-medium text-stone-800">{item.title}</span>
                    <span className="truncate text-xs text-stone-500">{item.detail}</span>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default AgendaView
