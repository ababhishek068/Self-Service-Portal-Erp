import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { navigationMenu, type NavItem } from '@/utils/constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function MobileNavGroup({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const location = useLocation()
  const hasActive = item.children?.some((c) => c.path && location.pathname.startsWith(c.path)) ?? false
  const [open, setOpen] = useState(hasActive)

  useEffect(() => {
    if (hasActive) setOpen(true)
  }, [hasActive])

  if (!item.children) return null

  return (
    <div className="border-b border-white/5">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-white">
        {item.label}
        <ChevronDown className="chevron-rotate h-4 w-4" data-open={open ? 'true' : 'false'} />
      </button>
      <div className="nav-submenu-grid bg-[var(--portal-navy-panel)]" data-open={open ? 'true' : 'false'}>
        <div className="nav-submenu-inner pb-1">
          {item.children.map((child) =>
            child.path ? (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn('block px-6 py-2 text-sm text-white/95', isActive ? 'bg-gradient-to-r from-[var(--portal-orange)] to-[#f97316] font-medium' : 'hover:bg-white/10')
                }
              >
                {child.label}
              </NavLink>
            ) : null,
          )}
        </div>
      </div>
    </div>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <div className="portal-sidebar-bg shrink-0 border-b border-white/10 lg:hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm font-semibold text-white">Menu</span>
        <Button type="button" variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      <div className="nav-submenu-grid border-t border-white/10" data-open={open ? 'true' : 'false'}>
        <div className="nav-submenu-inner portal-scrollbar max-h-[min(70vh,32rem)] overflow-y-auto pb-2">
          {navigationMenu.map((item) =>
            item.path ? (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn('block px-4 py-2.5 text-sm text-white', isActive ? 'bg-gradient-to-r from-[var(--portal-orange)] to-[#f97316] font-medium' : 'hover:bg-white/10')
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <MobileNavGroup key={item.label} item={item} onNavigate={() => setOpen(false)} />
            ),
          )}
        </div>
      </div>
    </div>
  )
}
