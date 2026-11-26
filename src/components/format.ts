import type { Language } from '../i18n/context'

// The browser's name for each language, used to format dates and times.
export function localeOf(lang: Language) {
  return lang === 'fr' ? 'fr-CA' : 'en-CA'
}

// Hour labels. English: "12 AM", "1 PM". French: "0 h", "13 h".
export function formatHour(hour: number, lang: Language) {
  if (lang === 'fr') return `${hour} h`
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  if (hour > 12) return `${hour - 12} PM`
  return `${hour} AM`
}

// Times. English: "1:30 p.m.". French: "13 h 30".
export function formatTime(time: string, lang: Language) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date(2000, 0, 1, hours, minutes)
  return date.toLocaleTimeString(localeOf(lang), { hour: 'numeric', minute: '2-digit' })
}
