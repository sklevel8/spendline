import { CalendarRange } from 'lucide-react'

const OPTIONS = [
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '12m', label: '12M' },
]

export default function PeriodSelector({ period, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ghost sm:flex">
        <CalendarRange size={12} />
        Range
      </span>
      <div
        className="flex items-center rounded-xl border border-white/[0.07] bg-white/[0.025] p-1"
        role="group"
        aria-label="Analytics period"
      >
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-2.5 py-1.5 font-mono text-[10px] font-medium transition ${
              period === option.value
                ? 'bg-white/[0.09] text-white shadow-sm'
                : 'text-fog hover:text-mist'
            }`}
            aria-pressed={period === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
