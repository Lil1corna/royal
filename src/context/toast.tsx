'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  type: ToastType
  message: string
}

type ToastContextValue = {
  toasts: Toast[]
  addToast: (type: ToastType, message: string, durationMs?: number) => void
  removeToast: (id: string) => void
}

const ToastCtx = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

let toastCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const addToast = useCallback((type: ToastType, message: string, durationMs = 3000) => {
    const id = `toast-${++toastCounter}`
    setToasts((prev) => [...prev.slice(-4), { id, type, message }])
    const timer = setTimeout(() => removeToast(id), durationMs)
    timersRef.current.set(id, timer)
  }, [removeToast])

  return (
    <ToastCtx.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md border cursor-pointer transition-all duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100'
              : toast.type === 'error'
                ? 'bg-red-500/20 border-red-400/30 text-red-100'
                : 'bg-white/10 border-white/20 text-white/90'
          }`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.type === 'success' && <span aria-hidden>✓ </span>}
          {toast.type === 'error' && <span aria-hidden>✕ </span>}
          {toast.message}
        </div>
      ))}
    </div>
  )
}
