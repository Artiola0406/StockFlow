import { useState } from 'react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useLocalStorageState } from '../hooks/useLocalStorage'
import { useToast } from '../context/ToastContext'
import type { SupplierRow } from '../types'
import { cn } from '../lib/cn'

const KEY = 'suppliers'

export function SuppliersPage() {
  const { showToast } = useToast()
  const { rows, persist } = useLocalStorageState<SupplierRow[]>(KEY, [])
  const [form, setForm] = useState({ name: '', email: '', phone: '', isActive: true })
  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<SupplierRow | null>(null)

  function add() {
    if (!form.name.trim()) return showToast('Emri është i detyrueshëm!', 'error')
    if (!form.email.trim()) return showToast('Email është i detyrueshëm!', 'error')
    if (!form.phone.trim()) return showToast('Telefoni është i detyrueshëm!', 'error')
    persist([
      ...rows,
      {
        id: Date.now().toString(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        isActive: form.isActive,
      },
    ])
    showToast('Furnitori u shtua!', 'success')
    setForm({ name: '', email: '', phone: '', isActive: true })
  }

  function saveEdit() {
    if (!edit) return
    persist(rows.map((s) => (s.id === edit.id ? edit : s)))
    setEditOpen(false)
    showToast('Furnitori u përditësua!', 'success')
  }

  function remove(id: string) {
    if (!confirm('A jeni i sigurt?')) return
    persist(rows.filter((s) => s.id !== id))
    showToast('Furnitori u fshi!', 'success')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Furnitorët</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Menaxho furnitorët (localStorage).</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card glow="cyan">
          <div className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-300">{rows.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total furnitorë</div>
        </Card>
        <Card glow="violet">
          <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-300">
            {rows.filter((s) => s.isActive).length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Furnitorë aktiv</div>
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Shto furnitor</CardTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Emri *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <Label>Telefoni *</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="flex items-end gap-2 pb-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-cyan-400/50"
            />
            <span className="text-sm text-slate-600 dark:text-slate-300">Aktiv</span>
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
                <th className="pb-3">Email</th>
                <th className="pb-3">Telefoni</th>
                <th className="pb-3">Statusi</th>
                <th className="pb-3">Veprimet</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
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
                            setEdit({ ...s })
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
                <Label>Email</Label>
                <Input
                  type="email"
                  value={edit.email}
                  onChange={(e) => setEdit({ ...edit, email: e.target.value })}
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
