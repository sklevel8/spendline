import { Plus, Search, WifiOff } from 'lucide-react'
import { Wordmark } from './Logo'

const VIEW_LABELS = {
  overview: 'Overview',
  transactions: 'Transactions',
  subscriptions: 'Subscriptions',
}

export default function Topbar({
  view,
  onOpenPalette,
  onAddRecord,
  isOnline,
  shortcutLabel,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-canvas/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-9">
        <div className="lg:hidden">
          <Wordmark compact />
        </div>

        <div className="hidden items-center gap-2 text-xs lg:flex">
          <span className="text-ghost">Workspace</span>
          <span className="text-ghost/60">/</span>
          <span className="font-semibold text-white">{VIEW_LABELS[view]}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPalette}
            className="group flex h-9 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-2.5 text-[11px] text-fog transition hover:border-white/[0.13] hover:bg-white/[0.045] hover:text-mist sm:min-w-[210px] sm:px-3"
            aria-label="Open command menu"
          >
            <Search size={14} strokeWidth={1.8} />
            <span className="hidden flex-1 text-left sm:inline">
              Search or jump to...
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="kbd">{shortcutLabel}</kbd>
              <kbd className="kbd">K</kbd>
            </span>
          </button>

          <div
            className={`hidden h-9 items-center gap-2 rounded-xl border px-3 text-[10px] font-semibold sm:flex ${
              isOnline
                ? 'border-white/[0.07] bg-white/[0.025] text-fog'
                : 'border-amber/15 bg-amber/[0.06] text-amber'
            }`}
            title={
              isOnline
                ? 'Your data stays in this browser'
                : 'Offline — the app still works from local storage'
            }
          >
            {isOnline ? (
              <span className="status-dot" />
            ) : (
              <WifiOff size={11} />
            )}
            <span>{isOnline ? 'Local only' : 'Offline mode'}</span>
          </div>

          <button
            type="button"
            onClick={() => onAddRecord('expense')}
            className="btn-primary h-9 px-3 sm:px-3.5"
            aria-label="Add record"
          >
            <Plus size={15} strokeWidth={2.4} />
            <span className="hidden sm:inline">Add record</span>
          </button>
        </div>
      </div>
    </header>
  )
}
