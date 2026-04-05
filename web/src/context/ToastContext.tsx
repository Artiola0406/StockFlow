import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../lib/cn'
import { useTheme } from './ThemeContext'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

type ToastItem = { id: number; message: string; type: ToastType }

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const stylesDark: Record<ToastType, string> = {
  success:
    'border-emerald-400/50 shadow-[0_0_28px_rgba(52,211,153,0.4)] bg-emerald-500/10 text-emerald-50',
  error:
    'border-rose-400/50 shadow-[0_0_28px_rgba(251,113,133,0.4)] bg-rose-500/10 text-rose-50',
  warning:
    'border-amber-400/50 shadow-[0_0_28px_rgba(251,191,36,0.35)] bg-amber-500/10 text-amber-50',
  info: 'border-cyan-400/50 shadow-[0_0_28px_rgba(34,211,238,0.45)] bg-cyan-500/10 text-cyan-50',
}

const stylesLight: Record<ToastType, string> = {
  success:
    'border-emerald-300/80 shadow-[0_0_20px_rgba(16,185,129,0.18)] bg-white/85 text-emerald-900',
  error:
    'border-rose-300/80 shadow-[0_0_20px_rgba(244,63,94,0.18)] bg-white/85 text-rose-900',
  warning:
    'border-amber-300/80 shadow-[0_0_20px_rgba(245,158,11,0.18)] bg-white/85 text-amber-950',
  info: 'border-cyan-300/80 shadow-[0_0_20px_rgba(6,182,212,0.2)] bg-white/85 text-cyan-950',
}

function ToastViewport({ items }: { items: ToastItem[] }) {
  const { isDark } = useTheme()
  return (
    <div
      className="pointer-events-none fixed right-4 top-20 z-[200] flex max-w-sm flex-col gap-2 sm:right-6 sm:top-24"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto"
          >
            <div
              className={cn(
                'relative overflow-hidden rounded-xl border px-4 py-3 text-sm font-semibold backdrop-blur-xl',
                isDark ? stylesDark[t.type] : stylesLight[t.type],
              )}
            >
              <motion.div
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/0 via-white/25 to-white/0"
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
              <span className="relative">{t.message}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, message, type }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 3800)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
