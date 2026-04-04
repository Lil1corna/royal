'use client'

import { AnimatePresence, motion } from 'framer-motion'

export type ToastState = {
  type: 'success' | 'error'
  message: string
}

const toastVariants = {
  initial: { opacity: 0, x: 80, scale: 0.9 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: 80,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
}

export default function ToastMessage({ toast, className = 'mb-4' }: { toast: ToastState | null; className?: string }) {
  return (
    <AnimatePresence mode="popLayout">
      {toast ? (
        <motion.div
          key={toast.message}
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`${className} rounded-lg px-3 py-2 text-sm ${
            toast.type === 'success'
              ? 'border border-emerald-400/25 bg-emerald-500/15 text-emerald-100'
              : 'border border-red-400/25 bg-red-500/15 text-red-100'
          }`}
        >
          {toast.message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
