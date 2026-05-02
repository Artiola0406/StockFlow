import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/format'
import { useToast } from '../context/ToastContext'
import type { ApiListResponse } from '../types'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'

const STATUS_OPTS = [
  { value: 'pending', label: 'Në pritje' },
  { value: 'completed', label: 'Konfirmuar' },
  { value: 'shipped', label: 'Dërguar' },
  { value: 'cancelled', label: 'Anuluar' },
]

interface OrderApiRow {
  id: string
  customer_name: string
  product_name: string
  quantity: number | string
  total_amount: number | string
  status: string
  created_at?: string
}

interface FormOption {
  id: string
  name: string
  price?: string | number
}

interface CustomersApiResponse {
  success?: boolean
  customers?: FormOption[]
}

interface OrdersListResponse {
  orders: OrderApiRow[]
}

interface OrderStatsResponse {
  stats: {
    total: number
    completed: number
    pending: number
  }
}

function statusClass(s: string) {
  const map: Record<string, string> = {
    pending: 'border-amber-400/40 bg-amber-500/15 text-amber-800 dark:text-amber-200',
    completed: 'border-sky-400/40 bg-sky-500/15 text-sky-800 dark:text-sky-200',
    shipped: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200',
    cancelled: 'border-rose-400/40 bg-rose-500/15 text-rose-800 dark:text-rose-200',
  }
  return map[s] || 'border-slate-400/40 bg-slate-500/10 text-slate-700 dark:text-slate-300'
}

