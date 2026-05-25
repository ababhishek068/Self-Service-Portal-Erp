import { useQuery } from '@tanstack/react-query'
import { dbListAuditLog } from '@/data/database'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { formatDateTime } from '@/utils/formatters'
import type { GlobalAuditEntry } from '@/types/erp.types'

export function AuditLog() {
  const audit = useQuery({ queryKey: ['audit'], queryFn: dbListAuditLog })

  const columns: DataTableColumn<GlobalAuditEntry>[] = [
    { id: 'time', header: 'When', cell: (a) => formatDateTime(a.timestamp) },
    { id: 'cat', header: 'Category', cell: (a) => a.category },
    { id: 'action', header: 'Action', cell: (a) => a.action },
    { id: 'actor', header: 'Actor', cell: (a) => a.actor },
    { id: 'entity', header: 'Entity', cell: (a) => a.entityLabel ?? a.entityId ?? '—' },
    { id: 'details', header: 'Details', cell: (a) => a.details ?? '—' },
  ]

  return (
    <PageWrapper title="Audit Trail" description="Immutable log of administrative actions across the ERP datastore.">
      <div className="portal-table-wrap bg-white p-1">
        <DataTable rows={audit.data ?? []} columns={columns} getRowId={(a) => a.id} compact />
      </div>
    </PageWrapper>
  )
}
