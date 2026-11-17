import { useCallback, useEffect, useMemo, useState } from 'react'
import AddRecordModal from './components/AddRecordModal'
import CommandPalette from './components/CommandPalette'
import MobileNav from './components/MobileNav'
import Overview from './components/Overview'
import Sidebar from './components/Sidebar'
import SubscriptionsView from './components/SubscriptionsView'
import ToastViewport from './components/ToastViewport'
import Topbar from './components/Topbar'
import TransactionsView from './components/TransactionsView'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useToasts } from './hooks/useToasts'
import { useTransactions } from './hooks/useTransactions'
import { toISODate } from './lib/dates'
import { formatCurrency } from './lib/format'

const VIEW_TITLES = {
  overview: 'Overview',
  transactions: 'Transactions',
  subscriptions: 'Subscriptions',
}

function getShortcutLabel() {
  if (typeof navigator === 'undefined') return 'Ctrl'
  const platform =
    navigator.userAgentData?.platform ??
    navigator.platform ??
    navigator.userAgent ??
    ''
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? '⌘' : 'Ctrl'
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-[188px] rounded-[26px]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="skeleton h-[152px] rounded-[22px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,0.8fr)]">
        <div className="skeleton h-[430px] rounded-[22px]" />
        <div className="skeleton h-[430px] rounded-[22px]" />
      </div>
    </div>
  )
}

