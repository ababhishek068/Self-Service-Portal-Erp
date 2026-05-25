import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface LayoutContextValue {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  pageTitle: string
  setPageTitle: (title: string) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [pageTitle, setPageTitle] = useState('Command Center')
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])

  const value = useMemo(
    () => ({ sidebarOpen, setSidebarOpen, toggleSidebar, pageTitle, setPageTitle }),
    [sidebarOpen, pageTitle, toggleSidebar],
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider')
  return ctx
}
