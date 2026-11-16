// Every English word the user sees lives here.
export const en = {
  appName: 'uoCalendar',
  languageLabel: 'Language',
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  sessionTypes: { LEC: 'Lecture', LAB: 'Lab', TUT: 'Tutorial' },
}

// "Translations" = the exact shape of the English file.
// French must have the same keys, or VS Code shows an error.
export type Translations = typeof en