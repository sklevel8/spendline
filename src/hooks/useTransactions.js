import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'

function makeClientId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function sortTransactions(records) {
  return [...records].sort((a, b) => {
    const dateDifference = String(b.date).localeCompare(String(a.date))
    if (dateDifference !== 0) return dateDifference
    return String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
  })
}

export function useTransactions() {
  const rows = useLiveQuery(
    () => db.transactions.orderBy('date').reverse().toArray(),
    [],
  )
  const [pendingAdds, setPendingAdds] = useState([])
  const [hiddenIds, setHiddenIds] = useState(() => new Set())
  const [pendingUpdates, setPendingUpdates] = useState({})

  // Once a persisted row with the same clientId arrives, the optimistic copy
  // can be retired without a flash of missing data.
  useEffect(() => {
    if (!rows) return
    const persistedClientIds = new Set(
      rows.map((record) => record.clientId).filter(Boolean),
    )
    // oxlint-disable-next-line react/set-state-in-effect -- retire optimistic rows when IndexedDB confirms them
    setPendingAdds((current) => {
      const next = current.filter(
        (record) => !persistedClientIds.has(record.clientId),
      )
      return next.length === current.length ? current : next
    })
  }, [rows])

  // Keep an id hidden until IndexedDB confirms the delete. If the write fails,
  // the catch block restores it immediately.
  useEffect(() => {
    if (!rows) return
    const persistedIds = new Set(rows.map((record) => record.id))
    // oxlint-disable-next-line react/set-state-in-effect -- drop hidden ids once the delete is durable
    setHiddenIds((current) => {
      let changed = false
      const next = new Set()
      current.forEach((id) => {
        if (persistedIds.has(id)) {
          next.add(id)
        } else {
          changed = true
        }
      })
      return changed ? next : current
    })
  }, [rows])

  // Clear optimistic updates once the persisted value catches up.
  useEffect(() => {
    if (!rows) return
    // oxlint-disable-next-line react/set-state-in-effect -- clear overlays after a durable write lands
    setPendingUpdates((current) => {
      let changed = false
      const next = { ...current }
      Object.entries(current).forEach(([id, changes]) => {
        const record = rows.find((row) => String(row.id) === String(id))
        if (!record) {
          delete next[id]
          changed = true
          return
        }
        const isSynced = Object.entries(changes).every(
          ([key, value]) => record[key] === value,
        )
        if (isSynced) {
          delete next[id]
          changed = true
        }
      })
      return changed ? next : current
    })
  }, [rows])

  const transactions = useMemo(() => {
    const persisted = rows ?? []
    const persistedClientIds = new Set(
      persisted.map((record) => record.clientId).filter(Boolean),
    )

    const optimistic = pendingAdds.filter(
      (record) =>
        !persistedClientIds.has(record.clientId) && !hiddenIds.has(record.id),
    )

    const base = persisted
      .filter((record) => !hiddenIds.has(record.id))
      .map((record) =>
        pendingUpdates[record.id]
          ? { ...record, ...pendingUpdates[record.id] }
          : record,
      )

    return sortTransactions([...optimistic, ...base])
  }, [rows, pendingAdds, hiddenIds, pendingUpdates])

  const addTransaction = useCallback(async (input) => {
    const clientId = makeClientId()
    const now = new Date().toISOString()
    const payload = {
      title: input.title.trim(),
      amount: Number(input.amount),
      category: input.category,
      type: input.type,
      date: input.date,
      clientId,
      createdAt: now,
      ...(input.type === 'subscription'
        ? {
            billingCycle: input.billingCycle ?? 'monthly',
            active: input.active ?? true,
          }
        : {}),
    }

    const optimisticRecord = {
      ...payload,
      id: `optimistic-${clientId}`,
    }

    setPendingAdds((current) => [optimisticRecord, ...current])

    try {
      return await db.transactions.add(payload)
    } catch (error) {
      setPendingAdds((current) =>
        current.filter((record) => record.clientId !== clientId),
      )
      throw error
    }
  }, [])

  const deleteTransaction = useCallback(async (record) => {
    if (String(record.id).startsWith('optimistic-')) {
      setPendingAdds((current) =>
        current.filter((item) => item.id !== record.id),
      )
      return
    }

    setHiddenIds((current) => new Set(current).add(record.id))

    try {
      await db.transactions.delete(record.id)
    } catch (error) {
      setHiddenIds((current) => {
        const next = new Set(current)
        next.delete(record.id)
        return next
      })
      throw error
    }
  }, [])

  const updateTransaction = useCallback(async (id, changes) => {
    setPendingUpdates((current) => ({
      ...current,
      [id]: { ...(current[id] ?? {}), ...changes },
    }))

    try {
      await db.transactions.update(id, changes)
    } catch (error) {
      setPendingUpdates((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
      throw error
    }
  }, [])

  const restoreTransaction = useCallback(async (record) => {
    return db.transactions.put(record)
  }, [])

  return {
    transactions,
    isLoaded: rows !== undefined,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    restoreTransaction,
  }
}
