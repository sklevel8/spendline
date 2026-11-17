import { RefreshCw, Trash2 } from 'lucide-react'
import { getCategory } from '../data/categories'
import { relativeDateLabel } from '../lib/dates'
import { formatAmount } from '../lib/format'

export default function TransactionRow({
  record,
  onDelete,
  showDate = true,
  compact = false,
}) {
  const category = getCategory(record.category)
  const Icon = category.icon
  const isSubscription = record.type === 'subscription'
  const dateLabel = relativeDateLabel(record.date)
  const secondaryLabel = showDate
    ? dateLabel
    : isSubscription
      ? `${record.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} billing`
      : 'One-time'

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl border border-transparent px-2.5 transition hover:border-white/[0.055] hover:bg-white/[0.025] ${
        compact ? 'py-2.5' : 'py-3'
      }`}
    >
      <span
        className="flex h-9 w-9 flex-none items-center justify-center rounded-[11px] border border-white/[0.045]"
        style={{ color: category.color, background: category.soft }}
      >
        <Icon size={15} strokeWidth={1.9} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[12px] font-semibold tracking-[-0.01em] text-[#edf1f5]">
            {record.title}
          </p>
          {isSubscription ? (
            <span className="hidden flex-none items-center gap-1 rounded border border-lavender/10 bg-lavender/[0.06] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.05em] text-lavender sm:inline-flex">
              <RefreshCw size={8} />
              recurring
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[9.5px] text-fog">
          <span className="min-w-0 truncate">{record.category}</span>
          <span className="flex-none text-ghost">·</span>
          <span className="flex-none">{secondaryLabel}</span>
        </div>
      </div>

      <div className="flex flex-none items-center gap-2">
        <div className="text-right">
          <p
            className={`mono-number text-[12px] font-medium ${
              isSubscription ? 'text-lavender' : 'text-[#f2b6bf]'
            }`}
          >
            −{formatAmount(record.amount)}
          </p>
          {!compact ? (
            <p className="mt-0.5 text-[8px] uppercase tracking-[0.08em] text-ghost">
              {isSubscription ? 'Recurring' : 'Expense'}
            </p>
          ) : null}
        </div>
        {onDelete ? (
          <button
            type="button"
            onClick={() => onDelete(record)}
            className="icon-button h-7 w-7 rounded-lg text-ghost opacity-100 transition hover:border-coral/10 hover:bg-coral/[0.06] hover:text-coral sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
            aria-label={`Delete ${record.title}`}
            title={`Delete ${record.title}`}
          >
            <Trash2 size={13} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
