import { HOURS, HOUR_HEIGHT } from './gridConfig'

type DayColumnProps = {
  name: string
  date: number
  isToday: boolean
}

function DayColumn({ name, date, isToday }: DayColumnProps) {
  return (
    <div className="border-l border-stone-200">
      {/* Day name + date. "sticky top-0" keeps it visible while you scroll. */}
      <div className="sticky top-0 z-10 h-16 flex flex-col items-center justify-center border-b border-stone-200 bg-white">
        <span className="text-xs uppercase tracking-wider text-stone-400">{name}</span>
        <span
          className={
            isToday
              ? 'mt-1 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-semibold'
              : 'mt-1 w-8 h-8 flex items-center justify-center text-stone-700'
          }
        >
          {date}
        </span>
      </div>

      {/* One empty box per hour, same count and height as the hour labels */}
      {HOURS.map((hour) => (
        <div key={hour} className="border-b border-stone-100" style={{ height: HOUR_HEIGHT }} />
      ))}
    </div>
  )
}

export default DayColumn