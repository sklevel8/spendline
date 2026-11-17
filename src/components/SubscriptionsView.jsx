import { useMemo } from 'react'
import {
  CalendarClock,
  Layers3,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import {
  getActiveSubscriptions,
  getRecurringMix,
  monthlyEquivalent,
} from '../lib/analytics'
import {
  formatRenewalDate,
  getNextBillingDate,
  relativeFutureLabel,
} from '../lib/dates'
import { formatCurrency } from '../lib/format'
import RecurringMix from './RecurringMix'
import RenewalRadar from './RenewalRadar'
import SubscriptionCard from './SubscriptionCard'
import ViewHeader from './ViewHeader'

export default function SubscriptionsView({
  transactions,
  onAddRecord,
  onToggle,
  onDelete,
}) {
  const activeSubscriptions = useMemo(
    () => getActiveSubscriptions(transactions),
    [transactions],
  )

  const pausedSubscriptions = useMemo(
    () =>
      transactions
        .filter(
          (record) => record.type === 'subscription' && record.active === false,
        )
        .map((record) => ({
          ...record,
          monthlyAmount: monthlyEquivalent(record),
          nextBillingDate: getNextBillingDate(record.date, record.billingCycle),
        }))
        .sort((a, b) => {
          if (!a.nextBillingDate) return 1
          if (!b.nextBillingDate) return -1
          return a.nextBillingDate - b.nextBillingDate
        }),
    [transactions],
  )

  const mix = useMemo(() => getRecurringMix(transactions), [transactions])
  const monthlyBurn = activeSubscriptions.reduce(
    (total, record) => total + record.monthlyAmount,
    0,
  )
  const annualCommitment = monthlyBurn * 12
  const averageCost =
    activeSubscriptions.length > 0 ? monthlyBurn / activeSubscriptions.length : 0
  const nextRenewal = activeSubscriptions[0] ?? null
  const hasSubscriptions =
    activeSubscriptions.length > 0 || pausedSubscriptions.length > 0

  return (
    <div className="space-y-5">
      <ViewHeader
        eyebrow="Recurring"
        title="Subscriptions"
        description="See the true cost of everything you keep paying for. Yearly plans are normalized into a monthly burn rate."
      >
        <button
          type="button"
          onClick={() => onAddRecord('subscription')}
          className="btn-primary"
        >
          <Plus size={15} strokeWidth={2.4} />
          Add subscription
        </button>
      </ViewHeader>

      <section className="card relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-lavender/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-lime/[0.04] blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr_1fr] lg:gap-0 lg:divide-x lg:divide-white/[0.065]">
          <div className="lg:pr-6">
            <div className="flex items-center gap-2">
              <span className="pill border-lime/10 bg-lime/[0.055] text-lime">
                <Sparkles size={9} />
                Live burn
              </span>
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-ghost">
              Monthly recurring
            </p>
            <p className="metric-number mt-1 text-[36px] font-semibold leading-none text-white sm:text-[40px]">
              {formatCurrency(monthlyBurn)}
              <span className="ml-1 text-[11px] font-medium text-fog">/mo</span>
            </p>
            <p className="mt-2 text-[10px] text-fog">
              Across {activeSubscriptions.length}{' '}
              {activeSubscriptions.length === 1 ? 'active plan' : 'active plans'}
            </p>
          </div>

          <div className="lg:px-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-amber/[0.08] text-amber">
              <TrendingUp size={15} />
            </span>
            <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-ghost">
              Annual commitment
            </p>
            <p className="mono-number mt-1 text-[19px] font-medium text-white">
              {formatCurrency(annualCommitment)}
            </p>
            <p className="mt-1 text-[9px] text-fog">If nothing changes</p>
          </div>

          <div className="lg:px-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-lime/[0.07] text-lime">
              <Layers3 size={15} />
            </span>
            <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-ghost">
              Average plan
            </p>
            <p className="mono-number mt-1 text-[19px] font-medium text-white">
              {formatCurrency(averageCost)}
            </p>
            <p className="mt-1 text-[9px] text-fog">Per active subscription</p>
          </div>

          <div className="lg:pl-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-lavender/[0.08] text-lavender">
              <CalendarClock size={15} />
            </span>
            <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-ghost">
              Next renewal
            </p>
            {nextRenewal?.nextBillingDate ? (
              <>
                <p className="mt-1 truncate text-[12px] font-semibold text-white">
                  {nextRenewal.title}
                </p>
                <p className="mt-1 text-[9px] text-fog">
                  {formatRenewalDate(nextRenewal.nextBillingDate)} ·{' '}
                  {relativeFutureLabel(nextRenewal.nextBillingDate)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-[11px] text-fog">Nothing scheduled</p>
            )}
          </div>
        </div>
      </section>

      {hasSubscriptions ? (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)]">
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="eyebrow">Portfolio</p>
                  <h2 className="mt-1.5 text-[17px] font-semibold tracking-[-0.025em] text-white">
                    Your stack
                  </h2>
                </div>
                <span className="flex items-center gap-1.5 text-[9px] text-fog">
                  <RefreshCw size={10} />
                  {activeSubscriptions.length} active
                </span>
              </div>

              {activeSubscriptions.length > 0 ? (
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  {activeSubscriptions.map((subscription) => (
                    <SubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      onToggle={onToggle}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="card flex min-h-[200px] flex-col items-center justify-center p-6 text-center">
                  <p className="text-xs font-semibold text-white">
                    No active subscriptions
                  </p>
                  <p className="mt-1.5 max-w-xs text-[10px] leading-relaxed text-fog">
                    Add a plan to start tracking your recurring burn.
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddRecord('subscription')}
                    className="btn-primary mt-4"
                  >
                    <Plus size={14} />
                    Add subscription
                  </button>
                </div>
              )}
            </div>

            {pausedSubscriptions.length > 0 ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="eyebrow">Archived</p>
                    <h2 className="mt-1.5 text-[17px] font-semibold tracking-[-0.025em] text-white">
                      Paused
                    </h2>
                  </div>
                  <span className="text-[9px] text-ghost">
                    Excluded from burn
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  {pausedSubscriptions.map((subscription) => (
                    <SubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                      onToggle={onToggle}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-5">
            <RecurringMix mix={mix} total={monthlyBurn} />
            <RenewalRadar subscriptions={activeSubscriptions} />
            <div className="rounded-2xl border border-dashed border-white/[0.07] px-4 py-3 text-[9px] leading-relaxed text-ghost">
              Burn rate updates instantly in memory. Your subscriptions are
              stored only in IndexedDB on this device.
            </div>
          </aside>
        </div>
      ) : (
        <section className="card flex min-h-[340px] flex-col items-center justify-center p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-fog">
            <RefreshCw size={20} />
          </span>
          <p className="mt-4 text-sm font-semibold text-white">
            Start tracking your recurring costs
          </p>
          <p className="mt-1.5 max-w-sm text-[11px] leading-relaxed text-fog">
            Add the tools and services you pay for. We will calculate your
            monthly burn and annual commitment automatically.
          </p>
          <button
            type="button"
            onClick={() => onAddRecord('subscription')}
            className="btn-primary mt-5"
          >
            <Plus size={14} />
            Add your first subscription
          </button>
        </section>
      )}
    </div>
  )
}
