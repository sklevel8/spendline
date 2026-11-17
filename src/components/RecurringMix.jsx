import { PieChart } from 'lucide-react'
import { getCategory } from '../data/categories'
import { formatCurrency, formatPercent } from '../lib/format'

export default function RecurringMix({ mix, total }) {
  return (
    <section className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Recurring mix</p>
            <PieChart size={11} className="text-fog" />
          </div>
          <h2 className="mt-2 text-[15px] font-semibold tracking-[-0.02em] text-white">
            Monthly by category
          </h2>
        </div>
        <span className="mono-number text-[12px] font-medium text-lime">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {mix.length > 0 ? (
          mix.map((item) => {
            const category = getCategory(item.category)
            return (
              <div key={item.category}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 flex-none rounded-full"
                    style={{ background: category.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-mist">
                    {item.category}
                  </span>
                  <span className="mono-number text-[9px] text-fog">
                    {formatPercent(item.percent)}
                  </span>
                  <span className="mono-number w-[58px] text-right text-[10px] text-white">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${Math.max(item.percent, 2)}%`,
                      background: category.color,
                    }}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <p className="py-5 text-center text-[10px] text-fog">
            No active subscriptions yet.
          </p>
        )}
      </div>

      <p className="mt-5 border-t border-white/[0.055] pt-3 text-[9px] text-ghost">
        Yearly plans are normalized to a monthly equivalent.
      </p>
    </section>
  )
}
