import { ArrowUpRight, Check, ReceiptText } from 'lucide-react'
import TransactionRow from './TransactionRow'

export default function RecentTransactions({
  transactions,
  onViewAll,
  onDelete,
  onAddRecord,
}) {
  const recent = transactions.slice(0, 5)

  return (
    <section className="card flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Ledger</p>
          <h2 className="mt-2 text-[16px] font-semibold tracking-[-0.02em] text-white">
            Latest activity
          </h2>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-[10px] font-semibold text-fog transition hover:border-white/[0.13] hover:bg-white/[0.05] hover:text-white"
        >
          View all
          <ArrowUpRight size={11} />
        </button>
      </div>

      <div className="mt-4 flex-1 space-y-0.5">
        {recent.length > 0 ? (
          recent.map((record) => (
            <TransactionRow
              key={record.id}
              record={record}
              onDelete={onDelete}
              compact
            />
          ))
        ) : (
          <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.035] text-fog">
              <ReceiptText size={17} />
            </span>
            <p className="mt-3 text-xs font-semibold text-white">
              Your ledger is empty
            </p>
            <p className="mt-1 max-w-[220px] text-[10px] leading-relaxed text-fog">
              Add your first expense or subscription. Everything stays on this
              device.
            </p>
            <button
              type="button"
              onClick={() => onAddRecord('expense')}
              className="btn-secondary mt-4 px-3 py-2 text-[10px]"
            >
              Add a record
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.055] pt-3.5 text-[9px] text-ghost">
        <span className="flex items-center gap-1.5">
          <Check size={10} className="text-lime" />
          Changes saved to this device
        </span>
        <span className="font-mono">
          {transactions.length} {transactions.length === 1 ? 'record' : 'records'}
        </span>
      </div>
    </section>
  )
}
