import { useEffect, useRef } from 'react'
import DayColumn from './DayColumn'
import AllDayChip from './AllDayChip'
import { HOURS, HOUR_HEIGHT, SCROLL_TO_HOUR, type GridItem } from './gridConfig'
import { formatHour, formatTime } from './format'
import { useLanguage } from '../i18n/context'
import { addDays, isSameDay } from '../lib/dates'

type WeekGridProps = {
  weekStart: Date // the Monday of the week to show
  today: Date // used to circle today's date
  items: GridItem[] // everything to draw this week
  onOpen: (eventId: string) => void
}

const COLUMNS = 'grid grid-cols-[56px_repeat(7,minmax(0,1fr))]'

function WeekGrid({ weekStart, today, items, onOpen }: WeekGridProps) {
  const { lang, t } = useLanguage()
  const scrollBox = useRef<HTMLDivElement>(null)

  // When the grid first appears, scroll down to 7 AM instead of midnight.
  useEffect(() => {
    if (scrollBox.current) scrollBox.current.scrollTop = SCROLL_TO_HOUR * HOUR_HEIGHT
  }, [])

  // The 7 dates of this week: Monday + 0 days, Monday + 1 day, … Monday + 6 days
  const days = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(weekStart, i))
  const allDayItems = items.filter((item) => item.allDay)
  const timedItems = items.filter((item) => !item.allDay)
  const hasAllDay = allDayItems.length > 0

  return (
    <div
      ref={scrollBox}
      className="h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl [overflow-anchor:none] border border-stone-200 bg-white"
    >
      {/* Top part, pinned while scrolling: day names, then the all-day row */}
      <div className="sticky top-0 z-20 border-b border-stone-200 bg-white">
        <div className={COLUMNS}>
          <div />
          {days.map((day, i) => (
            <div key={day.toISOString()} className="flex h-16 flex-col items-center justify-center border-l border-stone-200">
              <span className="text-xs uppercase tracking-wider text-stone-400">{t.days[i]}</span>
              <span
                className={
                  isSameDay(day, today)
                    ? 'mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 font-semibold text-white'
                    : 'mt-1 flex h-8 w-8 items-center justify-center text-stone-700'
                }
              >
                {day.getDate()}
              </span>
            </div>
          ))}
        </div>

        {hasAllDay && (
          <div className={`${COLUMNS} border-t border-stone-100`}>
            <div className="pr-2 pt-1 text-right text-[10px] leading-tight text-stone-400">{t.allDay}</div>
            {days.map((day) => (
              <div key={day.toISOString()} className="space-y-0.5 border-l border-stone-200 p-1">
                {allDayItems
                  .filter((item) => isSameDay(item.date, day))
                  .map((item) => (
                    <AllDayChip key={item.id} item={item} onOpen={onOpen} />
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The 24 hours */}
      <div className={COLUMNS}>
        <div>
          {HOURS.map((hour) => (
            <div key={hour} className="pr-2 pt-1 text-right text-[11px] text-stone-400" style={{ height: HOUR_HEIGHT }}>
              {formatHour(hour, lang)}
            </div>
          ))}
        </div>
        {days.map((day) => (
          <DayColumn
            key={day.toISOString()}
            items={timedItems.filter((item) => isSameDay(item.date, day))}
            formatStart={(time) => formatTime(time, lang)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  )
}

export default WeekGrid
