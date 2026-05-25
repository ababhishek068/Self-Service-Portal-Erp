import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { requestStatuses } from '@/types/erp.types'

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  status?: string
  onStatusChange?: (value: string) => void
  department?: string
  onDepartmentChange?: (value: string) => void
  departments?: { code: string; name: string }[]
  extra?: ReactNode
}

export function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  department,
  onDepartmentChange,
  departments,
  extra,
}: FilterBarProps) {
  return (
    <div className="portal-panel flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-[200px] flex-1">
        <label className="mb-1 block text-xs font-semibold text-slate-600">Search</label>
        <Input className="portal-input" placeholder="Request no, title, employee…" value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      {onStatusChange ? (
        <div className="w-44">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
          <Select value={status ?? ''} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="">All statuses</option>
            {requestStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      {onDepartmentChange && departments ? (
        <div className="w-48">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Department</label>
          <Select value={department ?? ''} onChange={(e) => onDepartmentChange(e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      {extra}
    </div>
  )
}
