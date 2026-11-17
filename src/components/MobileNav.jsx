import { ArrowLeftRight, LayoutDashboard, Plus, RefreshCw } from 'lucide-react'

const ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Activity', icon: ArrowLeftRight },
  { id: 'subscriptions', label: 'Recurring', icon: RefreshCw },
]

export default function MobileNav({ view, onNavigate, onAddRecord }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#080b10]/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center px-2">
        {ITEMS.slice(0, 2).map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 text-[9px] font-semibold transition ${
                view === item.id ? 'text-lime' : 'text-fog hover:text-mist'
              }`}
              aria-current={view === item.id ? 'page' : undefined}
            >
              <Icon size={18} strokeWidth={view === item.id ? 2.2 : 1.8} />
              {item.label}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => onAddRecord('expense')}
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-lime text-[#0a0d12] shadow-[0_10px_28px_-12px_rgba(200,245,160,0.8)] transition active:scale-95"
          aria-label="Add a record"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('subscriptions')}
          className={`flex flex-col items-center justify-center gap-1 text-[9px] font-semibold transition ${
            view === 'subscriptions' ? 'text-lime' : 'text-fog hover:text-mist'
          }`}
          aria-current={view === 'subscriptions' ? 'page' : undefined}
        >
          <RefreshCw
            size={18}
            strokeWidth={view === 'subscriptions' ? 2.2 : 1.8}
          />
          Recurring
        </button>
      </div>
    </nav>
  )
}
