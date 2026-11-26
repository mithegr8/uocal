import { HOURS, HOUR_HEIGHT, type GridItem } from './gridConfig'
import EventBlock from './EventBlock'
import { layoutDay } from './layoutDay'

type DayColumnProps = {
  items: GridItem[] // this day's timed events only
  formatStart: (time: string) => string
  onOpen: (eventId: string) => void
}

// The 24 hour boxes of one day, with its events placed on top.
function DayColumn({ items, formatStart, onOpen }: DayColumnProps) {
  return (
    <div className="relative border-l border-stone-200">
      {HOURS.map((hour) => (
        <div key={hour} className="border-b border-stone-100" style={{ height: HOUR_HEIGHT }} />
      ))}
      {layoutDay(items).map((item) => (
        <EventBlock key={item.id} item={item} startLabel={formatStart(item.start)} onOpen={onOpen} />
      ))}
    </div>
  )
}

export default DayColumn
