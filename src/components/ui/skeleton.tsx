type SkeletonProps = {
  className?: string
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-white/10',
        'after:absolute after:inset-0',
        'after:bg-gradient-to-r after:from-transparent',
        'after:via-white/20 after:to-transparent',
        'after:animate-[shimmer_1.5s_infinite]',
        className
      )}
    />
  )
}
