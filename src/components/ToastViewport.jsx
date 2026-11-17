import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const TONES = {
  success: {
    icon: CheckCircle2,
    color: '#C8F5A0',
    background: 'rgba(200, 245, 160, 0.08)',
    border: 'rgba(200, 245, 160, 0.12)',
  },
  error: {
    icon: AlertTriangle,
    color: '#FB8398',
    background: 'rgba(251, 131, 152, 0.08)',
    border: 'rgba(251, 131, 152, 0.14)',
  },
  info: {
    icon: Info,
    color: '#B2B9FF',
    background: 'rgba(178, 185, 255, 0.08)',
    border: 'rgba(178, 185, 255, 0.12)',
  },
}

export default function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div
      className="pointer-events-none fixed bottom-20 right-3 z-[100] flex w-[calc(100%-24px)] max-w-[360px] flex-col gap-2 sm:bottom-5 sm:right-5"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone] ?? TONES.success
        const Icon = tone.icon
        return (
          <div
            key={toast.id}
            className="animate-fade-up pointer-events-auto flex items-start gap-3 rounded-2xl border bg-[#0b0f15]/96 p-3.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            style={{ borderColor: tone.border }}
            role={toast.tone === 'error' ? 'alert' : 'status'}
          >
            <span
              className="flex h-7 w-7 flex-none items-center justify-center rounded-lg"
              style={{ color: tone.color, background: tone.background }}
            >
              <Icon size={14} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-semibold text-white">
                {toast.title}
              </p>
              {toast.description ? (
                <p className="mt-0.5 text-[9.5px] leading-relaxed text-fog">
                  {toast.description}
                </p>
              ) : null}
              {toast.action ? (
                <button
                  type="button"
                  onClick={() => {
                    toast.action.onClick()
                    onDismiss(toast.id)
                  }}
                  className="mt-1.5 text-[9.5px] font-semibold text-lime hover:text-lime-strong"
                >
                  {toast.action.label}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="icon-button -mr-1 -mt-1 h-6 w-6"
              aria-label="Dismiss notification"
            >
              <X size={12} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
