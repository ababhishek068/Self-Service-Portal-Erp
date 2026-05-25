import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dbListApprovalRules, dbUpsertApprovalRule } from '@/data/database'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { moduleLabels } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatters'
import type { ApprovalRule } from '@/types/erp.types'

export function Workflow() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const rules = useQuery({ queryKey: ['approval-rules'], queryFn: dbListApprovalRules })

  const toggle = useMutation({
    mutationFn: (rule: ApprovalRule) => dbUpsertApprovalRule({ ...rule, isActive: !rule.isActive }, user!),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['approval-rules'] }),
  })

  const columns: DataTableColumn<ApprovalRule>[] = [
    { id: 'module', header: 'Module', cell: (r) => moduleLabels[r.module] },
    { id: 'dept', header: 'Department', cell: (r) => r.departmentCode },
    { id: 'range', header: 'Amount range', cell: (r) => `${formatCurrency(r.minAmount)} – ${formatCurrency(r.maxAmount)}` },
    { id: 'role', header: 'Checker role', cell: (r) => r.checkerRole },
    { id: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.isActive ? 'Active' : 'Inactive'} /> },
    {
      id: 'toggle',
      header: '',
      cell: (r) => (
        <Button type="button" variant="outline" size="sm" onClick={() => toggle.mutate(r)}>
          {r.isActive ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper title="Workflow Rules" description="Approval matrix that governs how portal requests route to checkers.">
      <div className="portal-table-wrap bg-white p-1">
        <DataTable rows={rules.data ?? []} columns={columns} getRowId={(r) => r.id} />
      </div>
    </PageWrapper>
  )
}
