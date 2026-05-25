import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight, CheckCircle2, ClipboardList, Database, Sparkles, Users, Warehouse } from 'lucide-react'
import { dbGetDashboard } from '@/data/database'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import type { PortalRequest } from '@/types/erp.types'
import { cn } from '@/lib/utils'

export function Dashboard() {
  const { user } = useAuth()
  const summary = useQuery({ queryKey: ['dashboard'], queryFn: dbGetDashboard })

  const statCards = [
    { label: 'Total requests', value: summary.data?.totalRequests ?? 0, icon: ClipboardList, href: '/requests' },
    { label: 'Pending approval', value: summary.data?.pendingApprovals ?? 0, icon: Activity, href: '/requests?status=Pending+Approval' },
    { label: 'Active employees', value: summary.data?.activeEmployees ?? 0, icon: Users, href: '/master/employees' },
    { label: 'Low stock items', value: summary.data?.lowStockItems ?? 0, icon: Warehouse, href: '/master/items' },
  ]

  const activityColumns: DataTableColumn<PortalRequest>[] = [
    { id: 'no', header: 'No.', cell: (r) => r.requestNo },
    { id: 'title', header: 'Request', cell: (r) => r.title },
    { id: 'maker', header: 'Employee', cell: (r) => r.makerName },
    { id: 'amount', header: 'Amount', cell: (r) => formatCurrency(r.amount) },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    { id: 'date', header: 'Created', cell: (r) => formatDateTime(r.createdAt) },
  ]

  return (
    <PageWrapper title="Command Center" description="Organization-wide control plane for Self Service operations.">
      {summary.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-6">
          <div className="portal-welcome flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                <Sparkles className="h-4 w-4 text-[var(--portal-orange)]" />
                Welcome, {user?.displayName}
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--portal-navy)]">Enterprise overview</p>
              <p className="mt-1 text-sm text-slate-500">You control master data, workflows, and every portal transaction from here.</p>
            </div>
            <div className="flex gap-2">
              <Link to="/requests" className="portal-quick-action portal-quick-action--orange portal-btn-shine text-sm">
                All requests <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/system/datastore" className="portal-quick-action portal-quick-action--navy portal-btn-shine text-sm">
                Data store <Database className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="portal-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <Link key={card.label} to={card.href} className="portal-card block p-5 no-underline">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{card.label}</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--portal-navy)]">{card.value}</p>
                  </div>
                  <div className="portal-card-icon">
                    <card.icon className="h-7 w-7 text-[var(--portal-navy)]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="portal-panel p-5">
              <h2 className="portal-page-title mb-4 text-lg font-semibold italic">System health</h2>
              <ul className="space-y-3">
                {summary.data?.syncHealth.map((item) => (
                  <li key={item.label} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    <CheckCircle2
                      className={cn(
                        'mt-0.5 h-5 w-5 shrink-0',
                        item.status === 'ok' ? 'text-emerald-600' : 'text-amber-500',
                      )}
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-600">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="portal-panel p-5">
              <h2 className="portal-page-title mb-4 text-lg font-semibold italic">By module</h2>
              <ul className="space-y-2">
                {summary.data?.requestsByModule.map((row) => (
                  <li key={row.module} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-800">{row.module}</span>
                    <span className="rounded-full bg-[var(--portal-navy)] px-2.5 py-0.5 text-xs font-bold text-white">{row.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="portal-panel p-4 sm:p-5">
            <h2 className="portal-page-title mb-4 text-lg font-semibold italic">Recent transactions</h2>
            <DataTable rows={summary.data?.recentActivity ?? []} columns={activityColumns} getRowId={(r) => r.id} compact />
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
