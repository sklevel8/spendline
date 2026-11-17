const LOCALE = 'en-ZA'
const CURRENCY = 'ZAR'

export const CURRENCY_SYMBOL = 'R'

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 1,
})

const wholeCurrencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat(LOCALE)

export function formatCurrency(value, options = {}) {
  const amount = Number(value) || 0
  if (options.compact) return compactCurrencyFormatter.format(amount)
  return currencyFormatter.format(amount)
}

export function formatWholeCurrency(value) {
  return wholeCurrencyFormatter.format(Number(value) || 0)
}

export function formatAmount(value) {
  return currencyFormatter.format(Math.abs(Number(value) || 0))
}

export function formatNumber(value) {
  return numberFormatter.format(Number(value) || 0)
}

export function formatPercent(value, digits = 0) {
  const number = Number(value) || 0
  return `${number.toFixed(digits)}%`
}

export function formatSignedPercent(value, digits = 1) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '—'
  const sign = number > 0 ? '+' : ''
  return `${sign}${number.toFixed(digits)}%`
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return Number(count) === 1 ? singular : plural
}
