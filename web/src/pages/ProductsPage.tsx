import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api'
import { formatCurrency } from '../lib/format'
import type { ApiListResponse, Product } from '../types'
import { useToast } from '../context/ToastContext'
import { useSearchQuery } from '../context/SearchContext'
import { Search, X } from 'lucide-react'
import { cn } from '../lib/cn'

export function ProductsPage() {
  const { showToast } = useToast()
  const { query } = useSearchQuery()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [localFilter, setLocalFilter] = useState('')

  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: '',
    category: '',
  })

  const [editOpen, setEditOpen] = useState(false)
  const [edit, setEdit] = useState({
    id: '' as string | number,
    name: '',
    sku: '',
    price: '',
    quantity: '',
    category: '',
  })

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const q = localFilter.trim()
      const path = q ? `/products?filter=${encodeURIComponent(q)}` : '/products'
      const res = await apiGet<ApiListResponse<Product[]>>(path)
      setProducts(res.data ?? [])
    } catch {
      showToast('Serveri nuk është aktiv!', 'error')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [localFilter, showToast])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const combined = useMemo(() => {
    const t = query.trim().toLowerCase()
    if (!t) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(t) ||
        p.sku.toLowerCase().includes(t) ||
        p.category.toLowerCase().includes(t),
    )
  }, [products, query])

  const stats = useMemo(() => {
    const totalVal = combined.reduce(
      (s, p) => s + parseFloat(String(p.price)) * parseInt(String(p.quantity), 10),
      0,
    )
    const low = combined.filter((p) => parseInt(String(p.quantity), 10) < 5).length
    return { totalVal: formatCurrency(totalVal), low }
  }, [combined])

  async function addProduct() {
    const { name, sku, price, quantity, category } = form
    if (!name.trim()) return showToast('Emri është i detyrueshëm!', 'error')
    if (!sku.trim()) return showToast('SKU është i detyrueshëm!', 'error')
    if (!price || parseFloat(price) <= 0) return showToast('Çmimi duhet të jetë > 0!', 'error')
    if (quantity === '' || parseInt(quantity, 10) < 0)
      return showToast('Sasia nuk mund të jetë negative!', 'error')
    const res = await apiPost<ApiListResponse<Product>>('/products', {
      name: name.trim(),
      sku: sku.trim(),
      price,
      quantity,
      category: category.trim() || 'E pacaktuar',
    })
    if (res.success) {
      showToast('Produkti u shtua me sukses!', 'success')
      setForm({ name: '', sku: '', price: '', quantity: '', category: '' })
      loadProducts()
    } else showToast(res.message || 'Gabim', 'error')
  }

  async function saveUpdate() {
    const res = await apiPut<ApiListResponse<Product>>(`/products/${edit.id}`, {
      name: edit.name,
      sku: edit.sku,
      price: edit.price,
      quantity: edit.quantity,
      category: edit.category,
    })
    if (res.success) {
      setEditOpen(false)
      showToast('Produkti u përditësua!', 'success')
      loadProducts()
    } else showToast(res.message || 'Gabim', 'error')
  }

  async function deleteProduct(id: string | number, name: string) {
    if (!confirm(`A jeni i sigurt për fshirjen e "${name}"?`)) return
    const res = await apiDelete<ApiListResponse<unknown>>(`/products/${id}`)
    if (res.success) {
      showToast('Produkti u fshi!', 'success')
      loadProducts()
    } else showToast(res.message || 'Gabim', 'error')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Produktet
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Menaxho produktet dhe inventarin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card glow="cyan">
          <div className="font-mono text-2xl font-bold text-cyan-600 dark:text-cyan-300">
            {loading ? '—' : combined.length}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Produkte (filtër aktiv)</div>
        </Card>
        <Card glow="violet">
          <div className="font-mono text-2xl font-bold text-violet-600 dark:text-violet-300">
            {loading ? '—' : stats.totalVal}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Vlera totale</div>
        </Card>
        <Card glow="pink">
          <div className="font-mono text-2xl font-bold text-pink-600 dark:text-pink-300">
            {loading ? '—' : stats.low}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Stok i ulët (&lt;5)</div>
        </Card>
      </div>

      <Card glow="cyan">
        <CardTitle className="mb-4">Shto produkt të ri</CardTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label>Emri *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Emri i produktit"
            />
          </div>
          <div>
            <Label>SKU *</Label>
            <Input
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder="SKU-007"
            />
          </div>
          <div>
            <Label>Çmimi (€) *</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div>
            <Label>Sasia *</Label>
            <Input
              type="number"
              min={0}
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            />
          </div>
          <div>
            <Label>Kategoria</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Elektronikë…"
            />
          </div>
          <div className="flex items-end">
            <Button type="button" className="w-full" onClick={addProduct}>
              Shto produktin
            </Button>
          </div>
        </div>
      </Card>

      <Card glow="violet">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Lista e produkteve</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500/70" />
              <Input
                className="w-48 pl-9"
                placeholder="Filtro API…"
                value={localFilter}
                onChange={(e) => setLocalFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
              />
            </div>
            <Button type="button" variant="secondary" onClick={loadProducts}>
              <Search className="h-4 w-4" />
              Kërko
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLocalFilter('')}
            >
              <X className="h-4 w-4" />
              Pastro
            </Button>
          </div>
        </div>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Kërkimi në topbar filtron listën lokale; fusha më sipër dërgon kërkesë te API me parametrin{' '}
          <code className="rounded bg-slate-200/80 px-1 dark:bg-slate-800">filter</code>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                <th className="pb-3">Emri</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Çmimi</th>
                <th className="pb-3">Sasia</th>
                <th className="pb-3">Kategoria</th>
                <th className="pb-3">Veprimet</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-2">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : combined.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Nuk ka produkte.
                  </td>
                </tr>
              ) : (
                combined.map((p) => {
                  const low = parseInt(String(p.quantity), 10) < 5
                  return (
                    <tr
                      key={String(p.id)}
                      className="border-b border-slate-200/60 transition-colors hover:bg-cyan-500/5 dark:border-slate-700/50"
                    >
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                      <td className="py-3 font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'rounded-lg px-2 py-0.5 text-xs font-bold',
                            low
                              ? 'border border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                              : 'border border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                          )}
                        >
                          {p.quantity}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-medium text-cyan-800 dark:text-cyan-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => {
                              setEdit({
                                id: p.id,
                                name: p.name,
                                sku: p.sku,
                                price: String(p.price),
                                quantity: String(p.quantity),
                                category: p.category,
                              })
                              setEditOpen(true)
                            }}
                          >
                            Ndrysho
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => deleteProduct(p.id, p.name)}
                          >
                            Fshi
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Përditëso produktin"
      >
        <div className="space-y-3">
          <div>
            <Label>Emri</Label>
            <Input
              value={edit.name}
              onChange={(e) => setEdit((x) => ({ ...x, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>SKU</Label>
            <Input
              value={edit.sku}
              onChange={(e) => setEdit((x) => ({ ...x, sku: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Çmimi</Label>
              <Input
                type="number"
                value={edit.price}
                onChange={(e) => setEdit((x) => ({ ...x, price: e.target.value }))}
              />
            </div>
            <div>
              <Label>Sasia</Label>
              <Input
                type="number"
                value={edit.quantity}
                onChange={(e) => setEdit((x) => ({ ...x, quantity: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>Kategoria</Label>
            <Input
              value={edit.category}
              onChange={(e) => setEdit((x) => ({ ...x, category: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <Button type="button" className="flex-1" onClick={saveUpdate}>
            Ruaj
          </Button>
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditOpen(false)}>
            Anulo
          </Button>
        </div>
      </Modal>
    </div>
  )
}
