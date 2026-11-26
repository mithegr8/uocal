import { createContext, useContext } from 'react'
import type { Translations } from './en'

export type Language = 'en' | 'fr'

type LanguageContextValue = {
  lang: Language
  setLang: (lang: Language) => void
  t: Translations // t = "translations" for the current language
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

// Any component calls useLanguage() to get lang, setLang and t.
export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider')
  return value
}
