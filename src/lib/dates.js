const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function toISODate(input = new Date()) {
  const date = input instanceof Date ? input : new Date(input)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseISODate(value) {
  if (!value) return new Date(NaN)
  if (value instanceof Date) return value
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

export function startOfDay(input = new Date()) {
  const date = new Date(input)
  date.setHours(0, 0, 0, 0)
  return date
}

export function endOfDay(input = new Date()) {
  const date = new Date(input)
  date.setHours(23, 59, 59, 999)
  return date
}

export function addDays(input, amount) {
  const date = new Date(input)
  date.setDate(date.getDate() + amount)
  return date
}

export function addMonths(input, amount) {
  const date = new Date(input)
  const day = date.getDate()
  date.setDate(1)
  date.setMonth(date.getMonth() + amount)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(day, lastDay))
  return date
}

export function startOfMonth(input = new Date()) {
  return new Date(input.getFullYear(), input.getMonth(), 1, 0, 0, 0, 0)
}

export function endOfMonth(input = new Date()) {
  return new Date(input.getFullYear(), input.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function formatDate(value, options = {}) {
  const date = typeof value === 'string' ? parseISODate(value) : value
  if (!date || Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(date)
}

export function formatFullDate(value) {
  const date = typeof value === 'string' ? parseISODate(value) : value
  if (!date || Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatRenewalDate(value, now = new Date()) {
  const date = typeof value === 'string' ? parseISODate(value) : new Date(value)
  if (!date || Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  }).format(date)
}

export function formatMonthYear(value) {
  const date = typeof value === 'string' ? parseISODate(value) : value
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatWeekdayDate(value = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(value)
}

export function formatWeekday(value = new Date()) {
  return WEEKDAYS[value.getDay()]
}

export function relativeDateLabel(value, now = new Date()) {
  const date = typeof value === 'string' ? parseISODate(value) : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  const today = startOfDay(now)
  const target = startOfDay(date)
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000)

  if (diff === 0) return 'Today'
  if (diff === -1) return 'Yesterday'
  if (diff > 0 && diff <= 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }
  if (diff < -1 && diff > -7) {
    return `${Math.abs(diff)} days ago`
  }
  return formatDate(
    date,
    date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {},
  )
}

export function relativeFutureLabel(value, now = new Date()) {
  const date = typeof value === 'string' ? parseISODate(value) : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  const diff = Math.ceil((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000)
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 7) return `In ${diff} days`
  if (diff < 30) {
    const weeks = Math.ceil(diff / 7)
    return `In ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  }
  const months = Math.max(1, Math.round(diff / 30.44))
  return `In ${months} ${months === 1 ? 'month' : 'months'}`
}

export function getNextBillingDate(value, billingCycle = 'monthly', from = new Date()) {
  const base = typeof value === 'string' ? parseISODate(value) : new Date(value)
  if (Number.isNaN(base.getTime())) return null

  const step = billingCycle === 'yearly' ? 12 : 1
  let next = new Date(base)

  // The record date is the most recent charge, so the next renewal is at least
  // one billing cycle after it. Then fast-forward if that date is already past.
  if (startOfDay(next) <= startOfDay(from)) {
    next = addMonths(next, step)
  }

  let guard = 0
  while (startOfDay(next) < startOfDay(from) && guard < 240) {
    next = addMonths(next, step)
    guard += 1
  }
  return next
}

export function getPeriodRange(period = '30d', now = new Date()) {
  const end = endOfDay(now)

  if (period === '90d') {
    const start = startOfDay(addDays(now, -89))
    return {
      period,
      start,
      end,
      previousStart: startOfDay(addDays(now, -179)),
      previousEnd: endOfDay(addDays(now, -90)),
      days: 90,
    }
  }

  if (period === '12m') {
    const start = startOfMonth(addMonths(now, -11))
    return {
      period,
      start,
      end,
      previousStart: startOfMonth(addMonths(now, -23)),
      previousEnd: endOfMonth(addMonths(now, -12)),
      days: 365,
    }
  }

  const start = startOfDay(addDays(now, -29))
  return {
    period: '30d',
    start,
    end,
    previousStart: startOfDay(addDays(now, -59)),
    previousEnd: endOfDay(addDays(now, -30)),
    days: 30,
  }
}

export function periodLabel(period) {
  if (period === '90d') return 'Last 90 days'
  if (period === '12m') return 'Last 12 months'
  return 'Last 30 days'
}

export function isWithinRange(value, start, end) {
  const date = typeof value === 'string' ? parseISODate(value) : new Date(value)
  return !Number.isNaN(date.getTime()) && date >= start && date <= end
}

export function getDateGroupLabel(value, now = new Date()) {
  const date = typeof value === 'string' ? parseISODate(value) : new Date(value)
  const diff = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000,
  )
  if (diff === 0) return 'Today'
  if (diff === -1) return 'Yesterday'
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  }
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function monthShortLabel(date) {
  return MONTHS_SHORT[date.getMonth()]
}
