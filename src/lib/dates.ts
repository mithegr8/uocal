// Small helpers for working with dates.

// Returns a copy of the date moved by some number of days (negative = back).
export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

// Returns the Monday of the week that contains this date, at midnight.
export function startOfWeek(date: Date): Date {
  const monday = new Date(date)
  monday.setHours(0, 0, 0, 0)
  const daysSinceMonday = (monday.getDay() + 6) % 7 // getDay(): Sunday = 0, Monday = 1…
  return addDays(monday, -daysSinceMonday)
}

// True when two dates fall on the same calendar day.
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Date → "YYYY-MM-DD", the format our data uses.
export function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth(): January = 0
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// "13:30" → 810 (minutes since midnight). Makes times easy to compare and place.
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
