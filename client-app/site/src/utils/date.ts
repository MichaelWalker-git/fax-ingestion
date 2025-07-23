import {
  format,
  getTime,
  formatDistanceToNow,
  isSameDay as isSameCalendarDay,
  parseISO,
  subDays,
  isAfter,
} from 'date-fns'

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

type InputValue = Date | string | number | null | undefined

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy'

  return date ? format(new Date(date), fm) : ''
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy p'

  return date ? format(new Date(date), fm) : ''
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : ''
}

export function fToNow(date: InputValue) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : ''
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const parsedDate1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const parsedDate2 = typeof date2 === 'string' ? parseISO(date2) : date2

  return isSameCalendarDay(parsedDate1, parsedDate2)
}

export function isRecent(date: Date | string, days = 7): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const recentThreshold = subDays(new Date(), days)

  return isAfter(targetDate, recentThreshold)
}

export function isOlder(date: Date | string, days = 7): boolean {
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const recentThreshold = subDays(new Date(), days)
  return isAfter(recentThreshold, targetDate)
}
