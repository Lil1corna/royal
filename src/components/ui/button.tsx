'use client'

import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'

type ButtonVariant = 'primary' | 'outline' | 'ghost'
type ButtonSize = 'md' | 'lg'

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children?: React.ReactNode
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

// Styles from src/styles/design-system.css — no Tailwind color classes here
const dsClass: Record<ButtonVariant, string> = {
  primary: 'ds-btn-primary',
  outline: 'ds-btn-secondary',
  ghost: 'ds-btn-ghost',
}

const sizeClass: Record<ButtonSize, string> = {
  md: 'min-h-[44px] px-4 py-2.5 text-sm',
  lg: 'min-h-[52px] px-5 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref
) {
  const lowPower = useLowPowerMotion()
  const motionProps = lowPower
    ? {}
    : variant === 'primary'
      ? { whileHover: { y: -2 }, whileTap: { scale: 0.97 } }
      : { whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } }

  const loaderClass =
    variant === 'primary'
      ? 'h-4 w-4 animate-spin text-[#050d1a]'
      : 'h-4 w-4 animate-spin text-amber-300'

  return (
    <motion.button
      ref={ref}
      {...motionProps}
      type={props.type ?? 'button'}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        dsClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className={loaderClass} />}
      <span>{loading ? '...' : children}</span>
    </motion.button>
  )
})
