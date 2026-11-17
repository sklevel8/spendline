import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

const TONES = {
  lime: { color: '#C8F5A0', background: 'rgba(200, 245, 160, 0.09)' },
  lavender: { color: '#B2B9FF', background: 'rgba(178, 185, 255, 0.09)' },
  coral: { color: '#FB8398', background: 'rgba(251, 131, 152, 0.09)' },
  amber: { color: '#F6C56F', background: 'rgba(246, 197, 111, 0.09)' },
}

export default function StatCard({
  label,
  value,
  suffix,
  meta,
  icon: Icon,
  tone = 'lime',
  trend,
  className = '',
}) {
  const palette = TONES[tone] ?? TONES.lime
  const hasTrend = trend && Number.isFinite(trend.value)
  const trendIsUp = hasTrend && trend.value > 0
  const trendIsFlat = hasTrend && trend.value === 0
  const TrendIcon = trendIsFlat ? Minus : trendIsUp ? ArrowUpRight : ArrowDownRight
  const trendClass = trendIsFlat
    ? 'text-fog bg-white/[0.04] border-white/[0.06]'
    : trendIsUp
      ? 'text-coral bg-coral/[0.07] border-coral/10'
      : 'text-lime bg-lime/[0.07] border-lime/10'

  return (
    <article className={`card stat-card overflow-hidden p-5 ${className}`}>
      <div
        className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full blur-3xl"
        style={{ background: palette.background }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="pt-0.5 text-[11px] font-semibold text-fog">{label}</p>
        <span
          className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] border border-white/[0.06]"
          style={{ color: palette.color, background: palette.background }}
        >
          {Icon ? <Icon size={15} strokeWidth={1.9} /> : null}
        </span>
      </div>

      <div className="relative mt-4 flex items-baseline gap-1.5">
        <span className="metric-number text-[29px] font-semibold leading-none text-white">
          {value}
        </span>
        {suffix ? (
          <span className="text-[11px] font-medium text-fog">{suffix}</span>
        ) : null}
      </div>

      <div className="relative mt-3 flex min-h-[20px] flex-wrap items-center gap-x-2 gap-y-1.5">
        {hasTrend ? (
          <span
            className={`inline-flex h-5 items-center gap-1 rounded-md border px-1.5 font-mono text-[9px] font-medium ${trendClass}`}
          >
            <TrendIcon size={10} strokeWidth={2.2} />
            {Math.abs(trend.value).toFixed(1)}%
          </span>
        ) : null}
        <span className="text-[10px] leading-relaxed text-ghost">
          {hasTrend ? trend.label : meta}
        </span>
      </div>
    </article>
  )
}
