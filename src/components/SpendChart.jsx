import { useId, useMemo, useState } from 'react'
import { ArrowUpRight, CircleDot } from 'lucide-react'
import { CURRENCY_SYMBOL, formatCurrency } from '../lib/format'

function buildSmoothPath(points) {
  if (!points.length) return ''
  return points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      const previous = points[index - 1]
      const deltaX = point.x - previous.x
      return `C ${previous.x + deltaX * 0.45} ${previous.y}, ${
        point.x - deltaX * 0.45
      } ${point.y}, ${point.x} ${point.y}`
    })
    .join(' ')
}

function axisLabelIndices(length) {
  if (length <= 5) return Array.from({ length }, (_, index) => index)
  return [
    ...new Set([
      0,
      Math.round(length * 0.25),
      Math.round(length * 0.5),
      Math.round(length * 0.75),
      length - 1,
    ]),
  ]
}

function formatAxisValue(value) {
  if (value >= 1000) {
    const thousands = value / 1000
    const label =
      thousands >= 10 ? Math.round(thousands) : Number(thousands.toFixed(1))
    return `${CURRENCY_SYMBOL}${String(label).replace('.', ',')}k`
  }
  return `${CURRENCY_SYMBOL}${Math.round(value)}`
}

export default function SpendChart({ series, periodLabel }) {
  const gradientId = useId().replace(/:/g, '')
  const [activeIndex, setActiveIndex] = useState(null)
  const { points, axisMax, total, average } = series

  const chartPoints = useMemo(
    () =>
      points.map((point, index) => ({
        ...point,
        x: points.length === 1 ? 50 : (index / (points.length - 1)) * 100,
        y: 100 - (point.value / axisMax) * 100,
      })),
    [points, axisMax],
  )

  const linePath = buildSmoothPath(chartPoints)
  const areaPath = linePath
    ? `${linePath} L 100 100 L 0 100 Z`
    : ''
  const labelIndices = axisLabelIndices(chartPoints.length)
  const activePoint =
    activeIndex !== null ? chartPoints[activeIndex] : null
  const yLabels = [axisMax, (axisMax * 2) / 3, axisMax / 3, 0]
  const hasData = total > 0

  function handlePointerMove(event) {
    if (!chartPoints.length) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(
      Math.max((event.clientX - bounds.left) / bounds.width, 0),
      1,
    )
    setActiveIndex(Math.round(ratio * (chartPoints.length - 1)))
  }

  function tooltipStyle(point) {
    const translateX = point.x < 14 ? 0 : point.x > 86 ? -100 : -50
    const showAbove = point.y > 30
    return {
      left: `${point.x}%`,
      top: `${point.y}%`,
      transform: `translate(${translateX}%, ${
        showAbove ? 'calc(-100% - 14px)' : '14px'
      })`,
    }
  }

  return (
    <section className="card flex h-full flex-col overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Cash flow</p>
            <span className="pill">
              <CircleDot size={8} className="text-lime" />
              All outflow
            </span>
          </div>
          <h2 className="mt-2 text-[16px] font-semibold tracking-[-0.02em] text-white">
            Spending rhythm
          </h2>
        </div>

        <div className="flex items-end gap-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ghost">
              Total outflow
            </p>
            <p className="mono-number mt-1 text-[17px] font-medium text-white">
              {formatCurrency(total)}
            </p>
          </div>
          <div className="border-l border-white/[0.07] pl-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ghost">
              Daily average
            </p>
            <p className="mono-number mt-1 text-[17px] font-medium text-mist">
              {formatCurrency(average)}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-7 min-h-[246px] flex-1">
        <div className="absolute inset-x-0 bottom-7 top-0 flex">
          <div className="flex w-11 flex-col justify-between pb-px pr-2.5 text-right font-mono text-[9px] text-ghost">
            {yLabels.map((value) => (
              <span
                key={value}
                className="-translate-y-1/2 first:translate-y-0 last:translate-y-0"
              >
                {formatAxisValue(value)}
              </span>
            ))}
          </div>

          <div
            className="relative flex-1 cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setActiveIndex(null)}
          >
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              {yLabels.map((value) => (
                <span
                  key={value}
                  className="block w-full border-t border-white/[0.045]"
                />
              ))}
            </div>

            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8F5A0" stopOpacity="0.2" />
                  <stop offset="60%" stopColor="#C8F5A0" stopOpacity="0.045" />
                  <stop offset="100%" stopColor="#C8F5A0" stopOpacity="0" />
                </linearGradient>
              </defs>
              {areaPath ? (
                <path
                  d={areaPath}
                  fill={`url(#${gradientId})`}
                  className="animate-fade-in"
                />
              ) : null}
              {linePath ? (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#C8F5A0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  pathLength="1"
                  className="chart-line"
                />
              ) : null}
            </svg>

            {activePoint ? (
              <>
                <span
                  className="pointer-events-none absolute top-0 z-10 h-full w-px bg-white/15"
                  style={{ left: `${activePoint.x}%` }}
                />
                <span
                  className="pointer-events-none absolute z-20 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0b0f15] bg-lime shadow-[0_0_0_4px_rgba(200,245,160,0.12)]"
                  style={{ left: `${activePoint.x}%`, top: `${activePoint.y}%` }}
                />
                <div
                  className="chart-tooltip absolute z-30 min-w-[120px] px-3 py-2"
                  style={tooltipStyle(activePoint)}
                >
                  <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-fog">
                    {activePoint.fullLabel}
                  </p>
                  <p className="mono-number mt-1 text-[13px] font-medium text-white">
                    {formatCurrency(activePoint.value)}
                  </p>
                </div>
              </>
            ) : null}

            {!hasData ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-xl border border-white/[0.07] bg-[#0b0f15]/80 px-4 py-3 text-center backdrop-blur-sm">
                  <p className="text-xs font-semibold text-white">
                    No outflow in this period
                  </p>
                  <p className="mt-1 text-[10px] text-fog">
                    Add a record to start the story.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="absolute bottom-0 left-11 right-0 h-5">
          {labelIndices.map((index) => {
            const point = chartPoints[index]
            const translate =
              point.x < 2 ? 'translateX(0)' : point.x > 98 ? 'translateX(-100%)' : 'translateX(-50%)'
            return (
              <span
                key={`${point.label}-${index}`}
                className="absolute top-0 whitespace-nowrap font-mono text-[9px] text-ghost"
                style={{ left: `${point.x}%`, transform: translate }}
              >
                {point.label}
              </span>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.055] pt-3.5">
        <p className="flex items-center gap-1.5 text-[10px] text-fog">
          <ArrowUpRight size={11} className="text-lime" />
          {periodLabel}
        </p>
        <p className="text-[10px] text-ghost">
          <span className="font-mono text-mist">{points.length}</span> data points
        </p>
      </div>
    </section>
  )
}
