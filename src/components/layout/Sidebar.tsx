import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Workflow, ClipboardCheck, Wallet, History, PieChart, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import type { Role } from '@/types'

interface MenuItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

// Admin Investasi & Administrator: sidebar PERSIS SAMA (06-update-round2 poin 1).
const ADMIN_MENU: MenuItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pipeline', label: 'Pipeline', icon: Workflow },
  { to: '/portofolio', label: 'Portofolio', icon: PieChart },
  { to: '/input-realisasi', label: 'Input Realisasi', icon: Wallet },
  { to: '/activity-log', label: 'Activity Log', icon: History },
]

const REVIEWER_MENU: MenuItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/review', label: 'Review', icon: ClipboardCheck },
]

const MENUS: Record<Role, MenuItem[]> = {
  admin_investasi: ADMIN_MENU,
  administrator: ADMIN_MENU,
  appraisal: REVIEWER_MENU,
  investasi: REVIEWER_MENU,
  legal: REVIEWER_MENU,
  rm: REVIEWER_MENU,
}

export function Sidebar() {
  const currentUser = useAppStore((s) => s.currentUser)
  const logout = useAppStore((s) => s.logout)

  if (!currentUser) return null
  const menus = MENUS[currentUser.role]

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <img src="https://jakartaventura.com/assets/img/logo/jakvent-logo.svg" alt="Jakvent" className="h-8 w-auto" />
        <span className="text-lg font-bold text-foreground">Jakvent</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {menus.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive ? 'bg-primary/10 font-semibold text-primary' : 'font-medium text-muted-foreground hover:bg-secondary hover:text-foreground',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border/60 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
