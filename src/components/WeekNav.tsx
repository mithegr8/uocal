import { useLanguage } from '../i18n/context'

type WeekNavProps = {
  onPrevious: () => void
  onToday: () => void
  onNext: () => void
}

// ‹ Today › — moves by a week, a month or two weeks depending on the view.
function WeekNav({ onPrevious, onToday, onNext }: WeekNavProps) {
  const { t } = useLanguage()
  const buttonStyle = 'rounded-lg border border-stone-200 bg-white px-3 py-1 text-stone-700 hover:bg-stone-100'

  return (
    <div className="flex items-center gap-1">
      <button className={buttonStyle} onClick={onPrevious} aria-label={t.previous}>
        ‹
      </button>
      <button className={buttonStyle} onClick={onToday}>
        {t.today}
      </button>
      <button className={buttonStyle} onClick={onNext} aria-label={t.next}>
        ›
      </button>
    </div>
  )
}

export default WeekNav
