import { useCallback, useMemo, useState } from 'react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { lsGet, lsSet } from '../lib/storage'
import { formatDate } from '../lib/format'
import { useToast } from '../context/ToastContext'
import type { MovementRow } from '../types'
import { cn } from '../lib/cn'

const KEY = 'movements'

export function StockMovementsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<MovementRow[]>(() => lsGet<MovementRow[]>(KEY, []))
  const [form, setForm] = useState({
    productName: '',
    warehouseName: '',
    type: 'IN' as 'IN' | 'OUT',
    quantity: '',
    reason: '',
  })

  const persist = useCallback((next: MovementRow[]) => {
    lsSet(KEY, next)
    setRows(next)
  }, [])

  const stats = useMemo(
    () => ({
      total: rows.length,
      inC: rows.filter((m) => m.type === 'IN').length,
      outC: rows.filter((m) => m.type === 'OUT').length,
    }),
    [rows],
  )

  function add() {
    if (!form.productName.trim()) return showToast('Produkti është i detyrueshëm!', 'error')
    if (!form.warehouseName.trim()) return showToast('Depoja është e detyrueshme!', 'error')
    if (!form.quantity || parseInt(form.quantity, 10) <= 0)
      return showToast('Sasia duhet të jetë pozitive!', 'error')
    persist([
      ...rows,
      {
        id: Date.now().toString(),
        productName: form.productName.trim(),
        warehouseName: form.warehouseName.trim(),
        type: form.type,
        quantity: form.quantity,
        reason: form.reason.trim(),
        date: new Date().toISOString(),
      },
    ])
    showToast('Lëvizja u regjistrua!', 'success')
    setForm({ productName: '', warehouseName: '', type: 'IN', quantity: '', reason: '' })
  }

  function remove(id: string) {
    if (!confirm('A jeni i sigurt?')) return
    persist(rows.filter((m) => m.id !== id))
    showToast('Lëvizja u fshi!', 'success')
  }

  const sorted = useMemo(() => [...rows].reverse(), [rows])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Lëvizjet e stokut
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Regjistro hyrjet dhe daljet (localStorage).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card glow="cyan">
          <div className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-300">{stats.total}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total lëvizje</div>
        </Card>
        <Card glow="violet">
          <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-300">{stats.inC}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Hyrje (IN)</div>
        </Card>
        <Card glow="pink">
          <div className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-300">{stats.outC}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Dalje (OUT)</div>
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Regjistro lëvizje</CardTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Produkti *</Label>
            <Input
              value={form.productName}
              onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
            />
          </div>
          <div>
            <Label>Depoja *</Label>
            <Input
              value={form.warehouseName}
              onChange={(e) => setForm((f) => ({ ...f, warehouseName: e.target.value }))}
            />
          </div>
          <div>
            <Label>Lloji *</Label>
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'IN' | 'OUT' }))}>
              <option value="IN">IN — Hyrje</option>
              <option value="OUT">OUT — Dalje</option>
            </Select>
          </div>
          <div>
            <Label>Sasia *</Label>
            <Input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Arsyeja</Label>
            <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          </div>
        </div>
        <Button type="button" className="mt-4" onClick={add}>
          Regjistro
        </Button>
      </Card>

      <Card glow="violet">
        <CardTitle className="mb-4">Historia e lëvizjeve</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                <th className="pb-3">Produkti</th>
                <th className="pb-3">Depoja</th>
                <th className="pb-3">Lloji</th>
                <th className="pb-3">Sasia</th>
                <th className="pb-3">Arsyeja</th>
                <th className="pb-3">Data</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Nuk ka lëvizje të regjistruara.
                  </td>
                </tr>
              ) : (
                sorted.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-slate-200/60 hover:bg-cyan-500/5 dark:border-slate-700/50"
                  >
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{m.productName}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{m.warehouseName}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          'rounded-lg border px-2 py-0.5 text-xs font-bold',
                          m.type === 'IN'
                            ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                            : 'border-rose-400/40 bg-rose-500/15 text-rose-800 dark:text-rose-200',
                        )}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{m.quantity}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{m.reason || '—'}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{formatDate(m.date)}</td>
                    <td className="py-3">
                      <Button
                        type="button"
                        variant="danger"
                        className="px-3 py-1.5 text-xs"
                        onClick={() => remove(m.id)}
                      >
                        Fshi
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
