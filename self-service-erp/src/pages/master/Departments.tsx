import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dbListDepartments, dbUpsertDepartment } from '@/data/database'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/utils/formatters'
import type { Department } from '@/types/erp.types'

export function Departments() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const departments = useQuery({ queryKey: ['departments'], queryFn: dbListDepartments })
  const [editing, setEditing] = useState<Department | null>(null)

  const save = useMutation({
    mutationFn: (d: Department) => dbUpsertDepartment(d, user!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['departments'] })
      setEditing(null)
    },
  })

  const columns: DataTableColumn<Department>[] = [
    { id: 'code', header: 'Code', cell: (d) => d.code },
    { id: 'name', header: 'Name', cell: (d) => d.name },
    { id: 'branch', header: 'Branch', cell: (d) => d.branchCode },
    { id: 'limit', header: 'Spending limit', cell: (d) => formatCurrency(d.spendingLimit) },
    { id: 'status', header: 'Status', cell: (d) => <StatusBadge status={d.isActive ? 'Active' : 'Inactive'} /> },
    {
      id: 'edit',
      header: '',
      cell: (d) => (
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(d)}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Departments"
      description="Organizational units and spending limits for budget control."
      actions={
        <Button variant="accent" onClick={() => setEditing({ code: '', name: '', branchCode: 'HO', spendingLimit: 50000, isActive: true })}>
          Add department
        </Button>
      }
    >
      <div className="portal-table-wrap bg-white p-1">
        <DataTable rows={departments.data ?? []} columns={columns} getRowId={(d) => d.code} />
      </div>
      {editing ? (
        <div className="portal-form-card mt-6 max-w-md">
          <div className="portal-form-card-header px-4 py-3 font-semibold text-white">Department</div>
          <form
            className="space-y-3 p-4"
            onSubmit={(e) => {
              e.preventDefault()
              save.mutate(editing)
            }}
          >
            <div><Label>Code</Label><Input value={editing.code} onChange={(ev) => setEditing({ ...editing, code: ev.target.value.toUpperCase() })} required /></div>
            <div><Label>Name</Label><Input value={editing.name} onChange={(ev) => setEditing({ ...editing, name: ev.target.value })} required /></div>
            <div><Label>Spending limit</Label><Input type="number" value={editing.spendingLimit} onChange={(ev) => setEditing({ ...editing, spendingLimit: Number(ev.target.value) })} /></div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      ) : null}
    </PageWrapper>
  )
}
