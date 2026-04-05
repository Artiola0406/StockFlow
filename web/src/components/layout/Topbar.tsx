import { useEffect, useState } from 'react'
import { Search, Sun, Moon, Sparkles } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useSearchQuery } from '../../context/SearchContext'
import { cn } from '../../lib/cn'

export function Topbar() {
  const { isDark, toggleTheme } = useTheme()
  const { query, setQuery } = useSearchQuery()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-20 mb-6 flex flex-col gap-4 rounded-2xl border p-4 backdrop-blur-xl transition-all duration-500 sm:flex-row sm:items-center sm:justify-between',
        'border-cyan-500/15 bg-white/50 shadow-lg shadow-slate-900/5 dark:border-cyan-400/20 dark:bg-slate-950/40 dark:shadow-black/30',
      )}
    >
      <div className="relative min-w-0 flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500/70 dark:text-cyan-400/80" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kërko në sistem…"
          className={cn(
            'w-full rounded-xl border border-slate-300/70 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all duration-300',
            'placeholder:text-slate-400 focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]',
            'dark:border-slate-600/70 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500',
            'dark:focus:border-cyan-400 dark:focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]',
          )}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-3 py-2 text-xs font-mono text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-100 md:flex">
          <Sparkles className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-300" />
          {now.toLocaleString('sq-AL')}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 hover:scale-105',
            'border-violet-400/30 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 text-violet-700 shadow-[0_0_16px_rgba(167,139,250,0.2)]',
            'dark:border-cyan-400/35 dark:from-cyan-500/20 dark:to-fuchsia-600/15 dark:text-cyan-100 dark:shadow-[0_0_20px_rgba(34,211,238,0.25)]',
          )}
          aria-label={isDark ? 'Aktivo modalitetin e çelët' : 'Aktivo modalitetin e errët'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold',
            'border-fuchsia-400/35 bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/15 text-fuchsia-900',
            'dark:border-fuchsia-400/40 dark:from-fuchsia-600/30 dark:to-cyan-500/20 dark:text-fuchsia-100 dark:shadow-[0_0_18px_rgba(232,121,249,0.25)]',
          )}
          title="Profili"
        >
          A
        </div>
      </div>
    </header>
  )
}
