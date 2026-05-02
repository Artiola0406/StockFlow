import { useCallback, useEffect, useState } from 'react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api'
import { useToast } from '../context/ToastContext'
import type { ApiListResponse, SupplierRow } from '../types'
import { cn } from '../lib/cn'

interface SupplierApiRow {
  id: string
  name: string
  contact_email?: string | null
  phone?: string | null
  is_active?: boolean
}

interface SuppliersListResponse {
  success?: boolean
  suppliers?: SupplierApiRow[]
}

export function SuppliersPage() {
  const { showToast } = useToast()
  const [rows, setRows] = useState<SupplierRow[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', contact_email: '', phone: '' })
  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<(SupplierRow & { contact_email?: string }) | null>(null)

  const mapSupplier = (row: SupplierApiRow): SupplierRow => ({
    id: String(row.id),
    name: row.name || '',
    email: row.contact_email || '',
    phone: row.phone || '',
    isActive: row.is_active ?? true,
  })

  const loadSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiGet<SuppliersListResponse>('/suppliers')
      setRows((res.suppliers ?? []).map(mapSupplier))
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë ngarkimit të furnitorëve', 'error')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadSuppliers()
  }, [loadSuppliers])

  async function add() {
    if (!form.name.trim()) return showToast('Emri është i detyrueshëm!', 'error')
    if (!form.contact_email.trim()) return showToast('Email kontakti është i detyrueshëm!', 'error')
    if (!form.phone.trim()) return showToast('Telefoni është i detyrueshëm!', 'error')
    try {
      await apiPost<ApiListResponse<SupplierApiRow>>('/suppliers', {
        name: form.name.trim(),
        contact_email: form.contact_email.trim(),
        phone: form.phone.trim(),
      })
      showToast('Furnitori u shtua!', 'success')
      setForm({ name: '', contact_email: '', phone: '' })
      loadSuppliers()
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë shtimit të furnitorit', 'error')
    }
  }

  async function saveEdit() {
    if (!edit) return
    try {
      await apiPut<ApiListResponse<SupplierApiRow>>(`/suppliers/${edit.id}`, {
        name: edit.name,
        contact_email: edit.contact_email ?? edit.email,
        phone: edit.phone,
        is_active: edit.isActive,
      })
      setEditOpen(false)
      showToast('Furnitori u përditësua!', 'success')
      loadSuppliers()
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë përditësimit të furnitorit', 'error')
    }
  }

  async function remove(id: string) {
    if (!confirm('A jeni i sigurt?')) return
    try {
      await apiDelete<ApiListResponse<unknown>>(`/suppliers/${id}`)
      showToast('Furnitori u fshi!', 'success')
      loadSuppliers()
    } catch (err: any) {
      showToast(err.message || 'Gabim gjatë fshirjes së furnitorit', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Furnitorët</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Menaxho furnitorët e tenant-it tuaj.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card glow="cyan">
          <div className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-300">{loading ? '—' : rows.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total furnitorë</div>
        </Card>
        <Card glow="violet">
          <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-300">
            {loading ? '—' : rows.filter((s) => s.isActive).length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Furnitorë aktiv</div>
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Shto furnitor</CardTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Emri *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>Email kontakti *</Label>
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
            />
          </div>
          <div>
            <Label>Telefoni *</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
        </div>
        <Button type="button" className="mt-4" onClick={add}>
          Shto furnitorin
        </Button>
      </Card>

      <Card glow="pink">
        <CardTitle className="mb-4">Lista e furnitorëve</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                <th className="pb-3">Emri</th>
                <th className="pb-3">Email kontakti</th>
                <th className="pb-3">Telefoni</th>
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
                    Nuk ka furnitorë.
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-200/60 hover:bg-cyan-500/5 dark:border-slate-700/50"
                  >
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{s.name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{s.email}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{s.phone}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-bold',
                          s.isActive
                            ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                            : 'border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-400',
                        )}
                      >
                        {s.isActive ? 'Aktiv' : 'Joaktiv'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => {
                            setEdit({ ...s, contact_email: s.email })
                            setEditOpen(true)
                          }}
                        >
                          Ndrysho
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => remove(s.id)}
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

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Ndrysho furnitorin">
        {edit && (
          <>
            <div className="space-y-3">
              <div>
                <Label>Emri</Label>
                <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              </div>
              <div>
                <Label>Email kontakti</Label>
                <Input
                  type="email"
                  value={edit.contact_email ?? edit.email}
                  onChange={(e) =>
                    setEdit({ ...edit, contact_email: e.target.value, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Telefoni</Label>
                <Input value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={edit.isActive}
                  onChange={(e) => setEdit({ ...edit, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-cyan-400/50"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">Aktiv</span>
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
