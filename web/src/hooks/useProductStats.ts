import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiGet } from '../lib/api'
import { formatCurrency } from '../lib/format'
import type { ApiListResponse, Product } from '../types'

export type DerivedProductStats = {
  count: number
  /** Total inventory value, formatted for display */
  value: string
  totalVal: number
  lowCount: number
  low: Product[]
  catCount: number
}

export function useProductStats() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGet<ApiListResponse<Product[]>>('/products')
      setProducts(res.data ?? [])
    } catch {
      setError('Të dhënat nuk mund të ngarkohen')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo((): DerivedProductStats => {
    const totalVal = products.reduce(
      (s, p) => s + parseFloat(String(p.price)) * parseInt(String(p.quantity), 10),
      0,
    )
    const low = products.filter((p) => parseInt(String(p.quantity), 10) < 5)
    const cats = new Set(products.map((p) => p.category))
    return {
      count: products.length,
      value: formatCurrency(totalVal),
      totalVal,
      lowCount: low.length,
      low,
      catCount: cats.size,
    }
  }, [products])

  return { products, loading, error, load, stats }
}
