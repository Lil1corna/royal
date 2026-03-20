'use client'

export type ToastState = {
  type: 'success' | 'error'
  message: string
}

export default function ToastMessage({ toast, className = 'mb-4' }: { toast: ToastState | null; className?: string }) {
  if (!toast) return null

  return (
    <div
      className={`${className} rounded-lg px-3 py-2 text-sm ${
        toast.type === 'success'
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      {toast.message}
    </div>
  )
}
