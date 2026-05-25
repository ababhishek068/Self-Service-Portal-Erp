import { LogOut, Menu, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLayout } from '@/context/LayoutContext'
import { useAuth } from '@/hooks/useAuth'
import { roleLabels } from '@/utils/constants'

export function Topbar() {
  const { pageTitle, toggleSidebar, sidebarOpen } = useLayout()
  const { user, logout } = useAuth()

  return (
    <header className="portal-topbar z-30 shrink-0 border-b-2 border-[var(--portal-navy)]">
      <div className="portal-topbar-glow" aria-hidden />
      <div className="flex h-14 items-center gap-3 px-4 lg:px-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-[var(--portal-navy)] hover:bg-slate-100"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Collapse navigation' : 'Expand navigation'}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 via-[var(--portal-navy)] to-[var(--portal-orange)] text-xs font-bold text-white shadow-lg ring-2 ring-white/80">
          H
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-[var(--portal-navy)]">HIJRA BANK</p>
          <p className="text-[10px] font-semibold tracking-wider text-slate-500">SELF SERVICE ERP</p>
        </div>

        <p
          key={pageTitle}
          className="animate-title-in ml-auto hidden rounded-full bg-gradient-to-r from-slate-100 to-blue-50/80 px-4 py-1.5 text-sm font-semibold text-[var(--portal-navy)] shadow-sm ring-1 ring-[var(--portal-navy)]/10 md:block lg:mr-4"
        >
          {pageTitle}
        </p>

        <div className="flex items-center gap-2 border-l border-slate-200/80 pl-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800">{user?.displayName}</p>
            <p className="flex items-center justify-end gap-1 text-xs text-slate-500">
              <Shield className="h-3 w-3" />
              {user ? roleLabels[user.role] : ''}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="text-slate-600" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
