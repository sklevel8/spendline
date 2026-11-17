export function LogoMark({ size = 38 }) {
  return (
    <span
      className="logo-mark"
      style={{ width: size, height: size, borderRadius: size * 0.32 }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6.5 17.5V12.5"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M12 17.5V8"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M17.5 17.5V4.5"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function Wordmark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={compact ? 34 : 38} />
      <div className="leading-none">
        <div className="flex items-baseline">
          <span className="text-[19px] font-semibold tracking-[-0.045em] text-white">
            spendline
          </span>
          <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-lime" />
        </div>
        {!compact && (
          <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-fog">
            Local finance
          </p>
        )}
      </div>
    </div>
  )
}
