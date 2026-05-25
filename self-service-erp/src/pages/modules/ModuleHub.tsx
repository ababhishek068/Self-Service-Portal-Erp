import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { dbListDepartments, dbListRequests } from '@/data/database'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { FilterBar } from '@/components/shared/FilterBar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { moduleLabels } from '@/utils/constants'
import type { PortalModuleKey } from '@/types/erp.types'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import type { PortalRequest, RequestStatus } from '@/types/erp.types'

export function ModuleHub({ module }: { module: PortalModuleKey }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [department, setDepartment] = useState('')

  const departments = useQuery({ queryKey: ['departments'], queryFn: dbListDepartments })
  const requests = useQuery({
    queryKey: ['requests', module, status, department, search],
    queryFn: () =>
      dbListRequests({
        module,
        status: (status || undefined) as RequestStatus | undefined,
        departmentCode: department || undefined,
        search: search || undefined,
      }),
  })

  const columns: DataTableColumn<PortalRequest>[] = useMemo(
    () => [
      {
        id: 'no',
        header: 'No.',
        cell: (r) => (
          <Link to={`/requests/${r.id}`} className="font-semibold text-[var(--portal-navy)] hover:underline">
            {r.requestNo}
          </Link>
        ),
      },
      { id: 'title', header: 'Title', cell: (r) => r.title },
      { id: 'maker', header: 'Employee', cell: (r) => r.makerName },
      { id: 'amount', header: 'Amount', cell: (r) => formatCurrency(r.amount) },
      { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
      { id: 'created', header: 'Created', cell: (r) => formatDateTime(r.createdAt) },
    ],
    [],
  )

  return (
    <PageWrapper
      title={moduleLabels[module]}
      description={`Manage and control all ${moduleLabels[module].toLowerCase()} records in the enterprise datastore.`}
    >
      <div className="space-y-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          department={department}
          onDepartmentChange={setDepartment}
          departments={departments.data}
        />
        <div className="portal-table-wrap bg-white p-1">
          <DataTable rows={requests.data ?? []} columns={columns} getRowId={(r) => r.id} />
        </div>
      </div>
    </PageWrapper>
  )
}
