import { cn } from '../../lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-slate-200/80 dark:bg-slate-700/50',
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_1.4s_ease-in-out_infinite] dark:via-white/15" />
    </div>
  )
}