export default function App() {
  const {
    transactions,
    isLoaded,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    restoreTransaction,
  } = useTransactions()
  const { toasts, pushToast, dismissToast } = useToasts()
  const isOnline = useOnlineStatus()
  const shortcutLabel = useMemo(() => getShortcutLabel(), [])

  const [view, setView] = useState('overview')
  const [period, setPeriod] = useState('30d')
  const [commandOpen, setCommandOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addType, setAddType] = useState('expense')
  const [filters, setFilters] = useState({
    query: '',
    type: 'all',
    category: 'all',
  })

  const navigate = useCallback((nextView) => {
    setView(nextView)
    setCommandOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const openAddRecord = useCallback((type = 'expense') => {
    setCommandOpen(false)
    setAddType(type === 'subscription' ? 'subscription' : 'expense')
    setAddOpen(true)
  }, [])

  const closeAddRecord = useCallback(() => setAddOpen(false), [])

  const handleAddRecord = useCallback(
    async (payload) => {
      try {
        await addTransaction(payload)
        pushToast({
          title:
            payload.type === 'subscription'
              ? 'Subscription added'
              : 'Expense added',
          description: `${payload.title} · ${formatCurrency(payload.amount)} saved locally.`,
        })
      } catch (error) {
        console.error('Unable to add record', error)
        pushToast({
          title: 'Could not save record',
          description: 'The optimistic change was rolled back. Please try again.',
          tone: 'error',
        })
        // Let the dialog keep the entered values and show an inline error
        // instead of closing as if the write succeeded.
        throw error
      }
    },
    [addTransaction, pushToast],
  )

  const handleDeleteRecord = useCallback(
    async (record) => {
      const rawRecord = transactions.find((item) => item.id === record.id) ?? record
      const snapshot = { ...rawRecord }
      const isOptimistic = String(record.id).startsWith('optimistic-')

      try {
        await deleteTransaction(rawRecord)
        pushToast({
          title: 'Record deleted',
          description: snapshot.title,
          tone: 'info',
          action: isOptimistic
            ? undefined
            : {
                label: 'Undo',
                onClick: async () => {
                  try {
                    await restoreTransaction(snapshot)
                    pushToast({
                      title: 'Record restored',
                      description: snapshot.title,
                    })
                  } catch (error) {
                    console.error('Unable to restore record', error)
                    pushToast({
                      title: 'Could not restore record',
                      tone: 'error',
                    })
                  }
                },
              },
        })
      } catch (error) {
        console.error('Unable to delete record', error)
        pushToast({
          title: 'Could not delete record',
          description: 'Your data was left untouched.',
          tone: 'error',
        })
      }
    },
    [deleteTransaction, pushToast, restoreTransaction, transactions],
  )

  const handleToggleSubscription = useCallback(
    async (subscription) => {
      const nextActive = subscription.active === false
      try {
        await updateTransaction(subscription.id, { active: nextActive })
        pushToast({
          title: nextActive ? 'Subscription resumed' : 'Subscription paused',
          description: `${subscription.title} ${
            nextActive ? 'is back in your burn rate.' : 'is excluded from burn rate.'
          }`,
          tone: 'info',
        })
      } catch (error) {
        console.error('Unable to update subscription', error)
        pushToast({
          title: 'Could not update subscription',
          description: 'Your change was rolled back.',
          tone: 'error',
        })
      }
    },
    [pushToast, updateTransaction],
  )

  const handleExport = useCallback(() => {
    const backup = {
      app: 'Spendline',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      transactions,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `spendline-backup-${toISODate()}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    pushToast({
      title: 'Backup downloaded',
      description: `${transactions.length} records exported as JSON.`,
      tone: 'info',
    })
  }, [pushToast, transactions])

  const handleFindRecord = useCallback((record) => {
    setFilters({ query: record.title, type: 'all', category: 'all' })
    setView('transactions')
    setCommandOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleFilterType = useCallback((type) => {
    setFilters({ query: '', type, category: 'all' })
    setView('transactions')
    setCommandOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    document.title = `${VIEW_TITLES[view]} · Spendline`
  }, [view])

  useEffect(() => {
    function handleKeyDown(event) {
      const isShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (isShortcut) {
        event.preventDefault()
        setAddOpen(false)
        setCommandOpen((current) => !current)
        return
      }

      if (event.key === 'Escape') {
        if (commandOpen) setCommandOpen(false)
        if (addOpen) setAddOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [addOpen, commandOpen])

  useEffect(() => {
    if (!addOpen && !commandOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [addOpen, commandOpen])

  return (
    <div className="min-h-screen">
      <Sidebar
        view={view}
        onNavigate={navigate}
        onAddRecord={openAddRecord}
        onOpenPalette={() => setCommandOpen(true)}
        isOnline={isOnline}
        shortcutLabel={shortcutLabel}
      />

      <div className="lg:pl-[264px]">
        <Topbar
          view={view}
          onOpenPalette={() => setCommandOpen(true)}
          onAddRecord={openAddRecord}
          isOnline={isOnline}
          shortcutLabel={shortcutLabel}
        />

        <main className="mx-auto max-w-[1500px] px-4 pb-24 pt-5 sm:px-6 lg:px-9 lg:pb-10 lg:pt-7">
          {!isLoaded ? (
            <DashboardSkeleton />
          ) : (
            <div key={view} className="animate-fade-in">
              {view === 'overview' ? (
                <Overview
                  transactions={transactions}
                  period={period}
                  onPeriodChange={setPeriod}
                  onNavigate={navigate}
                  onAddRecord={openAddRecord}
                  onDelete={handleDeleteRecord}
                />
              ) : null}

              {view === 'transactions' ? (
                <TransactionsView
                  transactions={transactions}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onAddRecord={openAddRecord}
                  onDelete={handleDeleteRecord}
                  onExport={handleExport}
                />
              ) : null}

              {view === 'subscriptions' ? (
                <SubscriptionsView
                  transactions={transactions}
                  onAddRecord={openAddRecord}
                  onToggle={handleToggleSubscription}
                  onDelete={handleDeleteRecord}
                />
              ) : null}
            </div>
          )}
        </main>
      </div>

      <MobileNav
        view={view}
        onNavigate={navigate}
        onAddRecord={openAddRecord}
      />

      <CommandPalette
        key={commandOpen ? 'palette-open' : 'palette-closed'}
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        transactions={transactions}
        onNavigate={navigate}
        onAddRecord={openAddRecord}
        onExport={handleExport}
        onFilterType={handleFilterType}
        onFindRecord={handleFindRecord}
      />

      {addOpen ? (
        <AddRecordModal
          open
          onClose={closeAddRecord}
          onSubmit={handleAddRecord}
          defaultType={addType}
        />
      ) : null}

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
