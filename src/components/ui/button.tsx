'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  loading?: boolean
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-neutral-900 text-white border border-neutral-800 hover:bg-neutral-700 hover:border-neutral-700',
  outline:
    'bg-transparent text-white border border-white/25 hover:bg-white hover:text-neutral-900 hover:border-white',
  ghost: 'bg-transparent text-white border border-transparent hover:bg-white/10',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading = false, disabled, className, children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      type={props.type ?? 'button'}
      disabled={disabled || loading}
      className={cn(
        'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold',
        'motion-safe:transition-transform motion-safe:transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050d1a]',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClass[variant],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{loading ? 'Загрузка...' : children}</span>
    </motion.button>
  )
})
