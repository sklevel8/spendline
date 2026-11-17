import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeftRight,
  ArrowRight,
  CornerDownLeft,
  Download,
  LayoutDashboard,
  ReceiptText,
  RefreshCw,
  Search,
} from 'lucide-react'
import { getCategory } from '../data/categories'
import { formatCurrency } from '../lib/format'

function commandMatches(command, query) {
  if (!query) return true
  const haystack = [command.label, command.hint, command.keywords]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

export default function CommandPalette({
  open,
  onClose,
  transactions,
  onNavigate,
  onAddRecord,
  onExport,
  onFilterType,
  onFindRecord,
}) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const restoreFocusRef = useRef(null)

  const baseCommands = useMemo(
    () => [
      {
        id: 'add-expense',
        group: 'Actions',
        label: 'Add an expense',
        hint: 'One-time spend',
        keywords: 'new create record cost',
        icon: ReceiptText,
        run: () => onAddRecord('expense'),
      },
      {
        id: 'add-subscription',
        group: 'Actions',
        label: 'Add a subscription',
        hint: 'Recurring cost',
        keywords: 'new create recurring plan saas',
        icon: RefreshCw,
        run: () => onAddRecord('subscription'),
      },
      {
        id: 'nav-overview',
        group: 'Navigate',
        label: 'Go to Overview',
        hint: 'Your money snapshot',
        keywords: 'dashboard home',
        icon: LayoutDashboard,
        run: () => onNavigate('overview'),
      },
      {
        id: 'nav-transactions',
        group: 'Navigate',
        label: 'Go to Transactions',
        hint: 'Full local ledger',
        keywords: 'activity ledger records',
        icon: ArrowLeftRight,
        run: () => onNavigate('transactions'),
      },
      {
        id: 'nav-subscriptions',
        group: 'Navigate',
        label: 'Go to Subscriptions',
        hint: 'Recurring costs',
        keywords: 'recurring burn saas',
        icon: RefreshCw,
        run: () => onNavigate('subscriptions'),
      },
      {
        id: 'filter-all',
        group: 'Filters',
        label: 'Show all records',
        hint: 'Clear type filter',
        keywords: 'transactions everything',
        icon: ArrowLeftRight,
        run: () => onFilterType('all'),
      },
      {
        id: 'filter-expenses',
        group: 'Filters',
        label: 'Show expenses only',
        hint: 'One-time spending',
        keywords: 'transactions filter',
        icon: ReceiptText,
        run: () => onFilterType('expense'),
      },
      {
        id: 'filter-subscriptions',
        group: 'Filters',
        label: 'Show subscriptions only',
        hint: 'Recurring spending',
        keywords: 'transactions filter',
        icon: RefreshCw,
        run: () => onFilterType('subscription'),
      },
      {
        id: 'export-backup',
        group: 'Data',
        label: 'Export JSON backup',
        hint: 'Download your local data',
        keywords: 'save download backup export',
        icon: Download,
        run: onExport,
      },
    ],
    [onAddRecord, onNavigate, onExport, onFilterType],
  )

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const commands = baseCommands
      .filter((command) => commandMatches(command, normalizedQuery))
      .map((command) => ({ ...command, kind: 'command' }))

    if (!normalizedQuery) return commands

    const records = transactions
      .filter((record) => {
        const haystack = [
          record.title,
          record.category,
          record.type,
          record.billingCycle,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(normalizedQuery)
      })
      .slice(0, 5)
      .map((record) => {
        const category = getCategory(record.category)
        const Icon = category.icon
        return {
          id: `record-${record.id}`,
          kind: 'record',
          group: 'Records',
          label: record.title,
          hint: `${record.category} · ${formatCurrency(record.amount)}`,
          keywords: `${record.category} ${record.type}`,
          icon: Icon,
          run: () => onFindRecord(record),
        }
      })

    return [...records, ...commands]
  }, [baseCommands, onFindRecord, query, transactions])

  const groupedResults = useMemo(() => {
    const groups = new Map()
    results.forEach((command, index) => {
      if (!groups.has(command.group)) {
        groups.set(command.group, [])
      }
      groups.get(command.group).push({ ...command, flatIndex: index })
    })
    return [...groups.entries()]
  }, [results])

  useEffect(() => {
    if (!open) return
    // Capture the trigger before moving focus into the palette. Doing this in
    // an effect (rather than relying on autoFocus) keeps the previous element
    // available so it can be restored when the palette closes.
    restoreFocusRef.current = document.activeElement
    inputRef.current?.focus()
    return () => {
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus()
      }
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const activeElement = listRef.current?.querySelector(
      `[data-command-index="${selectedIndex}"]`,
    )
    activeElement?.scrollIntoView({ block: 'nearest' })
  }, [open, selectedIndex])

  if (!open) return null

  const selectedCommand = results[selectedIndex]

  function execute(command) {
    onClose()
    command.run()
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (results.length) {
        setSelectedIndex((current) => (current + 1) % results.length)
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length) {
        setSelectedIndex(
          (current) => (current - 1 + results.length) % results.length,
        )
      }
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (selectedCommand) execute(selectedCommand)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-black/65 px-3 pt-[10vh] backdrop-blur-sm sm:px-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        className="animate-palette-in w-full max-w-[600px] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0b0f15] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.98)]"
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        onKeyDown={(event) => {
          // Keep keyboard focus inside the palette. The listbox is driven by
          // arrow keys, so Tab should not move focus to the page behind it.
          if (event.key === 'Tab') {
            event.preventDefault()
            inputRef.current?.focus()
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5">
          <Search size={16} className="flex-none text-fog" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, records, or jump to..."
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-white outline-none placeholder:text-ghost"
            role="combobox"
            aria-expanded="true"
            aria-haspopup="listbox"
            aria-controls="command-results"
            aria-autocomplete="list"
            aria-activedescendant={
              selectedCommand ? `command-${selectedCommand.id}` : undefined
            }
          />
          <kbd className="kbd flex-none">esc</kbd>
        </div>

        <div
          ref={listRef}
          id="command-results"
          className="scrollbar-thin max-h-[420px] overflow-y-auto p-2"
          role="listbox"
          aria-label="Command results"
        >
          {groupedResults.length > 0 ? (
            groupedResults.map(([group, commands]) => (
              <div key={group} className="mb-1.5 last:mb-0">
                <p className="px-2.5 pb-1.5 pt-2 text-[8.5px] font-bold uppercase tracking-[0.17em] text-ghost">
                  {group}
                </p>
                {commands.map((command) => {
                  const Icon = command.icon
                  const isSelected = command.flatIndex === selectedIndex
                  return (
                    <button
                      key={command.id}
                      id={`command-${command.id}`}
                      type="button"
                      tabIndex={-1}
                      data-command-index={command.flatIndex}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setSelectedIndex(command.flatIndex)}
                      onClick={() => execute(command)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${
                        isSelected
                          ? 'bg-white/[0.065]'
                          : 'hover:bg-white/[0.035]'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg border ${
                          isSelected
                            ? 'border-lime/10 bg-lime/[0.07] text-lime'
                            : 'border-white/[0.05] bg-white/[0.025] text-fog'
                        }`}
                      >
                        <Icon size={13} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11.5px] font-medium text-[#e8edf3]">
                          {command.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[9px] text-ghost">
                          {command.hint}
                        </span>
                      </span>
                      {isSelected ? (
                        <CornerDownLeft size={12} className="flex-none text-fog" />
                      ) : (
                        <ArrowRight
                          size={12}
                          className="flex-none text-ghost opacity-0"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.035] text-fog">
                <Search size={16} />
              </span>
              <p className="mt-3 text-xs font-semibold text-white">
                No matches found
              </p>
              <p className="mt-1 text-[10px] text-fog">
                Try a different title, category, or command.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-white/[0.012] px-4 py-2.5">
          <div className="flex items-center gap-3 text-[8.5px] text-ghost">
            <span className="flex items-center gap-1">
              <kbd className="kbd">↑</kbd>
              <kbd className="kbd">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="kbd">↵</kbd>
              select
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[8.5px] text-ghost">
            <span className="status-dot" />
            Local search
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
