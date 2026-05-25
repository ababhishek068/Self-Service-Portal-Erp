import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dbListDepartments, dbListEmployees, dbUpsertEmployee } from '@/data/database'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { DataTable, type DataTableColumn } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import type { Employee } from '@/types/erp.types'

const emptyEmployee = (): Employee => ({
  id: `emp-${crypto.randomUUID()}`,
  employeeNo: '',
  displayName: '',
  email: '',
  departmentCode: 'BO',
  departmentName: 'Branch Operations',
  branchCode: 'HO',
  branchName: 'Head Office',
  jobTitle: '',
  jobGrade: 'G6',
  placeOfDuty: 'Head Office',
  accountNumber: '',
  managerEmployeeNo: '',
  leaveBalance: 0,
  responsibleCenter: 'HO-BO',
  permissionDepartments: ['BO'],
  isActive: true,
})

export function Employees() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const employees = useQuery({ queryKey: ['employees'], queryFn: dbListEmployees })
  const departments = useQuery({ queryKey: ['departments'], queryFn: dbListDepartments })
  const [editing, setEditing] = useState<Employee | null>(null)

  const save = useMutation({
    mutationFn: (emp: Employee) => dbUpsertEmployee(emp, user!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      setEditing(null)
    },
  })

  const columns: DataTableColumn<Employee>[] = [
    { id: 'no', header: 'Employee No.', cell: (e) => e.employeeNo },
    { id: 'name', header: 'Name', cell: (e) => e.displayName },
    { id: 'dept', header: 'Department', cell: (e) => e.departmentName },
    { id: 'grade', header: 'Grade', cell: (e) => e.jobGrade },
    { id: 'leave', header: 'Leave bal.', cell: (e) => `${e.leaveBalance} days` },
    { id: 'status', header: 'Status', cell: (e) => <StatusBadge status={e.isActive ? 'Active' : 'Inactive'} /> },
    {
      id: 'actions',
      header: '',
      cell: (e) => (
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(e)}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Employees"
      description="Master employee registry — portal users and approvers are sourced from here."
      actions={
        <Button variant="accent" onClick={() => setEditing(emptyEmployee())}>
          Add employee
        </Button>
      }
    >
      <div className="portal-table-wrap bg-white p-1">
        <DataTable rows={employees.data ?? []} columns={columns} getRowId={(e) => e.id} />
      </div>

      {editing ? (
        <div className="portal-form-card mt-6 max-w-2xl">
          <div className="portal-form-card-header px-4 py-3 font-semibold text-white">{editing.employeeNo ? 'Edit employee' : 'New employee'}</div>
          <form
            className="grid gap-3 p-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              const dept = departments.data?.find((d) => d.code === editing.departmentCode)
              save.mutate({ ...editing, departmentName: dept?.name ?? editing.departmentName })
            }}
          >
            <div><Label>Employee no.</Label><Input value={editing.employeeNo} onChange={(ev) => setEditing({ ...editing, employeeNo: ev.target.value })} required /></div>
            <div><Label>Display name</Label><Input value={editing.displayName} onChange={(ev) => setEditing({ ...editing, displayName: ev.target.value })} required /></div>
            <div><Label>Email</Label><Input value={editing.email} onChange={(ev) => setEditing({ ...editing, email: ev.target.value })} /></div>
            <div>
              <Label>Department</Label>
              <Select value={editing.departmentCode} onChange={(ev) => setEditing({ ...editing, departmentCode: ev.target.value })}>
                {(departments.data ?? []).map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </Select>
            </div>
            <div><Label>Job title</Label><Input value={editing.jobTitle} onChange={(ev) => setEditing({ ...editing, jobTitle: ev.target.value })} /></div>
            <div><Label>Leave balance</Label><Input type="number" value={editing.leaveBalance} onChange={(ev) => setEditing({ ...editing, leaveBalance: Number(ev.target.value) })} /></div>
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" variant="default">Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      ) : null}
    </PageWrapper>
  )
}
