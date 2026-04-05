import { useCallback, useMemo, useState } from 'react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { lsGet, lsSet } from '../lib/storage'
import { formatCurrency, formatDate } from '../lib/format'
import { useToast } from '../context/ToastContext'
import type { OrderRow } from '../types'
import { cn } from '../lib/cn'

const KEY = 'orders'

const STATUS_OPTS = [
  { value: 'Ne pritje', label: 'Në pritje' },
  { value: 'Konfirmuar', label: 'Konfirmuar' },
  { value: 'Derguar', label: 'Dërguar' },
  { value: 'Anuluar', label: 'Anuluar' },
]

function statusClass(s: string) {
  const map: Record<string, string> = {
    'Ne pritje':
      'border-amber-400/40 bg-amber-500/15 text-amber-800 dark:text-amber-200',
    Konfirmuar: 'border-sky-400/40 bg-sky-500/15 text-sky-800 dark:text-sky-200',
    Derguar: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
    Anuluar: 'border-rose-400/40 bg-rose-500/15 text-rose-800 dark:text-rose-200',
  }
  return map[s] || 'border-slate-400/40 bg-slate-500/10 text-slate-700 dark:text-slate-300'
}

export function OrdersPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<OrderRow[]>(() => lsGet<OrderRow[]>(KEY, []))
  const [form, setForm] = useState({
    customerName: '',
    productName: '',
    quantity: '',
    totalAmount: '',
    status: 'Ne pritje',
  })
  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<OrderRow | null>(null)

  const persist = useCallback((next: OrderRow[]) => {
    lsSet(KEY, next)
    setRows(next)
  }, [])

  const stats = useMemo(
    () => ({
      total: rows.length,
      confirmed: rows.filter((o) => o.status === 'Konfirmuar').length,
      pending: rows.filter((o) => o.status === 'Ne pritje').length,
    }),
    [rows],
  )

  function add() {
    const { customerName, productName, quantity, totalAmount, status } = form
    if (!customerName.trim()) return showToast('Klienti është i detyrueshëm!', 'error')
    if (!productName.trim()) return showToast('Produkti është i detyrueshëm!', 'error')
    if (!quantity || parseInt(quantity, 10) <= 0) return showToast('Sasia duhet të jetë pozitive!', 'error')
    if (!totalAmount || parseFloat(totalAmount) <= 0) return showToast('Totali duhet të jetë pozitiv!', 'error')
    persist([
      ...rows,
      {
        id: Date.now().toString(),
        customerName: customerName.trim(),
        productName: productName.trim(),
        quantity,
        totalAmount,
        status,
        date: new Date().toISOString(),
      },
    ])
    showToast('Porosia u shtua!', 'success')
    setForm({
      customerName: '',
      productName: '',
      quantity: '',
      totalAmount: '',
      status: 'Ne pritje',
    })
  }

  function saveEdit() {
    if (!edit) return
    persist(rows.map((o) => (o.id === edit.id ? edit : o)))
    setEditOpen(false)
    showToast('Porosia u përditësua!', 'success')
  }

  function remove(id: string) {
    if (!confirm('A jeni i sigurt?')) return
    persist(rows.filter((o) => o.id !== id))
    showToast('Porosia u fshi!', 'success')
  }

  const sorted = useMemo(() => [...rows].reverse(), [rows])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Porositë</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Menaxho porositë (localStorage).</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card glow="cyan">
          <div className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-300">{stats.total}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total porosi</div>
        </Card>
        <Card glow="violet">
          <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-300">
            {stats.confirmed}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Të konfirmuara</div>
        </Card>
        <Card glow="pink">
          <div className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-300">{stats.pending}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Në pritje</div>
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Shto porosi</CardTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Klienti *</Label>
            <Input
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
            />
          </div>
          <div>
            <Label>Produkti *</Label>
            <Input
              value={form.productName}
              onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value }))}
            />
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
          <div>
            <Label>Totali (€) *</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.totalAmount}
              onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
            />
          </div>
          <div>
            <Label>Statusi</Label>
            <Select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {STATUS_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Button type="button" className="mt-4" onClick={add}>
          Shto porosinë
        </Button>
      </Card>

      <Card glow="violet">
        <CardTitle className="mb-4">Lista e porosive</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                <th className="pb-3">Klienti</th>
                <th className="pb-3">Produkti</th>
                <th className="pb-3">Sasia</th>
                <th className="pb-3">Totali</th>
                <th className="pb-3">Statusi</th>
                <th className="pb-3">Data</th>
                <th className="pb-3">Veprimet</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Nuk ka porosi.
                  </td>
                </tr>
              ) : (
                sorted.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-slate-200/60 hover:bg-cyan-500/5 dark:border-slate-700/50"
                  >
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{o.customerName}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{o.productName}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{o.quantity}</td>
                    <td className="py-3 font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="py-3">
                      <span className={cn('rounded-lg border px-2 py-0.5 text-xs font-bold', statusClass(o.status))}>
                        {STATUS_OPTS.find((x) => x.value === o.status)?.label || o.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{formatDate(o.date)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => {
                            setEdit({ ...o })
                            setEditOpen(true)
                          }}
                        >
                          Ndrysho
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => remove(o.id)}
                        >
                          Fshi
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Ndrysho porosinë">
        {edit && (
          <>
            <div className="space-y-3">
              <div>
                <Label>Klienti</Label>
                <Input
                  value={edit.customerName}
                  onChange={(e) => setEdit({ ...edit, customerName: e.target.value })}
                />
              </div>
              <div>
                <Label>Produkti</Label>
                <Input
                  value={edit.productName}
                  onChange={(e) => setEdit({ ...edit, productName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sasia</Label>
                  <Input
                    type="number"
                    value={String(edit.quantity)}
                    onChange={(e) => setEdit({ ...edit, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Totali (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={String(edit.totalAmount)}
                    onChange={(e) => setEdit({ ...edit, totalAmount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Statusi</Label>
                <Select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                  {STATUS_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="button" className="flex-1" onClick={saveEdit}>
                Ruaj
              </Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditOpen(false)}>
                Anulo
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
