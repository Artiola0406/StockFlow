import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CyberBackground } from '../CyberBackground'
import { Sidebar, MobileHeaderBar } from './Sidebar'
import { Topbar } from './Topbar'
import { cn } from '../../lib/cn'

export function AppLayout() {
  const [mobileNav, setMobileNav] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="relative min-h-screen">
      <CyberBackground />
      <MobileHeaderBar onMenuClick={() => setMobileNav((o) => !o)} />
      <Sidebar
        mobileOpen={mobileNav}
        onMobileClose={() => setMobileNav(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className={cn(
          'min-h-screen transition-[padding] duration-500 ease-out',
          sidebarCollapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64',
        )}
      >
        <main className="mx-auto max-w-7xl px-4 pb-12 pt-20 lg:px-8 lg:pt-8">
          <Topbar />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
