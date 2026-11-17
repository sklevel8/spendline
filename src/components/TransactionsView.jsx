import { useMemo } from 'react'
import {
  ChevronDown,
  Download,
  Plus,
  ReceiptText,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import {
  filterTransactions,
  groupTransactionsByDate,
  sumAmounts,
} from '../lib/analytics'
import { formatCurrency } from '../lib/format'
import TransactionRow from './TransactionRow'
import ViewHeader from './ViewHeader'

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Expenses' },
  { value: 'subscription', label: 'Subscriptions' },
]

export default function TransactionsView({
  transactions,
  filters,
  onFiltersChange,
  onAddRecord,
  onDelete,
  onExport,
}) {
  const filtered = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters],
  )
  const groups = useMemo(() => groupTransactionsByDate(filtered), [filtered])
  const filteredTotal = useMemo(() => sumAmounts(filtered), [filtered])
  const activeFilters =
    filters.query.trim() !== '' ||
    filters.type !== 'all' ||
    filters.category !== 'all'

  const counts = useMemo(
    () => ({
      all: transactions.length,
      expense: transactions.filter((record) => record.type === 'expense').length,
      subscription: transactions.filter((record) => record.type === 'subscription')
        .length,
    }),
    [transactions],
  )

  function updateFilter(key, value) {
    onFiltersChange({ ...filters, [key]: value })
  }

  function clearFilters() {
    onFiltersChange({ query: '', type: 'all', category: 'all' })
  }

  return (
    <div className="space-y-5">
      <ViewHeader
        eyebrow="Ledger"
        title="Transactions"
        description="Every one-time expense and recurring charge, searchable in memory. Nothing is sent anywhere."
      >
        <button
          type="button"
          onClick={onExport}
          className="btn-secondary"
          title="Download a JSON backup"
        >
          <Download size={14} />
          Backup
        </button>
        <button
          type="button"
          onClick={() => onAddRecord('expense')}
          className="btn-primary"
        >
          <Plus size={15} strokeWidth={2.4} />
          Add record
        </button>
      </ViewHeader>

      <section className="card p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ghost"
            />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => updateFilter('query', event.target.value)}
              placeholder="Search by title, category, or type..."
              className="field h-10 pl-9 pr-9 text-[12px]"
              aria-label="Search transactions"
            />
            {filters.query ? (
              <button
                type="button"
                onClick={() => updateFilter('query', '')}
                className="icon-button absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            ) : null}
          </div>

          <div
            className="flex flex-none items-center rounded-xl border border-white/[0.07] bg-white/[0.025] p-1"
            role="group"
            aria-label="Filter by record type"
          >
            {TYPE_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateFilter('type', option.value)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition ${
                  filters.type === option.value
                    ? 'bg-white/[0.09] text-white shadow-sm'
                    : 'text-fog hover:text-mist'
                }`}
                aria-pressed={filters.type === option.value}
              >
                {option.label}
                <span className="font-mono text-[8px] font-normal text-ghost">
                  {counts[option.value]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-none">
            <SlidersHorizontal
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ghost"
            />
            <select
              value={filters.category}
              onChange={(event) => updateFilter('category', event.target.value)}
              className="field h-10 appearance-none pl-8 pr-8 text-[11px]"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ghost"
            />
          </div>

          {activeFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-10 flex-none items-center gap-1.5 rounded-xl px-2.5 text-[10px] font-semibold text-fog transition hover:bg-white/[0.04] hover:text-white"
            >
              <X size={12} />
              Clear
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.055] pt-3.5">
          <p className="text-[10px] text-fog">
            <span className="font-mono text-mist">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'record' : 'records'} found
            {activeFilters ? ' with current filters' : ''}
          </p>
          <p className="text-[10px] text-ghost">
            Filtered total{' '}
            <span className="mono-number ml-1 text-[11px] font-medium text-white">
              {formatCurrency(filteredTotal)}
            </span>
          </p>
        </div>
      </section>

      <section className="card p-2 sm:p-3">
        {groups.length > 0 ? (
          <div>
            {groups.map((group, index) => (
              <div
                key={group.key}
                className={index > 0 ? 'border-t border-white/[0.055]' : ''}
              >
                <div className="flex items-center justify-between px-2.5 pb-1 pt-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-ghost">
                    {group.label}
                  </p>
                  <p className="mono-number text-[9px] text-fog">
                    {formatCurrency(group.total)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  {group.records.map((record) => (
                    <TransactionRow
                      key={record.id}
                      record={record}
                      onDelete={onDelete}
                      showDate={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] text-fog">
              <ReceiptText size={20} />
            </span>
            <p className="mt-4 text-sm font-semibold text-white">
              No records match
            </p>
            <p className="mt-1.5 max-w-xs text-[11px] leading-relaxed text-fog">
              Try a different search, or clear the filters to see your full
              local ledger.
            </p>
            {activeFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary mt-5"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAddRecord('expense')}
                className="btn-primary mt-5"
              >
                <Plus size={14} />
                Add your first record
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
