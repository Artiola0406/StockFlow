import { useCallback, useEffect, useMemo, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Package, Euro, AlertTriangle, Tags, Plus, ArrowRightLeft, ClipboardList, BarChart3 } from 'lucide-react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { apiGet } from '../lib/api'
import { formatCurrency } from '../lib/format'
import type { ApiListResponse, Product } from '../types'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/cn'

const NEON = ['#22d3ee', '#a78bfa', '#f472b6', '#38bdf8', '#e879f9', '#2dd4bf']

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  hint?: string
  icon: typeof Package
  accent: 'cyan' | 'violet' | 'pink' | 'emerald'
}) {
  const ring = {
    cyan: 'from-cyan-500/20 to-sky-500/5 shadow-[0_0_24px_rgba(34,211,238,0.12)] dark:shadow-[0_0_32px_rgba(34,211,238,0.2)]',
    violet:
      'from-violet-500/20 to-fuchsia-500/5 shadow-[0_0_24px_rgba(167,139,250,0.12)] dark:shadow-[0_0_32px_rgba(167,139,250,0.2)]',
    pink: 'from-pink-500/20 to-rose-500/5 shadow-[0_0_24px_rgba(244,114,182,0.12)] dark:shadow-[0_0_32px_rgba(244,114,182,0.2)]',
    emerald:
      'from-emerald-500/20 to-teal-500/5 shadow-[0_0_24px_rgba(52,211,153,0.12)] dark:shadow-[0_0_32px_rgba(52,211,153,0.2)]',
  }
  return (
    <Card glow={accent === 'emerald' ? 'cyan' : accent} className="overflow-hidden">
      <div
        className={cn(
          'mb-3 flex items-center justify-between rounded-xl bg-gradient-to-br p-3',
          ring[accent],
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/40 dark:bg-slate-900/40">
          <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" strokeWidth={1.75} />
        </div>
        <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-200">
          Live
        </span>
      </div>
      <div className="font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</div>
      {hint && <div className="mt-2 text-xs text-cyan-600/80 dark:text-cyan-300/80">{hint}</div>}
    </Card>
  )
}

export function DashboardPage() {
  const { isDark } = useTheme()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [_error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGet<ApiListResponse<Product[]>>('/products')
      setProducts(res.data ?? [])
    } catch {
      setError(null)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => {
    const totalVal = products.reduce(
      (s, p) => s + parseFloat(String(p.price)) * parseInt(String(p.quantity), 10),
      0,
    )
    const low = products.filter((p) => parseInt(String(p.quantity), 10) < 5)
    const cats = new Set(products.map((p) => p.category))
    return {
      count: products.length,
      value: formatCurrency(totalVal),
      lowCount: low.length,
      low,
      catCount: cats.size,
    }
  }, [products])

  const chartData = useMemo(() => {
    const catData: Record<string, number> = {}
    products.forEach((p) => {
      catData[p.category] = (catData[p.category] || 0) + 1
    })
    return {
      labels: Object.keys(catData),
      datasets: [
        {
          data: Object.values(catData),
          backgroundColor: NEON,
          borderWidth: 2,
          borderColor: isDark ? '#0f172a' : '#f8fafc',
          hoverBorderColor: '#22d3ee',
          hoverOffset: 8,
        },
      ],
    }
  }, [products, isDark])

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' as const },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: isDark ? '#cbd5e1' : '#475569',
            padding: 16,
            font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' as const },
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
          titleColor: isDark ? '#e2e8f0' : '#0f172a',
          bodyColor: isDark ? '#94a3b8' : '#475569',
          borderColor: 'rgba(34,211,238,0.4)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          displayColors: true,
          boxPadding: 6,
        },
      },
      cutout: '62%',
    }),
    [isDark],
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Mirë se vini në StockFlow — kontroll neural i inventarit në kohë reale.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Produkte gjithsej"
            value={String(stats.count)}
            hint="Sipas API-s së produkteve"
            icon={Package}
            accent="cyan"
          />
          <StatCard
            label="Vlera totale"
            value={stats.value}
            hint="Çmimi × sasia"
            icon={Euro}
            accent="emerald"
          />
          <StatCard
            label="Stok i ulët"
            value={String(stats.lowCount)}
            hint="Më pak se 5 njësi"
            icon={AlertTriangle}
            accent="pink"
          />
          <StatCard
            label="Kategori"
            value={String(stats.catCount)}
            hint="Kategori unike"
            icon={Tags}
            accent="violet"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card glow="violet" className="min-h-[320px]">
          <CardTitle className="mb-4">Produktet sipas kategorisë</CardTitle>
          {loading ? (
            <Skeleton className="mx-auto h-52 w-52 rounded-full" />
          ) : products.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">Nuk ka produkte</p>
          ) : (
            <div className="h-56">
              <Doughnut key={String(isDark)} data={chartData} options={chartOptions} />
            </div>
          )}
        </Card>

        <Card glow="pink">
          <CardTitle className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-pink-500 dark:text-pink-300" />
            Stok i ulët
          </CardTitle>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : stats.low.length === 0 ? (
            <p className="py-10 text-center font-medium text-emerald-600 dark:text-emerald-400">
              Asnjë produkt me stok të ulët.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                    <th className="pb-3">Emri</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Sasia</th>
                    <th className="pb-3">Kategoria</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.low.map((p) => (
                    <tr
                      key={String(p.id)}
                      className="border-b border-slate-200/50 transition-colors hover:bg-cyan-500/5 dark:border-slate-700/50"
                    >
                      <td className="py-2.5 font-medium text-slate-800 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="py-2.5 font-mono text-xs text-slate-500">{p.sku}</td>
                      <td className="py-2.5">
                        <span className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                          {p.quantity}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">{p.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Veprime të shpejta</CardTitle>
        <div className="flex flex-wrap gap-3">
          <Button to="/products" variant="primary">
            <Plus className="h-4 w-4" />
            Shto produkt
          </Button>
          <Button to="/stockmovements" variant="secondary">
            <ArrowRightLeft className="h-4 w-4" />
            Lëvizjet e stokut
          </Button>
          <Button to="/orders" variant="secondary">
            <ClipboardList className="h-4 w-4" />
            Porositë
          </Button>
          <Button to="/reports" variant="secondary">
            <BarChart3 className="h-4 w-4" />
            Raportet
          </Button>
        </div>
      </Card>
    </div>
  )
}
