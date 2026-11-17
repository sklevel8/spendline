import { ArrowUpRight, CalendarClock, RefreshCw } from 'lucide-react'
import { getCategory } from '../data/categories'
import { formatRenewalDate, relativeFutureLabel } from '../lib/dates'
import { formatCurrency } from '../lib/format'

export default function SubscriptionStack({
  subscriptions,
  monthlyTotal,
  onViewAll,
  onAddSubscription,
}) {
  const visible = subscriptions.slice(0, 4)

  return (
    <section className="card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Recurring</p>
            <RefreshCw size={11} className="text-fog" />
          </div>
          <h2 className="mt-2 text-[16px] font-semibold tracking-[-0.02em] text-white">
            Subscription stack
          </h2>
        </div>
        <span className="pill">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          {subscriptions.length} active
        </span>
      </div>

      <div className="mt-4 flex-1 space-y-1">
        {visible.length > 0 ? (
          visible.map((subscription) => {
            const category = getCategory(subscription.category)
            const Icon = category.icon
            return (
              <div
                key={subscription.id}
                className="flex items-center gap-2.5 rounded-xl border border-transparent px-1.5 py-2 transition hover:border-white/[0.055] hover:bg-white/[0.025]"
              >
                <span
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px] border border-white/[0.04]"
                  style={{ color: category.color, background: category.soft }}
                >
                  <Icon size={14} strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-[#edf1f5]">
                    {subscription.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[9px] text-fog">
                    <CalendarClock size={9} />
                    {subscription.nextBillingDate
                      ? `${formatRenewalDate(subscription.nextBillingDate)} · ${relativeFutureLabel(subscription.nextBillingDate)}`
                      : 'No renewal date'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="mono-number text-[11px] font-medium text-white">
                    {formatCurrency(subscription.monthlyAmount)}
                    <span className="text-[8px] text-fog">/mo</span>
                  </p>
                  {subscription.billingCycle === 'yearly' ? (
                    <p className="mt-0.5 text-[8px] text-ghost">
                      {formatCurrency(subscription.amount)}/yr
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.035] text-fog">
              <RefreshCw size={17} />
            </span>
            <p className="mt-3 text-xs font-semibold text-white">
              No recurring costs
            </p>
            <p className="mt-1 max-w-[190px] text-[10px] leading-relaxed text-fog">
              Track your subscriptions to see your real monthly burn.
            </p>
            <button
              type="button"
              onClick={() => onAddSubscription('subscription')}
              className="btn-secondary mt-4 px-3 py-2 text-[10px]"
            >
              Add subscription
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-white/[0.055] pt-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ghost">
            Monthly burn
          </span>
          <span className="mono-number text-[12px] font-medium text-lime">
            {formatCurrency(monthlyTotal)}
            <span className="text-[8px] text-fog">/mo</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.025] py-2 text-[10px] font-semibold text-fog transition hover:border-white/[0.12] hover:bg-white/[0.045] hover:text-white"
        >
          Manage subscriptions
          <ArrowUpRight size={11} />
        </button>
      </div>
    </section>
  )
}
