import { PieChart } from 'lucide-react'
import { getCategory } from '../data/categories'
import { formatCurrency, formatPercent } from '../lib/format'

const SIZE = 180
const STROKE = 15
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function CategoryBreakdown({ categories, total }) {
  const segments = categories.reduce(
    (result, item) => {
      const color = getCategory(item.category).color
      const length = (item.percent / 100) * CIRCUMFERENCE
      result.segments.push({
        ...item,
        color,
        length,
        offset: result.cursor,
      })
      result.cursor += length
      return result
    },
    { segments: [], cursor: 0 },
  ).segments

  const topCategories = categories.slice(0, 5)
  const remaining = categories.length - topCategories.length

  return (
    <section className="card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Distribution</p>
            <PieChart size={11} className="text-fog" />
          </div>
          <h2 className="mt-2 text-[16px] font-semibold tracking-[-0.02em] text-white">
            Where it went
          </h2>
        </div>
        <span className="pill">By category</span>
      </div>

      <div className="relative mx-auto mt-4 flex h-[180px] w-[180px] flex-none items-center justify-center">
        <div className="absolute inset-8 rounded-full bg-lavender/[0.045] blur-2xl" />
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="relative -rotate-90"
          role="img"
          aria-label="Spending distribution by category"
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={STROKE}
          />
          {segments.map((segment) => (
            <circle
              key={segment.category}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${Math.max(segment.length - 4, 0)} ${CIRCUMFERENCE}`}
              strokeDashoffset={-segment.offset}
              className="transition-[stroke-dasharray] duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ghost">
            Tracked
          </span>
          <span className="mono-number mt-1 max-w-[110px] truncate text-[19px] font-medium text-white">
            {formatCurrency(total)}
          </span>
          <span className="mt-1 text-[9px] text-fog">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </span>
        </div>
      </div>

      <div className="mt-3 flex-1 space-y-1">
        {topCategories.length === 0 ? (
          <div className="flex h-full min-h-[140px] items-center justify-center text-center text-[11px] text-fog">
            No category data for this period.
          </div>
        ) : (
          topCategories.map((item) => {
            const category = getCategory(item.category)
            const Icon = category.icon
            return (
              <div
                key={item.category}
                className="group flex items-center gap-2.5 rounded-lg px-1 py-1.5 transition hover:bg-white/[0.025]"
              >
                <span
                  className="flex h-6 w-6 flex-none items-center justify-center rounded-[7px]"
                  style={{ color: category.color, background: category.soft }}
                >
                  <Icon size={12} strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-mist">
                  {item.category}
                </span>
                <span className="mono-number text-[10px] text-fog">
                  {formatPercent(item.percent)}
                </span>
                <span className="mono-number w-[62px] text-right text-[10px] font-medium text-white">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            )
          })
        )}
      </div>

      {remaining > 0 ? (
        <p className="mt-2 border-t border-white/[0.055] pt-2.5 text-[9px] text-ghost">
          + {remaining} more {remaining === 1 ? 'category' : 'categories'} included
        </p>
      ) : null}
    </section>
  )
}
