import { useMemo } from 'react'
import {
  CalendarRange,
  Layers3,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from 'lucide-react'
import {
  buildSpendSeries,
  calculateDashboardMetrics,
} from '../lib/analytics'
import { formatRenewalDate, formatWeekdayDate, periodLabel } from '../lib/dates'
import { formatCurrency } from '../lib/format'
import CategoryBreakdown from './CategoryBreakdown'
import PeriodSelector from './PeriodSelector'
import RecentTransactions from './RecentTransactions'
import SpendChart from './SpendChart'
import StatCard from './StatCard'
import SubscriptionStack from './SubscriptionStack'

function greetingForNow() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Overview({
  transactions,
  period,
  onPeriodChange,
  onNavigate,
  onAddRecord,
  onDelete,
}) {
  const metrics = useMemo(
    () => calculateDashboardMetrics(transactions, period),
    [transactions, period],
  )
  const series = useMemo(
    () => buildSpendSeries(transactions, period),
    [transactions, period],
  )

  const nextRenewalLabel = metrics.nextRenewal?.nextBillingDate
    ? formatRenewalDate(metrics.nextRenewal.nextBillingDate)
    : 'No upcoming renewals'

  return (
    <div className="space-y-5">
      <section className="animate-fade-up relative overflow-hidden rounded-[26px] border border-white/[0.055] bg-white/[0.012] px-5 py-6 sm:px-7 sm:py-7">
        <div className="subtle-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-lavender/[0.065] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-lime/[0.035] blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="pill border-lime/10 bg-lime/[0.055] text-lime">
                <Sparkles size={9} />
                Local-first
              </span>
              <span className="eyebrow">{formatWeekdayDate()}</span>
            </div>
            <h1 className="mt-4 text-[34px] font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-[42px]">
              {greetingForNow()}
              <span className="text-lime">.</span>
            </h1>
            <p className="mt-3 max-w-[460px] text-[12px] leading-relaxed text-fog">
              A quiet, private view of where your money goes. No accounts, no
              cloud, no waiting.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <PeriodSelector period={period} onChange={onPeriodChange} />
            <span className="flex items-center gap-1.5 text-[9.5px] text-ghost">
              <ShieldCheck size={11} className="text-lime/70" />
              Your data never leaves this browser
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total outflow"
          value={formatCurrency(metrics.totalSpend)}
          icon={WalletCards}
          tone="coral"
          trend={
            metrics.changePercent !== null
              ? {
                  value: metrics.changePercent,
                  label: 'vs previous period',
                }
              : undefined
          }
          meta={`${metrics.recordCount} records in ${periodLabel(period).toLowerCase()}`}
          className="animate-fade-up delay-1"
        />
        <StatCard
          label="Recurring burn"
          value={formatCurrency(metrics.monthlyBurn)}
          suffix="/mo"
          icon={RefreshCw}
          tone="lavender"
          meta={`Across ${metrics.subscriptionCount} active subscriptions`}
          className="animate-fade-up delay-2"
        />
        <StatCard
          label="Annual forecast"
          value={formatCurrency(metrics.annualForecast)}
          suffix="/yr"
          icon={CalendarRange}
          tone="amber"
          meta="At your current subscription run rate"
          className="animate-fade-up delay-3"
        />
        <StatCard
          label="Active subscriptions"
          value={String(metrics.subscriptionCount).padStart(2, '0')}
          suffix="active"
          icon={Layers3}
          tone="lime"
          meta={`Next renewal · ${nextRenewalLabel}`}
          className="animate-fade-up delay-4"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.8fr)]">
        <SpendChart series={series} periodLabel={periodLabel(period)} />
        <CategoryBreakdown
          categories={metrics.categories}
          total={metrics.totalSpend}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.8fr)]">
        <RecentTransactions
          transactions={transactions}
          onViewAll={() => onNavigate('transactions')}
          onDelete={onDelete}
          onAddRecord={onAddRecord}
        />
        <SubscriptionStack
          subscriptions={metrics.activeSubscriptions}
          monthlyTotal={metrics.monthlyBurn}
          onViewAll={() => onNavigate('subscriptions')}
          onAddSubscription={onAddRecord}
        />
      </div>
    </div>
  )
}
