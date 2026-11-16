import { useLanguage, type Language } from '../i18n/context'

const options: Language[] = ['en', 'fr']

function LanguageToggle() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t.languageLabel}
      className="inline-flex rounded-full border border-stone-200 bg-white p-0.5 text-sm"
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setLang(option)}
          aria-pressed={lang === option}
          className={
            lang === option
              ? 'rounded-full bg-stone-800 px-3 py-1 font-medium text-white'
              : 'rounded-full px-3 py-1 text-stone-500 hover:text-stone-800'
          }
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default LanguageToggle