import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import {
  dbDeleteRequest,
  dbGetRequest,
  dbListEmployees,
  dbReassignApprover,
  dbUpdateRequestStatus,
} from '@/data/database'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ApprovalTimeline } from '@/components/shared/ApprovalTimeline'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import { moduleLabels } from '@/utils/constants'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import type { RequestStatus } from '@/types/erp.types'

export function RequestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [note, setNote] = useState('')
  const [approver, setApprover] = useState('')

  const request = useQuery({ queryKey: ['request', id], queryFn: () => dbGetRequest(id!), enabled: Boolean(id) })
  const employees = useQuery({ queryKey: ['employees'], queryFn: dbListEmployees })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['request', id] })
    void queryClient.invalidateQueries({ queryKey: ['requests'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const setStatus = useMutation({
    mutationFn: (status: RequestStatus) => dbUpdateRequestStatus(id!, status, user!, note || undefined),
    onSuccess: invalidate,
  })

  const reassign = useMutation({
    mutationFn: () => dbReassignApprover(id!, approver, user!),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: () => dbDeleteRequest(id!, user!),
    onSuccess: () => navigate('/requests'),
  })

  const r = request.data
  if (!r) return null

  return (
    <PageWrapper
      title={r.requestNo}
      description={moduleLabels[r.requestType]}
      actions={
        <Link to="/requests" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--portal-navy)] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="portal-card border-0 shadow-none">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-3 text-lg">
                {r.title}
                <StatusBadge status={r.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <div><span className="text-slate-500">Employee</span><p className="font-medium">{r.makerName} ({r.makerEmployeeNo})</p></div>
              <div><span className="text-slate-500">Department</span><p className="font-medium">{r.departmentName}</p></div>
              <div><span className="text-slate-500">Amount</span><p className="font-medium">{formatCurrency(r.amount)}</p></div>
              <div><span className="text-slate-500">Responsible center</span><p className="font-medium">{r.responsibleCenter}</p></div>
              <div><span className="text-slate-500">Source document</span><p className="font-medium">{r.sourceDocument.documentNo}</p></div>
              <div><span className="text-slate-500">ERP entity</span><p className="font-medium">{r.sourceDocument.erpEntity}</p></div>
              <div><span className="text-slate-500">Created</span><p className="font-medium">{formatDateTime(r.createdAt)}</p></div>
              <div><span className="text-slate-500">Approver</span><p className="font-medium">{r.approverName ?? '—'}</p></div>
            </CardContent>
          </Card>

          <div className="portal-panel p-5">
            <h3 className="mb-4 font-semibold text-[var(--portal-navy)]">Approval workflow</h3>
            <ApprovalTimeline steps={r.approvalSteps} />
          </div>

          {r.payload && Object.keys(r.payload).length > 0 ? (
            <div className="portal-panel p-5">
              <h3 className="mb-3 font-semibold text-[var(--portal-navy)]">Payload</h3>
              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">{JSON.stringify(r.payload, null, 2)}</pre>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="portal-form-card">
            <div className="portal-form-card-header px-4 py-3 text-sm font-semibold text-white">Admin actions</div>
            <div className="space-y-3 p-4">
              <Textarea placeholder="Comment for audit trail…" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="success" size="sm" disabled={setStatus.isPending} onClick={() => setStatus.mutate('Approved')}>Approve</Button>
                <Button variant="destructive" size="sm" disabled={setStatus.isPending} onClick={() => setStatus.mutate('Rejected')}>Reject</Button>
                <Button variant="action" size="sm" disabled={setStatus.isPending} onClick={() => setStatus.mutate('Posted')}>Post</Button>
                <Button variant="outline" size="sm" disabled={setStatus.isPending} onClick={() => setStatus.mutate('Cancelled')}>Cancel</Button>
                <Button variant="secondary" size="sm" className="col-span-2" disabled={setStatus.isPending} onClick={() => setStatus.mutate('Draft')}>Revert to draft</Button>
              </div>
            </div>
          </div>

          <div className="portal-panel space-y-3 p-4">
            <p className="text-sm font-semibold text-slate-800">Reassign approver</p>
            <Select value={approver} onChange={(e) => setApprover(e.target.value)}>
              <option value="">Select employee</option>
              {(employees.data ?? []).map((emp) => (
                <option key={emp.id} value={emp.employeeNo}>{emp.displayName}</option>
              ))}
            </Select>
            <Button variant="default" size="sm" className="w-full" disabled={!approver || reassign.isPending} onClick={() => reassign.mutate()}>
              Reassign
            </Button>
          </div>

          <Button variant="destructive" size="sm" className="w-full" onClick={() => remove.mutate()}>
            <Trash2 className="h-4 w-4" /> Delete request
          </Button>
        </div>
      </div>
    </PageWrapper>
  )
}
