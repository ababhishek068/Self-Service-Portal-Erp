import { Outlet } from 'react-router-dom'
import { AmbientLayer } from '@/components/layout/AmbientLayer'

export function MainContent() {
  return (
    <main className="portal-main-bg portal-scrollbar-light relative min-h-0 flex-1 overflow-y-auto">
      <AmbientLayer />
      <div className="relative z-[1]">
        <Outlet />
      </div>
    </main>
  )
}
