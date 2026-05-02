import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Skeleton } from '../components/ui/Skeleton'
import { apiGet, apiPost } from '../lib/api'
import { formatDate } from '../lib/format'
import { useToast } from '../context/ToastContext'
import type { ApiListResponse } from '../types'
import { cn } from '../lib/cn'

interface ProductOption {
  id: string | number
  name: string
}

interface WarehouseOption {
  id: string | number
  name: string
}

interface MovementApiRow {
  id: string
  product_id: string
  warehouse_id: string
  product_name?: string | null
  movement_type: string
  quantity: number | string
  reference?: string | null
  created_at?: string
}

export function StockMovementsPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<MovementApiRow[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([])
  const [loading, setLoading] = useState(true)
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [form, setForm] = useState({
    product_id: '',
    warehouse_id: '',
    type: 'IN' as 'IN' | 'OUT',
    quantity: '',
    reason: '',
  })

  const loadMovements = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiGet<ApiListResponse<MovementApiRow[]>>('/stockmovements')
      setRows(res.data ?? [])
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë ngarkimit të lëvizjeve', 'error')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true)
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        apiGet<ApiListResponse<ProductOption[]>>('/products'),
        apiGet<ApiListResponse<WarehouseOption[]>>('/warehouses'),
      ])
      setProducts(productsRes.data ?? [])
      setWarehouses(warehousesRes.data ?? [])
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë ngarkimit të produkteve/depo-ve', 'error')
      setProducts([])
      setWarehouses([])
    } finally {
      setOptionsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadMovements()
    loadOptions()
  }, [loadMovements, loadOptions])

  const stats = useMemo(
    () => ({
      total: rows.length,
      inC: rows.filter((m) => m.movement_type?.toUpperCase() === 'IN').length,
      outC: rows.filter((m) => m.movement_type?.toUpperCase() === 'OUT').length,
    }),
    [rows],
  )

  async function add() {
    if (!form.product_id) return showToast('Produkti është i detyrueshëm!', 'error')
    if (!form.warehouse_id) return showToast('Depoja është e detyrueshme!', 'error')
    if (!form.quantity || parseInt(form.quantity, 10) <= 0)
      return showToast('Sasia duhet të jetë pozitive!', 'error')
    try {
      await apiPost<ApiListResponse<MovementApiRow>>('/stockmovements', {
        product_id: form.product_id,
        warehouse_id: form.warehouse_id,
        movement_type: form.type.toLowerCase(),
        quantity: parseInt(form.quantity, 10),
        reference: form.reason.trim() || null,
      })
      showToast('Lëvizja u regjistrua!', 'success')
      setForm({ product_id: '', warehouse_id: '', type: 'IN', quantity: '', reason: '' })
      loadMovements()
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë regjistrimit të lëvizjes', 'error')
    }
  }

  const sorted = useMemo(() => rows, [rows])
  const warehouseNameById = useMemo(() => {
    const map = new Map<string, string>()
    warehouses.forEach((w) => map.set(String(w.id), w.name))
    return map
  }, [warehouses])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Lëvizjet e stokut
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Regjistro hyrjet dhe daljet për tenant-in tuaj.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card glow="cyan">
          <div className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-300">{loading ? '—' : stats.total}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total lëvizje</div>
        </Card>
        <Card glow="violet">
          <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-300">{loading ? '—' : stats.inC}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Hyrje (IN)</div>
        </Card>
        <Card glow="pink">
          <div className="font-mono text-2xl font-bold text-rose-600 dark:text-rose-300">{loading ? '—' : stats.outC}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Dalje (OUT)</div>
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Regjistro lëvizje</CardTitle>
        {optionsLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Produkti *</Label>
            <Select
              value={form.product_id}
              onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
            >
              <option value="">— Zgjidh produktin —</option>
              {products.map((p) => (
                <option key={String(p.id)} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Depoja *</Label>
            <Select
              value={form.warehouse_id}
              onChange={(e) => setForm((f) => ({ ...f, warehouse_id: e.target.value }))}
            >
              <option value="">— Zgjidh depon —</option>
              {warehouses.map((w) => (
                <option key={String(w.id)} value={String(w.id)}>
                  {w.name}
                </option>
              ))}
            </Select>
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
        )}
        <Button type="button" className="mt-4" onClick={add} disabled={optionsLoading}>
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
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-2">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : sorted.length === 0 ? (
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
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{m.product_name || m.product_id}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{warehouseNameById.get(String(m.warehouse_id)) || m.warehouse_id}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          'rounded-lg border px-2 py-0.5 text-xs font-bold',
                          m.movement_type?.toUpperCase() === 'IN'
                            ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                            : 'border-rose-400/40 bg-rose-500/15 text-rose-800 dark:text-rose-200',
                        )}
                      >
                        {m.movement_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{m.quantity}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{m.reference || '—'}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{m.created_at ? formatDate(m.created_at) : '—'}</td>
                    <td className="py-3" />
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
