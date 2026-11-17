import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addDays,
  addMonths,
  endOfDay,
  getNextBillingDate,
  getPeriodRange,
  isWithinRange,
  parseISODate,
  relativeDateLabel,
  relativeFutureLabel,
  startOfDay,
  toISODate,
} from '../src/lib/dates.js'

test('toISODate and parseISODate round-trip a local calendar date', () => {
  const date = new Date(2026, 10, 3, 23, 45)
  assert.equal(toISODate(date), '2026-11-03')

  const parsed = parseISODate('2026-11-03')
  assert.equal(parsed.getFullYear(), 2026)
  assert.equal(parsed.getMonth(), 10)
  assert.equal(parsed.getDate(), 3)
})

test('addMonths clamps to the last day of short months', () => {
  const january31 = new Date(2026, 0, 31, 12)
  const february = addMonths(january31, 1)
  assert.equal(toISODate(february), '2026-02-28')

  const nextYear = addMonths(new Date(2028, 1, 29, 12), 12)
  assert.equal(toISODate(nextYear), '2029-02-28')
})

test('addDays and range helpers keep local day boundaries', () => {
  const now = new Date(2026, 10, 3, 15, 30)
  assert.equal(toISODate(addDays(now, -29)), '2026-10-05')
  assert.equal(toISODate(startOfDay(now)), '2026-11-03')
  assert.equal(endOfDay(now).getHours(), 23)
})

test('monthly renewals advance from the most recent charge', () => {
  const next = getNextBillingDate('2026-10-15', 'monthly', new Date(2026, 10, 3, 9))
  assert.equal(toISODate(next), '2026-11-15')

  const onChargeDay = getNextBillingDate(
    '2026-11-15',
    'monthly',
    new Date(2026, 10, 15, 9),
  )
  assert.equal(toISODate(onChargeDay), '2026-12-15')
})

test('yearly renewals skip twelve months at a time and handle leap days', () => {
  const next = getNextBillingDate('2025-03-15', 'yearly', new Date(2026, 0, 1))
  assert.equal(toISODate(next), '2026-03-15')

  // On the anniversary the charge is due today, not a year away.
  const anniversary = getNextBillingDate(
    '2025-03-15',
    'yearly',
    new Date(2026, 2, 15),
  )
  assert.equal(toISODate(anniversary), '2026-03-15')

  const afterAnniversary = getNextBillingDate(
    '2025-03-15',
    'yearly',
    new Date(2026, 2, 16),
  )
  assert.equal(toISODate(afterAnniversary), '2027-03-15')

  const onChargeDay = getNextBillingDate(
    '2026-03-15',
    'yearly',
    new Date(2026, 2, 15),
  )
  assert.equal(toISODate(onChargeDay), '2027-03-15')

  const leap = getNextBillingDate('2028-02-29', 'yearly', new Date(2028, 1, 29))
  assert.equal(toISODate(leap), '2029-02-28')
})

test('getNextBillingDate returns null for invalid dates', () => {
  assert.equal(getNextBillingDate('not-a-date', 'monthly'), null)
})

test('getPeriodRange builds current and previous windows for every period', () => {
  const now = new Date(2026, 10, 3, 12)

  const month = getPeriodRange('30d', now)
  assert.equal(toISODate(month.start), '2026-10-05')
  assert.equal(toISODate(month.end), '2026-11-03')
  assert.equal(toISODate(month.previousStart), '2026-09-05')
  assert.equal(toISODate(month.previousEnd), '2026-10-04')
  assert.equal(month.previousEnd.getTime(), endOfDay(new Date(2026, 9, 4)).getTime())

  const quarter = getPeriodRange('90d', now)
  assert.equal(toISODate(quarter.start), '2026-08-06')
  assert.equal(toISODate(quarter.end), '2026-11-03')

  const year = getPeriodRange('12m', now)
  assert.equal(toISODate(year.start), '2025-12-01')
  assert.equal(toISODate(year.previousStart), '2024-12-01')
  assert.equal(toISODate(year.previousEnd), '2025-11-30')
})

test('isWithinRange includes both ends and rejects invalid dates', () => {
  const start = new Date(2026, 10, 1)
  const end = new Date(2026, 10, 30, 23, 59)
  assert.equal(isWithinRange('2026-11-01', start, end), true)
  assert.equal(isWithinRange('2026-11-30', start, end), true)
  assert.equal(isWithinRange('2026-12-01', start, end), false)
  assert.equal(isWithinRange('nope', start, end), false)
})

test('relative labels are stable around today boundaries', () => {
  const now = new Date(2026, 10, 3, 12)
  assert.equal(relativeDateLabel('2026-11-03', now), 'Today')
  assert.equal(relativeDateLabel('2026-11-02', now), 'Yesterday')
  assert.equal(relativeDateLabel('2025-11-03', now), 'Nov 3, 2025')
  assert.equal(relativeFutureLabel('2026-11-04', now), 'Tomorrow')
  assert.equal(relativeFutureLabel('2026-11-10', now), 'In 1 week')
  assert.equal(relativeFutureLabel('2026-11-16', now), 'In 2 weeks')
  assert.equal(relativeFutureLabel('2026-12-03', now), 'In 1 month')
})
