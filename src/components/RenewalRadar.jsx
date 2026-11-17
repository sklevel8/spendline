import { CalendarClock } from 'lucide-react'
import { getCategory } from '../data/categories'
import { formatRenewalDate, relativeFutureLabel } from '../lib/dates'
import { formatCurrency } from '../lib/format'

export default function RenewalRadar({ subscriptions }) {
  const upcoming = subscriptions.slice(0, 4)

  return (
    <section className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Renewal radar</p>
          <h2 className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-white">
            Coming up
          </h2>
        </div>
        <CalendarClock size={14} className="mt-0.5 text-fog" />
      </div>

      <div className="mt-4 space-y-1">
        {upcoming.length > 0 ? (
          upcoming.map((subscription) => {
            const category = getCategory(subscription.category)
            const date = subscription.nextBillingDate
            return (
              <div
                key={subscription.id}
                className="flex items-center gap-2.5 rounded-lg px-1 py-2 transition hover:bg-white/[0.025]"
              >
                <span
                  className="flex h-8 w-8 flex-none flex-col items-center justify-center rounded-[9px] border border-white/[0.05] font-mono leading-none"
                  style={{ color: category.color, background: category.soft }}
                >
                  <span className="text-[8px] uppercase">
                    {date
                      ? date.toLocaleDateString('en-US', { month: 'short' })
                      : '—'}
                  </span>
                  <span className="mt-0.5 text-[11px] font-medium">
                    {date ? date.getDate() : '—'}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] font-semibold text-mist">
                    {subscription.title}
                  </p>
                  <p className="mt-0.5 text-[8.5px] text-ghost">
                    {date ? relativeFutureLabel(date) : 'No date'}
                  </p>
                </div>
                <span className="mono-number text-[10px] text-white">
                  {formatCurrency(subscription.amount)}
                </span>
              </div>
            )
          })
        ) : (
          <p className="py-5 text-center text-[10px] text-fog">
            No active renewals.
          </p>
        )}
      </div>

      {upcoming[0]?.nextBillingDate ? (
        <p className="mt-4 border-t border-white/[0.055] pt-3 text-[9px] text-ghost">
          Next charge on {formatRenewalDate(upcoming[0].nextBillingDate)}.
        </p>
      ) : null}
    </section>
  )
}
