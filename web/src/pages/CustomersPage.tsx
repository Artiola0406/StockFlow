import { useMemo, useState } from 'react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useLocalStorageState } from '../hooks/useLocalStorage'
import { useToast } from '../context/ToastContext'
import type { Customer } from '../types'

const KEY = 'customers'

export function CustomersPage() {
  const { showToast } = useToast()
  const { rows, persist } = useLocalStorageState<Customer[]>(KEY, [])
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState<Customer | null>(null)

  const todayNew = useMemo(() => {
    const t = new Date().toDateString()
    return rows.filter((c) => new Date(c.createdAt).toDateString() === t).length
  }, [rows])

  function add() {
    const { name, email, phone, address } = form
    if (!name.trim()) return showToast('Emri është i detyrueshëm!', 'error')
    if (!email.trim()) return showToast('Email është i detyrueshëm!', 'error')
    if (!phone.trim()) return showToast('Telefoni është i detyrueshëm!', 'error')
    persist([
      ...rows,
      {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        createdAt: new Date().toISOString(),
      },
    ])
    showToast('Klienti u shtua!', 'success')
    setForm({ name: '', email: '', phone: '', address: '' })
  }

  function saveEdit() {
    if (!edit) return
    persist(rows.map((c) => (c.id === edit.id ? edit : c)))
    setEditOpen(false)
    showToast('Klienti u përditësua!', 'success')
  }

  function remove(id: string) {
    if (!confirm('A jeni i sigurt?')) return
    persist(rows.filter((c) => c.id !== id))
    showToast('Klienti u fshi!', 'success')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Klientët</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Menaxho klientët (localStorage).</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card glow="cyan">
          <div className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-300">{rows.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total klientë</div>
        </Card>
        <Card glow="violet">
          <div className="font-mono text-2xl font-bold text-violet-600 dark:text-violet-300">{todayNew}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Klientë të rinj (sot)</div>
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Shto klient</CardTitle>
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
          <div>
            <Label>Adresa</Label>
            <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
        </div>
        <Button type="button" className="mt-4" onClick={add}>
          Shto klientin
        </Button>
      </Card>

      <Card glow="pink">
        <CardTitle className="mb-4">Lista e klientëve</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                <th className="pb-3">Emri</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Telefoni</th>
                <th className="pb-3">Adresa</th>
                <th className="pb-3">Veprimet</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    Nuk ka klientë.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-200/60 hover:bg-cyan-500/5 dark:border-slate-700/50"
                  >
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{c.name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{c.email}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{c.phone}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{c.address || '—'}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => {
                            setEdit({ ...c })
                            setEditOpen(true)
                          }}
                        >
                          Ndrysho
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => remove(c.id)}
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

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Ndrysho klientin">
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
              <div>
                <Label>Adresa</Label>
                <Input value={edit.address || ''} onChange={(e) => setEdit({ ...edit, address: e.target.value })} />
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
