import type { GridItem } from './gridConfig'

type AllDayChipProps = {
  item: GridItem
  onOpen: (eventId: string) => void
}

// A small colored label for an all-day event, a deadline or an exam.
function AllDayChip({ item, onOpen }: AllDayChipProps) {
  const icon = item.dueKind === 'exam' ? '📝 ' : item.dueKind === 'deadline' ? '⏰ ' : ''
  return (
    <button
      type="button"
      onClick={() => onOpen(item.eventId)}
      className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-white hover:brightness-110"
      style={{ backgroundColor: item.color }}
      title={item.title}
    >
      {icon}
      {item.title}
    </button>
  )
}

export default AllDayChip
