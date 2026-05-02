import { useCallback, useEffect, useState } from 'react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api'
import { useToast } from '../context/ToastContext'
import type { ApiListResponse, WarehouseRow } from '../types'
import { cn } from '../lib/cn'

interface WarehouseApiRow {
  id: string
  name: string
  location: string
  capacity?: number | string | null
  is_active?: boolean
  isActive?: boolean
}

export function WarehousesPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<WarehouseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', location: '', capacity: '', isActive: true })
  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<WarehouseRow | null>(null)

  const mapWarehouse = (row: WarehouseApiRow): WarehouseRow => ({
    id: String(row.id),
    name: row.name || '',
    location: row.location || '',
    capacity: row.capacity ?? 0,
    isActive: row.is_active ?? row.isActive ?? true,
  })

  const loadWarehouses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiGet<ApiListResponse<WarehouseApiRow[]>>('/warehouses')
      setRows((res.data ?? []).map(mapWarehouse))
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë ngarkimit të depove', 'error')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadWarehouses()
  }, [loadWarehouses])

  async function add() {
    if (!form.name.trim()) return showToast('Emri është i detyrueshëm!', 'error')
    if (!form.location.trim()) return showToast('Lokacioni është i detyrueshëm!', 'error')
    try {
      await apiPost<ApiListResponse<WarehouseApiRow>>('/warehouses', {
        name: form.name.trim(),
        location: form.location.trim(),
        capacity: form.capacity === '' ? 0 : Number(form.capacity),
        is_active: form.isActive,
      })
      showToast('Depoja u shtua!', 'success')
      setForm({ name: '', location: '', capacity: '', isActive: true })
      loadWarehouses()
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë shtimit të depos', 'error')
    }
  }

  async function saveEdit() {
    if (!edit) return
    try {
      await apiPut<ApiListResponse<WarehouseApiRow>>(`/warehouses/${edit.id}`, {
        name: edit.name,
        location: edit.location,
        capacity: edit.capacity === '' ? 0 : Number(edit.capacity),
        is_active: edit.isActive,
      })
      setEditOpen(false)
      showToast('Depoja u përditësua!', 'success')
      loadWarehouses()
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë përditësimit të depos', 'error')
    }
  }

  async function remove(id: string) {
    if (!confirm('A jeni i sigurt?')) return
    try {
      await apiDelete<ApiListResponse<unknown>>(`/warehouses/${id}`)
      showToast('Depoja u fshi!', 'success')
      loadWarehouses()
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë fshirjes së depos', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Depo</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Menaxho depot e tenant-it tuaj.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card glow="cyan">
          <div className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-300">{loading ? '—' : rows.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total depo</div>
        </Card>
        <Card glow="violet">
          <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-300">
            {loading ? '—' : rows.filter((w) => w.isActive).length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Depo aktive</div>
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Shto depo të re</CardTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Emri *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>Lokacioni *</Label>
            <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </div>
          <div>
            <Label>Kapaciteti</Label>
            <Input
              type="number"
              min={0}
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
            />
          </div>
          <div className="flex items-end gap-2 pb-2">
            <input
              id="wh-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-cyan-400/50 text-cyan-500"
            />
            <label htmlFor="wh-active" className="cursor-pointer pb-0.5 text-sm text-slate-600 dark:text-slate-300">
              Aktive
            </label>
          </div>
        </div>
        <Button type="button" className="mt-4" onClick={add}>
          Shto depon
        </Button>
      </Card>

      <Card glow="pink">
        <CardTitle className="mb-4">Lista e depove</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                <th className="pb-3">Emri</th>
                <th className="pb-3">Lokacioni</th>
                <th className="pb-3">Kapaciteti</th>
                <th className="pb-3">Statusi</th>
                <th className="pb-3">Veprimet</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={5} className="py-2">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    Nuk ka depo.
                  </td>
                </tr>
              ) : (
                rows.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-slate-200/60 hover:bg-cyan-500/5 dark:border-slate-700/50"
                  >
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{w.name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{w.location}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{w.capacity || '—'}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-bold',
                          w.isActive
                            ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                            : 'border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-400',
                        )}
                      >
                        {w.isActive ? 'Aktive' : 'Joaktive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => {
                            setEdit({ ...w })
                            setEditOpen(true)
                          }}
                        >
                          Ndrysho
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => remove(w.id)}
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

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Ndrysho depon">
        {edit && (
          <>
            <div className="space-y-3">
              <div>
                <Label>Emri</Label>
                <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              </div>
              <div>
                <Label>Lokacioni</Label>
                <Input value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} />
              </div>
              <div>
                <Label>Kapaciteti</Label>
                <Input
                  type="number"
                  value={String(edit.capacity)}
                  onChange={(e) => setEdit({ ...edit, capacity: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={edit.isActive}
                  onChange={(e) => setEdit({ ...edit, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-cyan-400/50"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">Aktive</span>
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
