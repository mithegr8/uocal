import { useState, type ReactNode } from 'react'
import { en, type Translations } from './en'
import { fr } from './fr'
import { LanguageContext, type Language } from './context'

const dictionaries: Record<Language, Translations> = { en, fr }

// Use the saved choice if there is one, otherwise the browser's language.
function getStartingLanguage(): Language {
  try {
    const saved = localStorage.getItem('uocal-lang')
    if (saved === 'en' || saved === 'fr') return saved
  } catch {
    // storage not available: fall through
  }
  return navigator.language.startsWith('fr') ? 'fr' : 'en'
}

function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getStartingLanguage)

  function setLang(newLang: Language) {
    setLangState(newLang)
    document.documentElement.lang = newLang
    try {
      localStorage.setItem('uocal-lang', newLang)
    } catch {
      // storage not available: the choice just isn't remembered
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: dictionaries[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageProvider
