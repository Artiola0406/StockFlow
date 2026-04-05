import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-slate-300/80 bg-white/70 px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-300',
        'placeholder:text-slate-400',
        'focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)] focus:ring-0',
        'dark:border-slate-600/80 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500',
        'dark:focus:border-cyan-400 dark:focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]',
        className,
      )}
      {...props}
    />
  )
}

export function Label({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <label
      className={cn(
        'mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400',
        className,
      )}
    >
      {children}
    </label>
  )
}
