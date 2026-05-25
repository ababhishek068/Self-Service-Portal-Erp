import { useEffect, type ReactNode } from 'react'
import { useLayout } from '@/context/LayoutContext'

interface PageWrapperProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageWrapper({ title, description, actions, children }: PageWrapperProps) {
  const { setPageTitle } = useLayout()

  useEffect(() => {
    setPageTitle(title)
  }, [title, setPageTitle])

  return (
    <div className="px-4 py-5 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-page-in-subtle">
            <h1 className="portal-page-title text-xl font-semibold italic">{title}</h1>
            {description ? <p className="mt-0.5 text-sm text-slate-600">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
        <div className="animate-page-in-subtle">{children}</div>
      </div>
    </div>
  )
}
