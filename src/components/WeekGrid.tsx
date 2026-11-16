import { useEffect, useRef } from 'react'
import DayColumn from './DayColumn'
import { HOURS, HOUR_HEIGHT, SCROLL_TO_HOUR } from './gridConfig'
import { useLanguage, type Language } from '../i18n/context'
import { addDays, isSameDay } from '../lib/dates'

// English: "12 AM", "1 PM". French uses the 24-hour clock: "0 h", "13 h".
function formatHour(hour: number, lang: Language) {
  if (lang === 'fr') return `${hour} h`
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  if (hour > 12) return `${hour - 12} PM`
  return `${hour} AM`
}

type WeekGridProps = {
  weekStart: Date // the Monday of the week to show
  today: Date // used to circle today's date
}

function WeekGrid({ weekStart, today }: WeekGridProps) {
  const { lang, t } = useLanguage()
  const scrollBox = useRef<HTMLDivElement>(null)

  // When the grid first appears, scroll down to 7 AM instead of midnight.
  useEffect(() => {
    if (scrollBox.current) scrollBox.current.scrollTop = SCROLL_TO_HOUR * HOUR_HEIGHT
  }, [])

  // The 7 dates of this week: Monday + 0 days, Monday + 1 day, … Monday + 6 days
  const days = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(weekStart, i))

  return (
    <div
      ref={scrollBox}
      className="h-[calc(100vh-7rem)] overflow-y-auto bg-white rounded-2xl border border-stone-200"
    >
      <div className="grid grid-cols-[56px_repeat(7,1fr)]">
        {/* Left column: the hour labels */}
        <div>
          <div className="sticky top-0 z-10 h-16 border-b border-stone-200 bg-white" />
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="pt-1 pr-2 text-right text-[11px] text-stone-400"
              style={{ height: HOUR_HEIGHT }}
            >
              {formatHour(hour, lang)}
            </div>
          ))}
        </div>

        {/* One DayColumn per day */}
        {days.map((day, i) => (
          <DayColumn
            key={day.toISOString()}
            name={t.days[i]}
            date={day.getDate()}
            isToday={isSameDay(day, today)}
          />
        ))}
      </div>
    </div>
  )
}

export default WeekGrid