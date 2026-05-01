import { useMemo } from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Card, CardTitle } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { useProductStats } from '../hooks/useProductStats'
import { formatCurrency } from '../lib/format'
import type { Product } from '../types'
import { useTheme } from '../context/ThemeContext'
import type { TooltipItem } from 'chart.js'

const NEON = ['#22d3ee', '#a78bfa', '#f472b6', '#38bdf8', '#e879f9', '#2dd4bf']

export function ReportsPage() {
  const { isDark } = useTheme()
  const { products, loading, error } = useProductStats()

  const analytics = useMemo(() => {
    const totalVal = products.reduce(
      (s, p) => s + parseFloat(String(p.price)) * parseInt(String(p.quantity), 10),
      0,
    )
    const expensive = products.reduce(
      (max, p) => (parseFloat(String(p.price)) > parseFloat(String(max?.price ?? 0)) ? p : max),
      null as Product | null,
    )
    const catCount: Record<string, number> = {}
    products.forEach((p) => {
      catCount[p.category] = (catCount[p.category] || 0) + 1
    })
    const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]
    const low = products.filter((p) => parseInt(String(p.quantity), 10) < 5)

    const catVal: Record<string, { count: number; value: number }> = {}
    products.forEach((p) => {
      if (!catVal[p.category]) catVal[p.category] = { count: 0, value: 0 }
      catVal[p.category].count++
      catVal[p.category].value += parseFloat(String(p.price)) * parseInt(String(p.quantity), 10)
    })

    const top5 = [...products]
      .sort(
        (a, b) =>
          parseFloat(String(b.price)) * parseInt(String(b.quantity), 10) -
          parseFloat(String(a.price)) * parseInt(String(a.quantity), 10),
      )
      .slice(0, 5)

    return {
      totalVal,
      expensive,
      topCat: topCat?.[0] ?? null,
      low,
      catVal,
      top5,
    }
  }, [products])

  const catChartData = useMemo(
    () => ({
      labels: Object.keys(analytics.catVal),
      datasets: [
        {
          data: Object.values(analytics.catVal).map((v) => v.count),
          backgroundColor: NEON,
          borderWidth: 2,
          borderColor: isDark ? '#0f172a' : '#f8fafc',
          hoverOffset: 8,
        },
      ],
    }),
    [analytics.catVal, isDark],
  )

  const barData = useMemo(
    () => ({
      labels: analytics.top5.map((p) =>
        p.name.length > 14 ? `${p.name.slice(0, 14)}…` : p.name,
      ),
      datasets: [
        {
          label: 'Vlera (€)',
          data: analytics.top5.map(
            (p) => parseFloat(String(p.price)) * parseInt(String(p.quantity), 10),
          ),
          backgroundColor: analytics.top5.map((_, i) => NEON[i % NEON.length]),
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(34,211,238,0.35)' : 'rgba(56,189,248,0.5)',
        },
      ],
    }),
    [analytics.top5, isDark],
  )

  const chartOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' as const },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            color: isDark ? '#cbd5e1' : '#475569',
            font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' as const },
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
          titleColor: isDark ? '#e2e8f0' : '#0f172a',
          bodyColor: isDark ? '#94a3b8' : '#475569',
          borderColor: 'rgba(167,139,250,0.45)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
        },
      },
      cutout: '58%',
    }),
    [isDark],
  )

  const barOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' as const },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
          titleColor: isDark ? '#e2e8f0' : '#0f172a',
          bodyColor: isDark ? '#94a3b8' : '#475569',
          borderColor: 'rgba(34,211,238,0.45)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx: TooltipItem<'bar'>) => {
              const v = ctx.parsed.y
              return v == null ? '' : formatCurrency(v)
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { size: 10, weight: 'bold' as const } },
          grid: { color: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(100,116,139,0.12)' },
        },
        y: {
          ticks: { color: isDark ? '#94a3b8' : '#64748b' },
          grid: { color: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(100,116,139,0.12)' },
        },
      },
    }),
    [isDark],
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Raportet</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Analitika dhe raporte të inventarit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <Card glow="cyan">
              <div className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-300">
                {formatCurrency(analytics.totalVal)}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Vlera totale</div>
            </Card>
            <Card glow="violet">
              <div className="truncate text-lg font-bold text-violet-700 dark:text-violet-200">
                {analytics.expensive?.name ?? '—'}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Produkti më i shtrenjtë</div>
            </Card>
            <Card glow="pink">
              <div className="truncate text-lg font-bold text-fuchsia-700 dark:text-fuchsia-200">
                {analytics.topCat ?? '—'}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Kategoria kryesore</div>
            </Card>
            <Card glow="cyan">
              <div className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-300">
                {analytics.low.length}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Stok i ulët</div>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card glow="violet" className="min-h-[300px]">
          <CardTitle className="mb-4">Produktet sipas kategorisë</CardTitle>
          {loading ? (
            <Skeleton className="mx-auto h-48 w-48 rounded-full" />
          ) : error ? (
            <p className="py-10 text-center text-rose-500">{error}</p>
          ) : (
            <div className="h-56">
              <Doughnut key={`cat-${isDark}`} data={catChartData} options={chartOpts} />
            </div>
          )}
        </Card>
        <Card glow="cyan" className="min-h-[300px]">
          <CardTitle className="mb-4">Top 5 — vlera më e lartë</CardTitle>
          {loading ? (
            <Skeleton className="h-56 w-full rounded-xl" />
          ) : error ? (
            <p className="py-10 text-center text-rose-500">{error}</p>
          ) : (
            <div className="h-56">
              <Bar key={`bar-${isDark}`} data={barData} options={barOpts} />
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card glow="pink">
          <CardTitle className="mb-4">Produktet sipas kategorisë</CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                  <th className="pb-3">Kategoria</th>
                  <th className="pb-3">Nr.</th>
                  <th className="pb-3">Vlera</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.catVal).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      Nuk ka të dhëna.
                    </td>
                  </tr>
                ) : (
                  Object.entries(analytics.catVal).map(([cat, v]) => (
                    <tr key={cat} className="border-b border-slate-200/60 dark:border-slate-700/50">
                      <td className="py-2.5 font-medium text-slate-800 dark:text-slate-100">{cat}</td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">{v.count}</td>
                      <td className="py-2.5 font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(v.value)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card glow="violet">
          <CardTitle className="mb-4">Stok i ulët</CardTitle>
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
                {analytics.low.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center font-medium text-emerald-600 dark:text-emerald-400">
                      Asnjë produkt me stok të ulët.
                    </td>
                  </tr>
                ) : (
                  analytics.low.map((p) => (
                    <tr key={String(p.id)} className="border-b border-slate-200/60 dark:border-slate-700/50">
                      <td className="py-2.5 font-medium text-slate-800 dark:text-slate-100">{p.name}</td>
                      <td className="py-2.5 font-mono text-xs text-slate-500">{p.sku}</td>
                      <td className="py-2.5">
                        <span className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                          {p.quantity}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">{p.category}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Top 5 produktet me vlerë më të lartë</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                <th className="pb-3">#</th>
                <th className="pb-3">Emri</th>
                <th className="pb-3">Çmimi</th>
                <th className="pb-3">Sasia</th>
                <th className="pb-3">Vlera totale</th>
              </tr>
            </thead>
            <tbody>
              {analytics.top5.map((p, i) => (
                <tr key={String(p.id)} className="border-b border-slate-200/60 dark:border-slate-700/50">
                  <td className="py-2.5">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 text-xs font-bold text-cyan-800 dark:text-cyan-200">
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-2.5 font-medium text-slate-800 dark:text-slate-100">{p.name}</td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400">{formatCurrency(p.price)}</td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400">{p.quantity}</td>
                  <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(parseFloat(String(p.price)) * parseInt(String(p.quantity), 10))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
