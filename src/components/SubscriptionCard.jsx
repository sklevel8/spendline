import {
  CalendarClock,
  Pause,
  Play,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { getCategory } from '../data/categories'
import { formatRenewalDate, relativeFutureLabel } from '../lib/dates'
import { formatCurrency } from '../lib/format'

export default function SubscriptionCard({
  subscription,
  onToggle,
  onDelete,
}) {
  const active = subscription.active !== false
  const category = getCategory(subscription.category)
  const Icon = category.icon
  const isYearly = subscription.billingCycle === 'yearly'

  return (
    <article
      className={`card card-hover group relative overflow-hidden p-4 transition ${
        active ? '' : 'opacity-70'
      }`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-2xl"
        style={{ background: category.soft }}
      />

      <div className="relative flex items-start gap-3">
        <span
          className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-white/[0.045]"
          style={{ color: category.color, background: category.soft }}
        >
          <Icon size={17} strokeWidth={1.9} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-white">
            {subscription.title}
          </p>
          <p className="mt-0.5 text-[9.5px] text-fog">{subscription.category}</p>
        </div>

        <span
          className={`pill flex-none ${
            active
              ? 'border-lime/10 bg-lime/[0.055] text-lime'
              : 'border-white/[0.07] bg-white/[0.03] text-fog'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              active ? 'bg-lime' : 'bg-ghost'
            }`}
          />
          {active ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="metric-number text-[24px] font-semibold leading-none text-white">
            {formatCurrency(subscription.amount)}
            <span className="ml-1 text-[10px] font-medium text-fog">
              /{isYearly ? 'yr' : 'mo'}
            </span>
          </p>
          <p className="mt-1.5 text-[9px] text-ghost">
            {isYearly
              ? `${formatCurrency(subscription.amount / 12)}/mo equivalent`
              : `${formatCurrency(subscription.amount * 12)} annualized`}
          </p>
        </div>
        <RefreshCw
          size={13}
          className={active ? 'text-lavender/70' : 'text-ghost'}
        />
      </div>

      <div className="relative mt-4 flex items-center justify-between border-t border-white/[0.055] pt-3">
        <div className="flex items-center gap-1.5 text-[9px] text-fog">
          <CalendarClock size={10} />
          {active && subscription.nextBillingDate ? (
            <span>
              Next · {formatRenewalDate(subscription.nextBillingDate)}{' '}
              <span className="text-ghost">
                ({relativeFutureLabel(subscription.nextBillingDate)})
              </span>
            </span>
          ) : (
            <span>Renewal tracking paused</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggle(subscription)}
            className="icon-button h-7 w-7 rounded-lg"
            title={active ? 'Pause subscription' : 'Resume subscription'}
            aria-label={`${active ? 'Pause' : 'Resume'} ${subscription.title}`}
          >
            {active ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(subscription)}
            className="icon-button h-7 w-7 rounded-lg hover:border-coral/10 hover:bg-coral/[0.06] hover:text-coral"
            title="Delete subscription"
            aria-label={`Delete ${subscription.title}`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </article>
  )
}
