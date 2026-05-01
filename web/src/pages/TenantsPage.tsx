import { useCallback, useEffect, useMemo, useState } from 'react'
import { Clipboard, Check } from 'lucide-react'
import { Card, CardTitle } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { apiGet } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'

/** Must match api.ts base `/api` → full URL GET /api/tenants/users */
const TENANT_TEAM_ENDPOINT = '/tenants/users'

type TenantUserRow = {
  id: string
  name: string
  email: string
  role: string
  user_role?: string | null
  is_active?: boolean | null | string | number
  created_at?: string
}

type TenantUsersResponse = {
  users: TenantUserRow[]
  tenantName?: string | null
}

function effectiveRole(u: TenantUserRow): string {
  return (u.user_role || u.role || 'staff').toLowerCase()
}

function isUserActive(u: TenantUserRow): boolean {
  const v = u.is_active
  if (v === true) return true
  if (v === false || v == null) return false
  if (typeof v === 'string') return v === 't' || v.toLowerCase() === 'true'
  return Boolean(v)
}

function readStoredBusinessHint(): string | null {
  try {
    const raw = localStorage.getItem('stockflow_user')
    if (!raw) return null
    const u = JSON.parse(raw) as {
      tenant_id?: string | number | null
      tenantName?: string
      businessName?: string
    }
    if (u.tenantName?.trim()) return u.tenantName.trim()
    if (u.businessName?.trim()) return u.businessName.trim()
    if (u.tenant_id != null && u.tenant_id !== '') return String(u.tenant_id)
    return null
  } catch {
    return null
  }
}

const ROLE_KEYS = ['super_admin', 'manager', 'staff'] as const

function sectionConfig(roleKey: (typeof ROLE_KEYS)[number]): {
  title: string
  emptyMsg: string
  glow: 'cyan' | 'violet' | 'pink'
  cardBorder: string
} {
  if (roleKey === 'super_admin') {
    return {
      title: '👑 Pronari',
      emptyMsg: 'Nuk ka pronar të caktuar',
      glow: 'cyan',
      cardBorder: 'border-teal-400/25 shadow-[0_0_24px_rgba(45,212,191,0.08)]',
    }
  }
  if (roleKey === 'manager') {
    return {
      title: '👔 Menaxheri',
      emptyMsg: 'Nuk ka menaxher të caktuar',
      glow: 'violet',
      cardBorder: 'border-violet-400/25 shadow-[0_0_24px_rgba(167,139,250,0.08)]',
    }
  }
  return {
    title: '👷 Stafi',
    emptyMsg: 'Nuk ka staf të caktuar',
    glow: 'pink',
    cardBorder: 'border-sky-400/25 shadow-[0_0_24px_rgba(56,189,248,0.08)]',
  }
}

export function TenantsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState<TenantUserRow[]>([])
  const [tenantName, setTenantName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<TenantUsersResponse>(TENANT_TEAM_ENDPOINT)
      setUsers(Array.isArray(data.users) ? data.users : [])
      setTenantName(data.tenantName ?? null)
    } catch {
      showToast('Nuk u ngarkuan përdoruesit e tenant-it', 'error')
      setUsers([])
      setTenantName(null)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    load()
  }, [load])

  const headerBizName = useMemo(() => {
    if (tenantName?.trim()) return tenantName.trim()
    const fromLs = readStoredBusinessHint()
    if (fromLs) return fromLs
    if (user?.tenant_id != null) return String(user.tenant_id)
    return null
  }, [tenantName, user?.tenant_id])

  const grouped = useMemo(() => {
    const map = new Map<string, TenantUserRow[]>()
    for (const key of ROLE_KEYS) map.set(key, [])
    for (const u of users) {
      const r = effectiveRole(u)
      let bucket: (typeof ROLE_KEYS)[number] = 'staff'
      if (r === 'super_admin') bucket = 'super_admin'
      else if (r === 'manager') bucket = 'manager'
      map.get(bucket)!.push(u)
    }
    return map
  }, [users])

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

  function renderSection(roleKey: (typeof ROLE_KEYS)[number]) {
    const cfg = sectionConfig(roleKey)
    const rows = grouped.get(roleKey) ?? []

    return (
      <Card
        key={roleKey}
        glow={cfg.glow}
        className={cn(
          'overflow-hidden bg-[#0f172a]/85 dark:bg-[#0f172a]/90',
          cfg.cardBorder,
        )}
      >
        <CardTitle className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wide',
              roleKey === 'super_admin' &&
                'border border-teal-400/40 bg-teal-500/15 text-teal-100 shadow-[0_0_20px_rgba(45,212,191,0.2)]',
              roleKey === 'manager' &&
                'border border-violet-400/40 bg-violet-500/15 text-violet-100 shadow-[0_0_20px_rgba(167,139,250,0.2)]',
              roleKey === 'staff' &&
                'border border-sky-400/40 bg-sky-500/15 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.2)]',
            )}
          >
            {cfg.title}
          </span>
          <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({rows.length})</span>
        </CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/15 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-cyan-400/20 dark:text-slate-400">
                <th className="pb-3">Emri</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Statusi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-sm text-slate-500/70 dark:text-slate-500/60">
                    {cfg.emptyMsg}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
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
                    <td className="py-3">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={cn(
                            'h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]',
                            isUserActive(row)
                              ? 'bg-emerald-400 text-emerald-400'
                              : 'bg-red-400 text-red-400',
                          )}
                        />
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            isUserActive(row)
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400',
                          )}
                        >
                          {isUserActive(row) ? 'Aktiv' : 'Joaktiv'}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Ekipi im</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Anëtarët e biznesit tuaj</p>
        {headerBizName && (
          <p className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-cyan-500/20 bg-[#0f172a]/70 px-4 py-2 text-sm text-slate-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)] backdrop-blur-sm dark:border-cyan-400/25">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-500/90 dark:text-cyan-300/90">
              Biznesi
            </span>
            <span className="font-semibold text-white">{headerBizName}</span>
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neon-cyan border-t-transparent" />
          <div className="w-full max-w-md space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">{ROLE_KEYS.map((roleKey) => renderSection(roleKey))}</div>
      )}
    </div>
  )
}
