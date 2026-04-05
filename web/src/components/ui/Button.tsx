import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary: cn(
    'border border-cyan-400/40 bg-gradient-to-r from-sky-500/90 via-cyan-500/90 to-violet-500/90 text-white',
    'shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:shadow-[0_0_36px_rgba(167,139,250,0.45)]',
    'dark:from-sky-500 dark:via-cyan-500 dark:to-violet-600',
  ),
  secondary: cn(
    'border border-slate-300/80 bg-white/70 text-slate-800',
    'hover:border-cyan-400/50 hover:bg-white dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-100',
    'dark:hover:border-cyan-400/30',
  ),
  ghost: cn(
    'border border-transparent bg-transparent text-slate-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60',
  ),
  danger: cn(
    'border border-rose-400/40 bg-rose-500/90 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]',
  ),
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
  className?: string
  /** When set, renders a React Router `Link` instead of `button`. */
  to?: string
}

export function Button({
  variant = 'primary',
  className,
  children,
  type = 'button',
  to,
  ...props
}: ButtonProps) {
  const cls = cn(
    'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold',
    'transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-45',
    variants[variant],
    className,
  )

  const inner = (
    <>
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out hover:translate-x-full"
        aria-hidden
      />
      <span className="relative">{children}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    )
  }

  return (
    <button type={type} className={cls} {...props}>
      {inner}
    </button>
  )
}
