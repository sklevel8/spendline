import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSpendSeries,
  calculateCategoryTotals,
  calculateDashboardMetrics,
  filterTransactions,
  getActiveSubscriptions,
  getRecurringMix,
  groupTransactionsByDate,
  isActiveSubscription,
  monthlyEquivalent,
  sumAmounts,
} from '../src/lib/analytics.js'

const NOW = new Date(2026, 10, 3, 12)

const records = [
  {
    id: 1,
    title: 'Design tool',
    amount: 10,
    category: 'Design',
    type: 'subscription',
    billingCycle: 'monthly',
    active: true,
    date: '2026-10-15',
  },
  {
    id: 2,
    title: 'Annual hosting',
    amount: 120,
    category: 'Infrastructure',
    type: 'subscription',
    billingCycle: 'yearly',
    active: true,
    date: '2026-09-01',
  },
  {
    id: 3,
    title: 'Paused plan',
    amount: 50,
    category: 'Productivity',
    type: 'subscription',
    billingCycle: 'monthly',
    active: false,
    date: '2026-08-10',
  },
  {
    id: 4,
    title: 'Team lunch',
    amount: 20,
    category: 'Food',
    type: 'expense',
    date: '2026-11-01',
  },
  {
    id: 5,
    title: 'Client dinner',
    amount: 30,
    category: 'Food',
    type: 'expense',
    date: '2026-10-20',
  },
  {
    id: 6,
    title: 'Previous period expense',
    amount: 15,
    category: 'Travel',
    type: 'expense',
    date: '2026-09-20',
  },
]

test('sumAmounts safely adds records and ignores malformed amounts', () => {
  assert.equal(sumAmounts([{ amount: 10 }, { amount: '5.5' }, { amount: 'x' }]), 15.5)
  assert.equal(sumAmounts([]), 0)
})

test('monthlyEquivalent normalizes yearly plans and excludes paused plans', () => {
  assert.equal(monthlyEquivalent(records[0]), 10)
  assert.equal(monthlyEquivalent(records[1]), 10)
  assert.equal(monthlyEquivalent(records[2]), 0)
  assert.equal(isActiveSubscription(records[2]), false)
})

test('getActiveSubscriptions enriches and sorts active plans by renewal date', () => {
  const active = getActiveSubscriptions(records, NOW)
  assert.equal(active.length, 2)
  assert.deepEqual(active.map((record) => record.title), [
    'Design tool',
    'Annual hosting',
  ])
  assert.equal(active[0].monthlyAmount, 10)
  assert.equal(active[0].nextBillingDate.getMonth(), 10)
  assert.equal(active[0].nextBillingDate.getDate(), 15)
  assert.equal(active.reduce((total, record) => total + record.monthlyAmount, 0), 20)
})

test('calculateCategoryTotals aggregates, sorts, and calculates percentages', () => {
  const totals = calculateCategoryTotals(records.slice(3, 5))
  assert.deepEqual(totals, [
    { category: 'Food', amount: 50, percent: 100 },
  ])

  const mixed = calculateCategoryTotals([
    ...records.slice(3, 5),
    { amount: 50, category: 'Travel' },
  ])
  assert.equal(mixed[0].category, 'Food')
  assert.equal(mixed[0].amount, 50)
  assert.equal(mixed[0].percent, 50)
})

test('getRecurringMix uses normalized monthly amounts', () => {
  const mix = getRecurringMix(records, NOW)
  assert.deepEqual(
    mix.map((item) => [item.category, item.amount, item.percent]),
    [
      ['Design', 10, 50],
      ['Infrastructure', 10, 50],
    ],
  )
})

test('buildSpendSeries buckets only records inside the selected window', () => {
  const series = buildSpendSeries(records, '30d', NOW)
  assert.equal(series.points.length, 30)
  assert.equal(series.total, 60)
  assert.equal(series.range.days, 30)
  assert.equal(series.average, 2)

  const totalFromBuckets = series.points.reduce(
    (total, point) => total + point.value,
    0,
  )
  assert.equal(totalFromBuckets, 60)

  const yearSeries = buildSpendSeries(records, '12m', NOW)
  assert.equal(yearSeries.points.length, 12)
  assert.equal(yearSeries.total, 60 + 120 + 50 + 15)
})

test('calculateDashboardMetrics compares against the previous window', () => {
  const metrics = calculateDashboardMetrics(records, '30d', NOW)
  assert.equal(metrics.totalSpend, 60)
  assert.equal(metrics.previousSpend, 15)
  assert.equal(metrics.changePercent, 300)
  assert.equal(metrics.recordCount, 3)
  assert.equal(metrics.subscriptionCount, 2)
  assert.equal(metrics.monthlyBurn, 20)
  assert.equal(metrics.annualForecast, 240)
  assert.equal(metrics.averagePerDay, 2)
  assert.equal(metrics.nextRenewal.title, 'Design tool')
  assert.equal(metrics.topCategory.category, 'Food')
  assert.equal(metrics.largestRecord.title, 'Client dinner')
})

test('calculateDashboardMetrics avoids division by zero when history is empty', () => {
  const metrics = calculateDashboardMetrics(
    records.filter((record) => record.type === 'expense').slice(0, 2),
    '30d',
    new Date(2026, 10, 3),
  )
  assert.equal(metrics.previousSpend, 0)
  assert.equal(metrics.changePercent, null)
})

test('filterTransactions matches title, category, and type', () => {
  assert.deepEqual(
    filterTransactions(records, { query: 'food', type: 'all', category: 'all' })
      .map((record) => record.title),
    ['Team lunch', 'Client dinner'],
  )
  assert.deepEqual(
    filterTransactions(records, {
      query: '',
      type: 'subscription',
      category: 'Design',
    }).map((record) => record.title),
    ['Design tool'],
  )
  assert.equal(
    filterTransactions(records, { query: 'missing', type: 'all', category: 'all' })
      .length,
    0,
  )
})

test('groupTransactionsByDate groups records and sums daily totals', () => {
  const groups = groupTransactionsByDate(
    records.filter((record) => record.type === 'expense'),
    NOW,
  )
  assert.equal(groups.length, 3)
  assert.equal(groups[0].label, 'Sunday, November 1')
  assert.equal(groups[0].total, 20)
  assert.equal(groups[1].label, 'Tuesday, October 20')
  assert.equal(groups[1].total, 30)
  assert.equal(groups[2].label, 'Sunday, September 20')
})
