import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, Sparkles } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useSearchQuery } from '../../context/SearchContext'
import { apiGet } from '../../lib/api'
import { cn } from '../../lib/cn'

type SearchHitType = 'produkt' | 'klient' | 'furnitor' | 'depo'

interface SearchHit {
  id: string
  name: string
  type: SearchHitType
  subtitle: string | null
}

interface SearchApiResponse {
  results?: SearchHit[]
}

function typeIcon(t: SearchHitType) {
  switch (t) {
    case 'produkt':
      return '📦'
    case 'klient':
      return '👤'
    case 'furnitor':
      return '🏭'
    case 'depo':
      return '🏪'
    default:
      return '•'
  }
}

function typeBadgeClass(t: SearchHitType) {
  switch (t) {
    case 'produkt':
      return 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
    case 'klient':
      return 'border-violet-400/50 bg-violet-500/15 text-violet-200'
    case 'furnitor':
      return 'border-amber-400/50 bg-amber-500/15 text-amber-200'
    case 'depo':
      return 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
    default:
      return 'border-slate-500/40 bg-slate-500/10 text-slate-300'
  }
}

function routeForType(t: SearchHitType): string {
  switch (t) {
    case 'produkt':
      return '/products'
    case 'klient':
      return '/customers'
    case 'furnitor':
      return '/suppliers'
    case 'depo':
      return '/warehouses'
    default:
      return '/'
  }
}

export function Topbar() {
  const { isDark, toggleTheme } = useTheme()
  const { query, setQuery } = useSearchQuery()
  const navigate = useNavigate()
  const [results, setResults] = useState<SearchHit[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([])
      setShowDropdown(false)
      return
    }
    const timer = window.setTimeout(async () => {
      setShowDropdown(true)
      try {
        setLoading(true)
        const data = await apiGet<SearchApiResponse>(
          `/search?q=${encodeURIComponent(query)}`,
        )
        setResults(data.results ?? [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const el = e.target as Node
      if (!el || !(el instanceof Element)) return
      if (!el.closest('.search-container')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handlePick(hit: SearchHit) {
    navigate(routeForType(hit.type))
    setShowDropdown(false)
    setQuery('')
    setResults([])
  }

  const showEmpty = !loading && query.trim().length > 0 && results.length === 0 && showDropdown

  return (
    <header
      className={cn(
        'sticky top-0 z-20 mb-6 flex flex-col gap-4 rounded-2xl border p-4 backdrop-blur-xl transition-all duration-500 sm:flex-row sm:items-center sm:justify-between',
        'border-cyan-500/15 bg-white/50 shadow-lg shadow-slate-900/5 dark:border-cyan-400/20 dark:bg-slate-950/40 dark:shadow-black/30',
      )}
    >
      <div className="search-container relative min-w-0 flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-cyan-500/70 dark:text-cyan-400/80" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length > 0) setShowDropdown(true)
          }}
          autoComplete="off"
          placeholder="Kërko në sistem…"
          className={cn(
            'w-full rounded-xl border border-slate-300/70 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all duration-300',
            'placeholder:text-slate-400 focus:border-cyan-400 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]',
            'dark:border-slate-600/70 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500',
            'dark:focus:border-cyan-400 dark:focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]',
          )}
        />

        {showDropdown && query.trim().length > 0 && (
          <div
            className={cn(
              'absolute left-0 right-0 top-[calc(100%+6px)] z-[100] max-h-[400px] overflow-y-auto rounded-xl border border-cyan-400/40 bg-[#0f172a] shadow-[0_0_24px_rgba(34,211,238,0.12)]',
            )}
            style={{ animation: 'topbarSearchFade 0.2s ease-out' }}
          >
            <style>{`
              @keyframes topbarSearchFade {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            {loading && (
              <div className="px-4 py-3 text-sm text-cyan-200/90">Duke kërkuar…</div>
            )}
            {!loading &&
              results.map((hit) => (
                <button
                  key={`${hit.type}-${hit.id}`}
                  type="button"
                  onClick={() => handlePick(hit)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-cyan-500/10 px-4 py-3 text-left transition-colors last:border-0',
                    'hover:bg-cyan-500/10 hover:shadow-[inset_0_0_20px_rgba(34,211,238,0.08)]',
                  )}
                >
                  <span className="mt-0.5 text-lg leading-none" aria-hidden>
                    {typeIcon(hit.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-100">{hit.name}</div>
                    {hit.subtitle ? (
                      <div className="truncate text-xs text-slate-400">{hit.subtitle}</div>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      typeBadgeClass(hit.type),
                    )}
                  >
                    {hit.type}
                  </span>
                </button>
              ))}
            {showEmpty && (
              <div className="px-4 py-3 text-sm text-slate-400">Nuk u gjet asgjë</div>
            )}
          </div>
        )}
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
