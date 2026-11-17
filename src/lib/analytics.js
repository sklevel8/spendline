import {
  addDays,
  addMonths,
  getNextBillingDate,
  getPeriodRange,
  isWithinRange,
  monthShortLabel,
  parseISODate,
  startOfDay,
} from './dates.js'

function amountOf(record) {
  return Number(record.amount) || 0
}

export function sumAmounts(records) {
  return records.reduce((total, record) => total + amountOf(record), 0)
}

export function isActiveSubscription(record) {
  return record.type === 'subscription' && record.active !== false
}

export function monthlyEquivalent(record) {
  if (!isActiveSubscription(record)) return 0
  return record.billingCycle === 'yearly' ? amountOf(record) / 12 : amountOf(record)
}

export function annualEquivalent(record) {
  return monthlyEquivalent(record) * 12
}

export function getActiveSubscriptions(transactions, now = new Date()) {
  return transactions
    .filter(isActiveSubscription)
    .map((record) => ({
      ...record,
      monthlyAmount: monthlyEquivalent(record),
      annualAmount: annualEquivalent(record),
      nextBillingDate: getNextBillingDate(record.date, record.billingCycle, now),
    }))
    .sort((a, b) => {
      if (!a.nextBillingDate) return 1
      if (!b.nextBillingDate) return -1
      return a.nextBillingDate - b.nextBillingDate
    })
}

export function calculateCategoryTotals(records) {
  const totals = new Map()

  records.forEach((record) => {
    const category = record.category || 'Other'
    const current = totals.get(category) || 0
    totals.set(category, current + amountOf(record))
  })

  const grandTotal = [...totals.values()].reduce((total, value) => total + value, 0)

  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percent: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function getRecurringMix(transactions, now = new Date()) {
  const active = getActiveSubscriptions(transactions, now)
  const totals = new Map()

  active.forEach((record) => {
    const category = record.category || 'Other'
    totals.set(category, (totals.get(category) || 0) + record.monthlyAmount)
  })

  const grandTotal = [...totals.values()].reduce((total, value) => total + value, 0)

  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percent: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

function niceCeiling(value) {
  if (!Number.isFinite(value) || value <= 0) return 100
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return nice * magnitude
}

function getBucketIndex(date, range, period) {
  if (period === '12m') {
    return (
      (date.getFullYear() - range.start.getFullYear()) * 12 +
      (date.getMonth() - range.start.getMonth())
    )
  }

  const days = Math.floor(
    (startOfDay(date).getTime() - startOfDay(range.start).getTime()) / 86_400_000,
  )
  if (period === '90d') return Math.floor(days / 7)
  return days
}

export function buildSpendSeries(transactions, period = '30d', now = new Date()) {
  const range = getPeriodRange(period, now)
  const inRange = transactions.filter((record) =>
    isWithinRange(record.date, range.start, range.end),
  )

  let buckets = []

  if (period === '12m') {
    buckets = Array.from({ length: 12 }, (_, index) => {
      const date = addMonths(range.start, index)
      return {
        key: index,
        label: monthShortLabel(date),
        fullLabel: date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
        start: date,
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
        value: 0,
      }
    })
  } else if (period === '90d') {
    buckets = Array.from({ length: 13 }, (_, index) => {
      const date = addDays(range.start, index * 7)
      return {
        key: index,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullLabel: `Week of ${date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`,
        start: date,
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6),
        value: 0,
      }
    })
  } else {
    buckets = Array.from({ length: 30 }, (_, index) => {
      const date = addDays(range.start, index)
      return {
        key: index,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullLabel: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        start: date,
        end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999),
        value: 0,
      }
    })
  }

  inRange.forEach((record) => {
    const date = parseISODate(record.date)
    const bucketIndex = getBucketIndex(date, range, period)
    if (bucketIndex >= 0 && bucketIndex < buckets.length) {
      buckets[bucketIndex].value += amountOf(record)
    }
  })

  const maxValue = Math.max(...buckets.map((bucket) => bucket.value), 0)
  const axisMax = niceCeiling(maxValue * 1.12)

  return {
    points: buckets,
    total: sumAmounts(inRange),
    maxValue,
    axisMax,
    average: inRange.length > 0 ? sumAmounts(inRange) / range.days : 0,
    range,
  }
}

export function calculateDashboardMetrics(transactions, period = '30d', now = new Date()) {
  const range = getPeriodRange(period, now)
  const current = transactions.filter((record) =>
    isWithinRange(record.date, range.start, range.end),
  )
  const previous = transactions.filter((record) =>
    isWithinRange(record.date, range.previousStart, range.previousEnd),
  )

  const totalSpend = sumAmounts(current)
  const previousSpend = sumAmounts(previous)
  const changePercent =
    previousSpend > 0 ? ((totalSpend - previousSpend) / previousSpend) * 100 : null

  const activeSubscriptions = getActiveSubscriptions(transactions, now)
  const monthlyBurn = activeSubscriptions.reduce(
    (total, record) => total + record.monthlyAmount,
    0,
  )
  const annualForecast = monthlyBurn * 12
  const categories = calculateCategoryTotals(current)
  const nextRenewal = activeSubscriptions[0] ?? null
  const topCategory = categories[0] ?? null
  const largestRecord = [...current].sort((a, b) => amountOf(b) - amountOf(a))[0] ?? null

  return {
    range,
    totalSpend,
    previousSpend,
    changePercent,
    recordCount: current.length,
    categories,
    topCategory,
    largestRecord,
    activeSubscriptions,
    subscriptionCount: activeSubscriptions.length,
    monthlyBurn,
    annualForecast,
    nextRenewal,
    averagePerDay: totalSpend / range.days,
  }
}

export function filterTransactions(transactions, filters) {
  const query = filters.query?.trim().toLowerCase() ?? ''
  const type = filters.type ?? 'all'
  const category = filters.category ?? 'all'

  return transactions
    .filter((record) => {
      if (type !== 'all' && record.type !== type) return false
      if (category !== 'all' && record.category !== category) return false
      if (!query) return true
      return [record.title, record.category, record.type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
    .sort((a, b) => {
      const dateDifference = String(b.date).localeCompare(String(a.date))
      if (dateDifference !== 0) return dateDifference
      return String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
    })
}

export function groupTransactionsByDate(transactions, now = new Date()) {
  const groups = new Map()

  transactions.forEach((record) => {
    const date = parseISODate(record.date)
    const key = Number.isNaN(date.getTime()) ? 'unknown' : date.toDateString()
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        date: Number.isNaN(date.getTime()) ? null : date,
        label: Number.isNaN(date.getTime())
          ? 'Unknown date'
          : formatGroupLabel(date, now),
        total: 0,
        records: [],
      })
    }
    const group = groups.get(key)
    group.records.push(record)
    group.total += amountOf(record)
  })

  return [...groups.values()]
}

function formatGroupLabel(date, now) {
  const today = startOfDay(now)
  const target = startOfDay(date)
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000)

  if (diff === 0) return 'Today'
  if (diff === -1) return 'Yesterday'
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}),
  })
}
