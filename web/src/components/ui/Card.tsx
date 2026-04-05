import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type CardProps = {
  children: ReactNode
  className?: string
  glow?: 'cyan' | 'violet' | 'pink' | 'none'
  padding?: boolean
}

const glowRing: Record<NonNullable<CardProps['glow']>, string> = {
  cyan: 'hover:shadow-[0_0_32px_rgba(34,211,238,0.2)] dark:hover:shadow-[0_0_40px_rgba(34,211,238,0.35)]',
  violet:
    'hover:shadow-[0_0_32px_rgba(167,139,250,0.2)] dark:hover:shadow-[0_0_40px_rgba(167,139,250,0.35)]',
  pink: 'hover:shadow-[0_0_32px_rgba(244,114,182,0.2)] dark:hover:shadow-[0_0_40px_rgba(244,114,182,0.35)]',
  none: '',
}

export function Card({ children, className, glow = 'cyan', padding = true }: CardProps) {
  return (
    <div
      className={cn(
        'group relative rounded-2xl border transition-all duration-500 ease-out',
        'border-cyan-500/15 bg-white/55 shadow-lg shadow-slate-900/5 backdrop-blur-xl',
        'dark:border-cyan-400/20 dark:bg-slate-900/45 dark:shadow-black/40',
        'hover:-translate-y-0.5 hover:border-cyan-400/35 dark:hover:border-cyan-300/40',
        glow !== 'none' && glowRing[glow],
        padding && 'p-5 sm:p-6',
        className,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          'bg-gradient-to-br from-cyan-400/5 via-transparent to-fuchsia-500/5',
          'dark:from-cyan-400/10 dark:to-fuchsia-500/10',
        )}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold tracking-tight text-slate-800 dark:text-white',
        className,
      )}
    >
      {children}
    </h2>
  )
}
