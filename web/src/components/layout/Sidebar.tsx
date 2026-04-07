import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowLeftRight,
  Truck,
  ClipboardList,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  UserCog,
  LogOut,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, permission: 'dashboard' as const },
  { to: '/products', label: 'Produktet', icon: Package, permission: 'products' as const },
  { to: '/warehouses', label: 'Depo', icon: Warehouse, permission: 'warehouses' as const },
  { to: '/stockmovements', label: 'Lëvizjet', icon: ArrowLeftRight, permission: 'stockmovements' as const },
  { to: '/suppliers', label: 'Furnitorët', icon: Truck, permission: 'suppliers' as const },
  { to: '/orders', label: 'Porositë', icon: ClipboardList, permission: 'orders' as const },
  { to: '/customers', label: 'Klientët', icon: Users, permission: 'customers' as const },
  { to: '/reports', label: 'Raportet', icon: BarChart3, permission: 'reports' as const },
  { to: '/users', label: 'Përdoruesit', icon: UserCog, permission: 'users' as const },
]

function initialsFromName(name: string) {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function roleBadgeClass(role: string) {
  if (role === 'administrator') {
    return 'border border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
  }
  if (role === 'menaxher') {
    return 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
  }
  return 'border border-violet-500/30 bg-violet-500/20 text-violet-400'
}

function roleLabel(role: string) {
  if (role === 'administrator') return 'Administrator'
  if (role === 'menaxher') return 'Menaxher'
  return 'Staf'
}

function Aside({
  collapsed,
  onMobileClose,
  onCollapsedChange,
  showCollapseControl,
}: {
  collapsed: boolean
  onMobileClose: () => void
  onCollapsedChange: (v: boolean) => void
  showCollapseControl: boolean
}) {
  const { user, hasPermission, logout } = useAuth()
  const visibleNav = nav.filter((item) => hasPermission(item.permission))

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r backdrop-blur-xl transition-[width] duration-500 ease-out',
        'border-cyan-500/10 bg-white/55 dark:border-cyan-400/15 dark:bg-slate-950/50',
        collapsed ? 'w-[4.5rem]' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 border-b border-cyan-500/10 px-4 py-5 dark:border-cyan-400/10',
          collapsed && 'justify-center px-2',
        )}
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-fuchsia-600 shadow-[0_0_20px_rgba(56,189,248,0.45)]">
          <Package className="h-5 w-5 text-white" strokeWidth={2} />
          <span className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
        </div>
        {!collapsed && (
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-0"
          >
            <div className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              StockFlow
            </div>
            <div className="truncate text-[11px] font-medium uppercase tracking-wider text-cyan-600/90 dark:text-cyan-300/90">
              Neural Inventory
            </div>
          </motion.div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {visibleNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            onClick={() => onMobileClose()}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
                'text-slate-600 hover:bg-cyan-500/10 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-200',
                isActive &&
                  'bg-gradient-to-r from-cyan-500/15 to-violet-500/10 text-cyan-800 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)] dark:from-cyan-500/20 dark:to-violet-600/15 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]',
                collapsed && 'justify-center px-2',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110',
                    isActive && 'text-cyan-600 dark:text-cyan-300',
                  )}
                  strokeWidth={1.75}
                />
                {!collapsed && <span className="truncate">{label}</span>}
                {isActive && (
                  <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] dark:bg-cyan-300" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="border-t border-cyan-500/10 p-3 dark:border-cyan-400/10">
          <div
            className={cn(
              'flex items-center gap-3',
              collapsed && 'flex-col justify-center gap-2',
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-600/40 text-sm font-bold text-white ring-1 ring-white/20',
              )}
              title={user.name}
            >
              {initialsFromName(user.name)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <span
                  className={cn(
                    'mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    roleBadgeClass(user.role),
                  )}
                >
                  {roleLabel(user.role)}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => logout()}
            title="Çkyçu"
            className={cn(
              'mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/10',
              collapsed && 'mt-2 px-0',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Çkyçu</span>}
          </button>
        </div>
      )}

      {showCollapseControl && (
        <div className="border-t border-cyan-500/10 p-3 dark:border-cyan-400/10">
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/20 py-2 text-xs font-semibold text-cyan-700 transition-all duration-300 hover:bg-cyan-500/10 dark:border-cyan-400/25 dark:text-cyan-200 dark:hover:bg-cyan-500/10',
              collapsed && 'px-2',
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Palos</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  )
}

type SidebarProps = {
  mobileOpen: boolean
  onMobileClose: () => void
  collapsed: boolean
  onCollapsedChange: (v: boolean) => void
}

export function Sidebar({
  mobileOpen,
  onMobileClose,
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden lg:block',
          collapsed ? 'w-[4.5rem]' : 'w-64',
        )}
      >
        <Aside
          collapsed={collapsed}
          onMobileClose={() => {}}
          onCollapsedChange={onCollapsedChange}
          showCollapseControl
        />
      </div>

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Aside
          collapsed={false}
          onMobileClose={onMobileClose}
          onCollapsedChange={onCollapsedChange}
          showCollapseControl={false}
        />
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          aria-label="Mbyll menunë"
          onClick={onMobileClose}
        />
      )}
    </>
  )
}

export function MobileHeaderBar({
  onMenuClick,
}: {
  onMenuClick: () => void
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-cyan-500/10 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-cyan-400/15 dark:bg-slate-950/70 lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-cyan-500/10 dark:text-slate-300"
        aria-label="Hap menunë"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-fuchsia-600 shadow-lg shadow-cyan-500/30">
          <Package className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-slate-900 dark:text-white">StockFlow</span>
      </div>
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 opacity-0"
        tabIndex={-1}
        aria-hidden
      >
        <X className="h-6 w-6" />
      </button>
    </header>
  )
}
