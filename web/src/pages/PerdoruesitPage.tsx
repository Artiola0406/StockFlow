import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Clipboard, Check, Users } from 'lucide-react'
import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { apiGet } from '../lib/api'
import { isPlatformAdmin } from '../lib/platformAdmin'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'

type AllUserRow = {
  id: string
  name: string
  email: string
  role: string
  user_role?: string | null
  tenant_id?: string | null
  is_active: boolean
  created_at?: string
  business_name?: string | null
}

type AllUsersResponse = { users: AllUserRow[] }

function displayRole(u: AllUserRow) {
  return (u.user_role || u.role || '—').toString()
}

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('sq-AL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function PerdoruesitPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [rows, setRows] = useState<AllUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const allowed = isPlatformAdmin(user)

  const load = useCallback(async () => {
    if (!allowed) return
    setLoading(true)
    try {
      const data = await apiGet<AllUsersResponse>('/users/all')
      setRows(Array.isArray(data.users) ? data.users : [])
    } catch {
      showToast('Nuk u ngarkuan përdoruesit', 'error')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [allowed, showToast])

  useEffect(() => {
    load()
  }, [load])

  async function copyEmail(email: string, id: string) {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 2000)
      showToast('Email u kopjua', 'success')
    } catch {
      showToast('Nuk mund të kopjohet email-i', 'error')
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, AllUserRow[]>()
    for (const u of rows) {
      const label = (u.business_name && u.business_name.trim()) || u.tenant_id || '—'
      if (!map.has(label)) map.set(label, [])
      map.get(label)!.push(u)
    }
    const entries = [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
    return entries
  }, [rows])

  if (!allowed) {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Përdoruesit</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Të gjithë përdoruesit në të gjitha tenantët (platformë).
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neon-cyan border-t-transparent" />
          <div className="w-full max-w-lg space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ) : grouped.length === 0 ? (
        <Card glow="cyan" className="border-cyan-500/20 bg-[#0f172a]/80 py-16 text-center dark:bg-[#0f172a]/90">
          <Users className="mx-auto mb-4 h-12 w-12 text-cyan-400/80" strokeWidth={1.25} />
          <p className="text-slate-500 dark:text-slate-400">Nuk u gjetën përdorues.</p>
          <Button type="button" variant="secondary" className="mt-4" onClick={() => load()}>
            Provo përsëri
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map(([tenantLabel, list]) => (
            <Card key={tenantLabel} glow="violet" className="border-cyan-500/20 bg-[#0f172a]/80 dark:bg-[#0f172a]/90">
              <CardTitle className="mb-4 flex items-center gap-2 text-slate-100">
                <span className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-2 py-1 text-xs font-bold uppercase tracking-wide text-violet-200">
                  {tenantLabel}
                </span>
                <span className="text-sm font-normal text-slate-400">({list.length})</span>
              </CardTitle>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                      <th className="pb-3">Emri</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Roli</th>
                      <th className="pb-3">Tenant / Biznesi</th>
                      <th className="pb-3">Statusi</th>
                      <th className="pb-3">Krijuar më</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-200/60 hover:bg-cyan-500/5 dark:border-slate-700/50"
                      >
                        <td className="py-3 font-medium text-slate-800 dark:text-slate-100">{row.name}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{row.email}</span>
                            <button
                              type="button"
                              onClick={() => copyEmail(row.email, row.id)}
                              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-cyan-500/25 bg-cyan-500/10 p-1.5 text-cyan-700 transition-colors hover:bg-cyan-500/20 dark:text-cyan-200"
                              aria-label="Kopjo email-in"
                              title="Kopjo"
                            >
                              {copiedId === row.id ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Clipboard className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">{displayRole(row)}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">
                          {(row.business_name && row.business_name.trim()) || row.tenant_id || '—'}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={cn(
                                'h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]',
                                row.is_active ? 'bg-emerald-400 text-emerald-400' : 'bg-red-400 text-red-400',
                              )}
                            />
                            <span
                              className={cn(
                                'text-xs font-semibold',
                                row.is_active
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-red-600 dark:text-red-400',
                              )}
                            >
                              {row.is_active ? 'Aktiv' : 'Joaktiv'}
                            </span>
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">{formatDate(row.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