export function OrdersPage() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const canDeleteOrders = user?.role === 'super_admin'

  const [orders, setOrders] = useState<OrderApiRow[]>([])
  const [loading, setLoading] = useState(true)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [customers, setCustomers] = useState<FormOption[]>([])
  const [products, setProducts] = useState<FormOption[]>([])
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 })

  const [form, setForm] = useState({
    customer_name: '',
    product_name: '',
    quantity: '',
    total_amount: '',
    status: 'pending',
  })

  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<OrderApiRow | null>(null)

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true)
    try {
      const [custRes, prodRes] = await Promise.all([
        apiGet<CustomersApiResponse>('/customers'),
        apiGet<ApiListResponse<FormOption[]>>('/products'),
      ])
      setCustomers(custRes.customers ?? [])
      setProducts(prodRes.data ?? [])
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Opsionet nuk u ngarkuan', 'error')
      setCustomers([])
      setProducts([])
    } finally {
      setOptionsLoading(false)
    }
  }, [showToast])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<OrdersListResponse>('/orders')
      setOrders(data.orders ?? [])
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Porositë nuk u ngarkuan', 'error')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await apiGet<OrderStatsResponse>('/orders/stats')
      const s = data.stats
      setStats({
        total: s?.total ?? 0,
        completed: s?.completed ?? 0,
        pending: s?.pending ?? 0,
      })
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Statistikat nuk u ngarkuan', 'error')
      setStats({ total: 0, completed: 0, pending: 0 })
    } finally {
      setStatsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  useEffect(() => {
    loadOrders()
    loadStats()
  }, [loadOrders, loadStats])

  const productByName = useMemo(() => {
    const m = new Map<string, FormOption>()
    products.forEach((p) => m.set(p.name, p))
    return m
  }, [products])

  function applyProductPrice(productName: string, qtyStr: string) {
    const p = productByName.get(productName)
    if (!p || p.price === undefined || p.price === null) return
    const q = parseInt(qtyStr, 10)
    if (!q || q <= 0) return
    const unit = parseFloat(String(p.price))
    if (Number.isNaN(unit)) return
    setForm((f) => ({ ...f, total_amount: (unit * q).toFixed(2) }))
  }

  async function add() {
    const { customer_name, product_name, quantity, total_amount, status } = form
    if (!customer_name) return showToast('Zgjidhni klientin.', 'error')
    if (!product_name) return showToast('Zgjidhni produktin.', 'error')
    if (!quantity || parseInt(quantity, 10) <= 0) return showToast('Sasia duhet të jetë pozitive!', 'error')
    if (!total_amount || parseFloat(total_amount) <= 0) return showToast('Totali duhet të jetë pozitiv!', 'error')
    try {
      await apiPost<{ order: OrderApiRow }>('/orders', {
        customer_name,
        product_name,
        quantity: parseInt(quantity, 10),
        total_amount: parseFloat(total_amount),
        status,
      })
      showToast('Porosia u krijua dhe stoku u përditësua', 'success')
      setForm({
        customer_name: '',
        product_name: '',
        quantity: '',
        total_amount: '',
        status: 'pending',
      })
      await loadOptions()
      await loadOrders()
      await loadStats()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Gabim', 'error')
    }
  }

  async function saveEdit() {
    if (!edit) return
    try {
      await apiPut<{ order: OrderApiRow }>(`/orders/${edit.id}`, {
        customer_name: edit.customer_name,
        product_name: edit.product_name,
        quantity: Number(edit.quantity),
        total_amount: Number(edit.total_amount),
        status: edit.status,
      })
      setEditOpen(false)
      showToast('Porosia u përditësua!', 'success')
      await loadOrders()
      await loadStats()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Gabim', 'error')
    }
  }

  async function remove(id: string) {
    if (!confirm('A jeni i sigurt?')) return
    try {
      await apiDelete<{ message: string }>(`/orders/${id}`)
      showToast('Porosia u fshi!', 'success')
      await loadOrders()
      await loadStats()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Gabim', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Porositë</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Porosi të lidhura me klientët dhe produktet e tenant-it tuaj.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card glow="cyan">
          {statsLoading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-300">{stats.total}</div>
          )}
          <div className="text-sm text-slate-500 dark:text-slate-400">Total porosi</div>
        </Card>
        <Card glow="violet">
          {statsLoading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-300">
              {stats.completed}
            </div>
          )}
          <div className="text-sm text-slate-500 dark:text-slate-400">Të përfunduara</div>
        </Card>
        <Card glow="pink">
          {statsLoading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-300">{stats.pending}</div>
          )}
          <div className="text-sm text-slate-500 dark:text-slate-400">Në pritje</div>
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Shto porosi</CardTitle>
        {optionsLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label>Klienti *</Label>
              <Select
                value={form.customer_name}
                onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
              >
                <option value="">— Zgjidh klientin —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
              {customers.length === 0 && !optionsLoading && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                  Nuk ka klientë — shto fillimisht.
                </p>
              )}
            </div>
            <div>
              <Label>Produkti *</Label>
              <Select
                value={form.product_name}
                onChange={(e) => {
                  const pname = e.target.value
                  setForm((f) => ({ ...f, product_name: pname }))
                  applyProductPrice(pname, form.quantity || '1')
                }}
              >
                <option value="">— Zgjidh produktin —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </Select>
              {products.length === 0 && !optionsLoading && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                  Nuk ka produkte — shto fillimisht.
                </p>
              )}
            </div>
            <div>
              <Label>Sasia *</Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => {
                  const q = e.target.value
                  setForm((f) => ({ ...f, quantity: q }))
                  if (form.product_name) applyProductPrice(form.product_name, q)
                }}
              />
            </div>
            <div>
              <Label>Totali (€) *</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.total_amount}
                onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value }))}
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
        )}
        <Button type="button" className="mt-4" onClick={add} disabled={optionsLoading}>
          Shto porosinë
        </Button>
      </Card>

      <Card glow="violet">
        <CardTitle className="mb-4">Lista e porosive</CardTitle>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                  <th className="pb-3">KLIENTI</th>
                  <th className="pb-3">PRODUKTI</th>
                  <th className="pb-3">SASIA</th>
                  <th className="pb-3">TOTALI</th>
                  <th className="pb-3">STATUSI</th>
                  <th className="pb-3">DATA</th>
                  <th className="pb-3">Veprimet</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      Nuk ka porosi.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-slate-200/60 hover:bg-cyan-500/5 dark:border-slate-700/50"
                    >
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-100">
                        {o.customer_name?.trim() || '—'}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{o.product_name?.trim() || '—'}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{o.quantity}</td>
                      <td className="py-3 font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(o.total_amount)}
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'rounded-lg border px-2 py-0.5 text-xs font-bold',
                            statusClass(o.status),
                          )}
                        >
                          {STATUS_OPTS.find((x) => x.value === o.status)?.label || o.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {o.created_at ? formatDate(o.created_at) : '—'}
                      </td>
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
                          {canDeleteOrders && (
                            <Button
                              type="button"
                              variant="danger"
                              className="px-3 py-1.5 text-xs"
                              onClick={() => remove(o.id)}
                            >
                              Fshi
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Ndrysho porosinë">
        {edit && (
          <>
            <div className="space-y-3">
              <div>
                <Label>Klienti</Label>
                <Select
                  value={String(edit.customer_name ?? '')}
                  onChange={(e) => setEdit({ ...edit, customer_name: e.target.value })}
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Produkti</Label>
                <Select
                  value={String(edit.product_name ?? '')}
                  onChange={(e) => {
                    const pname = e.target.value
                    setEdit((prev) => {
                      if (!prev) return prev
                      const next = { ...prev, product_name: pname }
                      const p = productByName.get(pname)
                      if (p?.price != null) {
                        const q = parseInt(String(prev.quantity), 10) || 1
                        const unit = parseFloat(String(p.price))
                        if (!Number.isNaN(unit)) {
                          next.total_amount = (unit * q).toFixed(2)
                        }
                      }
                      return next
                    })
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sasia</Label>
                  <Input
                    type="number"
                    value={String(edit.quantity)}
                    onChange={(e) => {
                      const q = e.target.value
                      setEdit((prev) => {
                        if (!prev) return prev
                        const next = { ...prev, quantity: q }
                        const p = productByName.get(String(prev.product_name))
                        if (p?.price != null) {
                          const n = parseInt(q, 10) || 1
                          const unit = parseFloat(String(p.price))
                          if (!Number.isNaN(unit)) next.total_amount = (unit * n).toFixed(2)
                        }
                        return next
                      })
                    }}
                  />
                </div>
                <div>
                  <Label>Totali (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={String(edit.total_amount)}
                    onChange={(e) => setEdit({ ...edit, total_amount: e.target.value })}
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
