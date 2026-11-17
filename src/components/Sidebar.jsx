import {
  ArrowLeftRight,
  CircleHelp,
  Command,
  LayoutDashboard,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react'
import { Wordmark } from './Logo'

const NAVIGATION = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw },
]

export default function Sidebar({
  view,
  onNavigate,
  onAddRecord,
  onOpenPalette,
  isOnline,
  shortcutLabel,
}) {
  return (
    <aside className="scrollbar-thin fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col overflow-y-auto border-r border-white/[0.065] bg-[#080b10]/95 px-4 py-5 backdrop-blur-xl lg:flex">
      <div className="px-2">
        <Wordmark />
      </div>

      <button
        type="button"
        onClick={onOpenPalette}
        className="mt-7 flex w-full items-center gap-2.5 rounded-xl border border-white/[0.075] bg-white/[0.025] px-3 py-2.5 text-left text-xs text-fog transition hover:border-white/[0.12] hover:bg-white/[0.045] hover:text-mist"
      >
        <Search size={14} strokeWidth={1.8} className="flex-none" />
        <span className="min-w-0 flex-1 truncate">Search or jump to...</span>
        <span className="flex flex-none items-center gap-1">
          <kbd className="kbd">{shortcutLabel}</kbd>
          <kbd className="kbd">K</kbd>
        </span>
      </button>

      <div className="mt-7 flex-1">
        <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-ghost">
          Workspace
        </p>
        <nav className="space-y-1" aria-label="Primary navigation">
          {NAVIGATION.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className="nav-item"
                data-active={view === item.id}
                aria-current={view === item.id ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => onAddRecord('expense')}
          className="btn-primary mt-4 w-full py-2.5"
        >
          <Plus size={15} strokeWidth={2.4} />
          Add record
        </button>

        <p className="mb-2 mt-8 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-ghost">
          Shortcuts
        </p>
        <button
          type="button"
          onClick={onOpenPalette}
          className="nav-item"
        >
          <Command size={16} strokeWidth={1.8} className="flex-none" />
          <span className="min-w-0 flex-1 truncate">Command menu</span>
          <span className="ml-auto flex flex-none items-center gap-1">
            <kbd className="kbd">{shortcutLabel}</kbd>
            <kbd className="kbd">K</kbd>
          </span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-white">
              Local database
            </span>
            <span className="status-dot" />
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-fog">
            IndexedDB · stored on this device
          </p>
          <div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.06] pt-2.5 text-[9px] font-medium uppercase tracking-[0.12em] text-ghost">
            <LockKeyhole size={10} />
            {isOnline ? 'Offline ready' : 'Working offline'}
          </div>
        </div>

        <div className="flex items-center justify-between px-2 text-[10px] text-ghost">
          <span className="flex items-center gap-1.5">
            <CircleHelp size={11} />
            Private by design
          </span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  )
}
