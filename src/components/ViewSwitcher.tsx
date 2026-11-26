import { useLanguage } from '../i18n/context'

export type View = 'week' | 'month' | 'agenda'
const VIEWS: View[] = ['week', 'month', 'agenda']

type ViewSwitcherProps = {
  view: View
  onChange: (view: View) => void
}

// Week | Month | Agenda
function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  const { t } = useLanguage()
  return (
    <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 text-sm">
      {VIEWS.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          aria-pressed={view === option}
          className={
            view === option
              ? 'rounded-md bg-stone-800 px-3 py-1 font-medium text-white'
              : 'rounded-md px-3 py-1 text-stone-500 hover:text-stone-800'
          }
        >
          {t.views[option]}
        </button>
      ))}
    </div>
  )
}

export default ViewSwitcher
