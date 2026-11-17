import { useCallback, useEffect, useRef, useState } from 'react'

function makeToastId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useToasts() {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismissToast = useCallback((id) => {
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    ({ title, description, tone = 'success', action }) => {
      const id = makeToastId()
      setToasts((current) => [...current.slice(-2), { id, title, description, tone, action }])
      const timeout = window.setTimeout(
        () => dismissToast(id),
        action ? 6500 : 4000,
      )
      timers.current.set(id, timeout)
      return id
    },
    [dismissToast],
  )

  useEffect(() => {
    const timerMap = timers.current
    return () => {
      timerMap.forEach((timer) => window.clearTimeout(timer))
      timerMap.clear()
    }
  }, [])

  return { toasts, pushToast, dismissToast }
}
