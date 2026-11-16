import WeekGrid from './components/WeekGrid'
import LanguageToggle from './components/LanguageToggle'
import { useLanguage } from './i18n/context'

function App() {
  const { lang, t } = useLanguage()

  // The browser formats dates in each language for us: "November 2026" / "novembre 2026"
  const monthLabel = new Date(2026, 10, 9).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <header className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-stone-800">{t.appName} 🗓️</h1>
        <span className="text-stone-400">{monthLabel}</span>
        <div className="ml-auto">
          <LanguageToggle />
        </div>
      </header>
      <WeekGrid />
    </main>
  )
}

export default App