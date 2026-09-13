const dateTimeLocalPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/

function pad(value: number, length = 2) {
  return String(value).padStart(length, '0')
}

export function isoToDateTimeLocal(instant: string) {
  const date = new Date(instant)
  if (!Number.isFinite(date.getTime())) return ''

  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
}

export function dateTimeLocalToIso(value: string) {
  const match = dateTimeLocalPattern.exec(value)
  if (!match) return null

  const [, year, month, day, hour, minute, second = '0', millisecondValue] = match
  const millisecond = (millisecondValue ?? '').padEnd(3, '0') || '0'
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(millisecond),
  )
  if (
    date.getFullYear() !== Number(year)
    || date.getMonth() !== Number(month) - 1
    || date.getDate() !== Number(day)
    || date.getHours() !== Number(hour)
    || date.getMinutes() !== Number(minute)
    || date.getSeconds() !== Number(second)
    || date.getMilliseconds() !== Number(millisecond)
  ) {
    return null
  }

  return date.toISOString()
}

export function dateTimeLocalToIsoPreservingOriginal(
  value: string,
  originalLocalValue: string,
  originalInstant: string,
) {
  return value === originalLocalValue
    ? originalInstant
    : dateTimeLocalToIso(value)
}
