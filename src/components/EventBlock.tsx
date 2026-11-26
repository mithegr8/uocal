import type { PlacedItem } from './layoutDay'
import { HOUR_HEIGHT } from './gridConfig'
import { toMinutes } from '../lib/dates'

type EventBlockProps = {
  item: PlacedItem
  startLabel: string // the start time, already formatted for the language
  onOpen: (eventId: string) => void
}

function EventBlock({ item, startLabel, onOpen }: EventBlockProps) {
  const startMinutes = toMinutes(item.start)
  const endMinutes = toMinutes(item.end)

  // Position from the top = how far into the day it starts.
  // Height = how long it lasts (at least 20 px so short events stay clickable).
  const top = (startMinutes / 60) * HOUR_HEIGHT
  const height = Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT, 20)

  // Side by side: each column gets an equal share of the day's width.
  const width = 100 / item.columnCount
  const left = item.column * width

  return (
    <button
      type="button"
      onClick={() => onOpen(item.eventId)}
      className="absolute overflow-hidden rounded-md px-2 py-1 text-left text-xs hover:brightness-95"
      style={{
        top,
        height,
        left: `calc(${left}% + 2px)`,
        width: `calc(${width}% - 4px)`,
        backgroundColor: item.color + '1f', // the color at about 12% strength
        borderLeft: `3px solid ${item.color}`,
      }}
    >
      {/* Short events: title and time on one line. Longer ones: also the place. */}
      {height < 56 ? (
        <div className="truncate">
          <span className="font-semibold text-stone-800">{item.title}</span>{' '}
          <span className="text-stone-600">{startLabel}</span>
          <div className="truncate text-stone-500">{item.detail}</div>
        </div>
      ) : (
        <>
          <div className="font-semibold text-stone-800">{item.title}</div>
          <div className="text-stone-600">{startLabel}</div>
          <div className="truncate text-stone-500">{item.detail}</div>
        </>
      )}
    </button>
  )
}

export default EventBlock
