import type { GridItem } from './gridConfig'
import { formatTime } from './format'
import { useLanguage } from '../i18n/context'
import { addDays, isSameDay } from '../lib/dates'

type MonthViewProps = {
  month: Date // any day in the month to show
  gridStart: Date // the Monday the 6-week grid starts on
  today: Date
  items: GridItem[] // everything in those 6 weeks
  onOpen: (eventId: string) => void
  onPickDay: (day: Date) => void // clicking a date opens that week
}

const SHOWN_PER_DAY = 3

function MonthView({ month, gridStart, today, items, onOpen, onPickDay }: MonthViewProps) {
  const { lang, t } = useLanguage()
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)) // 6 weeks × 7 days

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="grid grid-cols-7 border-b border-stone-200">
        {t.days.map((name) => (
          <div key={name} className="py-2 text-center text-xs uppercase tracking-wider text-stone-400">
            {name}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayItems = items.filter((item) => isSameDay(item.date, day))
          const inMonth = day.getMonth() === month.getMonth()
          const isToday = isSameDay(day, today)

          return (
            <div
              key={day.toISOString()}
              className={`min-h-28 border-b border-l border-stone-100 p-1 ${inMonth ? '' : 'bg-stone-50'}`}
            >
              <button
                onClick={() => onPickDay(day)}
                className={
                  isToday
                    ? 'mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white'
                    : `mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-stone-100 ${inMonth ? 'text-stone-700' : 'text-stone-400'}`
                }
              >
                {day.getDate()}
              </button>

              <div className="space-y-0.5">
                {dayItems.slice(0, SHOWN_PER_DAY).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onOpen(item.eventId)}
                    className="flex w-full items-center gap-1 truncate rounded px-1 text-left text-[11px] text-stone-700 hover:bg-stone-100"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    {!item.allDay && <span className="text-stone-400">{formatTime(item.start, lang)}</span>}
                    <span className="truncate">{item.title}</span>
                  </button>
                ))}
                {dayItems.length > SHOWN_PER_DAY && (
                  <button onClick={() => onPickDay(day)} className="px-1 text-[11px] text-stone-500 hover:underline">
                    {t.more(dayItems.length - SHOWN_PER_DAY)}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MonthView
