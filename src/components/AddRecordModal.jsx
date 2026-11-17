import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  CalendarDays,
  Check,
  ChevronDown,
  LockKeyhole,
  ReceiptText,
  RefreshCw,
  X,
} from 'lucide-react'
import { BILLING_CYCLES, CATEGORIES, getCategory } from '../data/categories'
import { toISODate } from '../lib/dates'
import { CURRENCY_SYMBOL, formatCurrency } from '../lib/format'

const TYPE_OPTIONS = [
  {
    value: 'expense',
    label: 'Expense',
    description: 'One-time spend',
    icon: ReceiptText,
  },
  {
    value: 'subscription',
    label: 'Subscription',
    description: 'Recurring cost',
    icon: RefreshCw,
  },
]

export default function AddRecordModal({
  open,
  onClose,
  onSubmit,
  defaultType = 'expense',
}) {
  const [type, setType] = useState(defaultType)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Development')
  const [date, setDate] = useState(toISODate())
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogRef = useRef(null)
  const titleRef = useRef(null)
  const restoreFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement
    titleRef.current?.focus()
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus()
      }
    }
  }, [open, onClose])

  if (!open) return null

  const selectedCategory = getCategory(category)
  const CategoryIcon = selectedCategory.icon
  const numericAmount = Number(amount) || 0
  const monthlyEquivalent =
    billingCycle === 'yearly' ? numericAmount / 12 : numericAmount

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return
    if (!title.trim()) {
      setError('Give this record a title.')
      titleRef.current?.focus()
      return
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError('Enter an amount greater than zero.')
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        amount: Number(amount),
        category,
        type,
        date,
        ...(type === 'subscription' ? { billingCycle, active: true } : {}),
      })
      onClose()
    } catch (submitError) {
      console.error('Unable to save record from dialog', submitError)
      setError('Could not save this record. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-black/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="animate-modal-in relative w-full max-w-[520px] rounded-t-[24px] border border-white/[0.09] bg-[#0b0f15] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)] sm:rounded-[24px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-record-title"
      >
        <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-lime/50 to-transparent" />

        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-lime/10 bg-lime/[0.07] text-lime">
              <ReceiptText size={16} />
            </span>
            <div>
              <h2
                id="add-record-title"
                className="text-[15px] font-semibold tracking-[-0.02em] text-white"
              >
                Add a record
              </h2>
              <p className="mt-0.5 text-[9.5px] text-fog">
                Saved instantly to this device
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button -mr-1 -mt-1"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 px-5 py-5 sm:px-6"
          aria-busy={isSubmitting}
        >
          <div
            className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.07] bg-black/20 p-1"
            role="group"
            aria-label="Record type"
          >
            {TYPE_OPTIONS.map((option) => {
              const Icon = option.icon
              const active = type === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setType(option.value)
                    setError('')
                  }}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition ${
                    active
                      ? 'border-white/[0.09] bg-white/[0.065] shadow-sm'
                      : 'border-transparent text-fog hover:bg-white/[0.025] hover:text-mist'
                  }`}
                  aria-pressed={active}
                >
                  <span
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg ${
                      active
                        ? 'bg-lime/[0.09] text-lime'
                        : 'bg-white/[0.035] text-ghost'
                    }`}
                  >
                    <Icon size={13} />
                  </span>
                  <span>
                    <span
                      className={`block text-[11px] font-semibold ${
                        active ? 'text-white' : ''
                      }`}
                    >
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[8.5px] text-ghost">
                      {option.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div>
            <label
              htmlFor="record-title"
              className="mb-1.5 block text-[10px] font-semibold text-mist"
            >
              Title / description
            </label>
            <input
              ref={titleRef}
              id="record-title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                setError('')
              }}
              placeholder={
                type === 'subscription' ? 'e.g., GitHub Copilot' : 'e.g., Team dinner'
              }
              className="field"
              maxLength={80}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="record-amount"
                className="mb-1.5 block text-[10px] font-semibold text-mist"
              >
                Amount
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-ghost">
                  {CURRENCY_SYMBOL}
                </span>
                <input
                  id="record-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value)
                    setError('')
                  }}
                  placeholder="0.00"
                  className="field pl-7"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="record-date"
                className="mb-1.5 block text-[10px] font-semibold text-mist"
              >
                Date
              </label>
              <div className="relative">
                <CalendarDays
                  size={12}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ghost"
                />
                <input
                  id="record-date"
                  type="date"
                  value={date}
                  max={toISODate()}
                  onChange={(event) => setDate(event.target.value)}
                  className="field pl-8"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="record-category"
              className="mb-1.5 block text-[10px] font-semibold text-mist"
            >
              Category
            </label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded"
                style={{ color: selectedCategory.color, background: selectedCategory.soft }}
              >
                <CategoryIcon size={10} />
              </span>
              <select
                id="record-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="field appearance-none pl-9 pr-9"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ghost"
              />
            </div>
          </div>

          {type === 'subscription' ? (
            <div className="animate-fade-in rounded-xl border border-white/[0.06] bg-white/[0.018] p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-mist">
                    Billing cycle
                  </p>
                  <p className="mt-0.5 text-[8.5px] text-ghost">
                    Normalized for your monthly burn rate
                  </p>
                </div>
                <div
                  className="flex items-center rounded-lg border border-white/[0.07] bg-black/20 p-0.5"
                  role="group"
                  aria-label="Billing cycle"
                >
                  {BILLING_CYCLES.map((cycle) => (
                    <button
                      key={cycle.value}
                      type="button"
                      onClick={() => setBillingCycle(cycle.value)}
                      className={`rounded-md px-3 py-1.5 text-[9.5px] font-semibold transition ${
                        billingCycle === cycle.value
                          ? 'bg-white/[0.09] text-white'
                          : 'text-fog hover:text-mist'
                      }`}
                      aria-pressed={billingCycle === cycle.value}
                    >
                      {cycle.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-white/[0.055] pt-2.5">
                <span className="text-[9px] text-fog">Monthly equivalent</span>
                <span className="mono-number text-[10px] font-medium text-lime">
                  {formatCurrency(monthlyEquivalent)}/mo
                </span>
              </div>
            </div>
          ) : null}

          {error ? (
            <p
              className="rounded-lg border border-coral/15 bg-coral/[0.06] px-3 py-2 text-[10px] text-coral"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <span className="hidden items-center gap-1.5 text-[9px] text-ghost sm:flex">
              <LockKeyhole size={10} />
              IndexedDB · private
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                <Check size={14} strokeWidth={2.5} />
                {isSubmitting
                  ? 'Saving...'
                  : `Add ${type === 'subscription' ? 'subscription' : 'expense'}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
