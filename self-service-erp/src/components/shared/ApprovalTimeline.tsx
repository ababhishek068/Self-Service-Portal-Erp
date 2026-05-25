import { formatDateTime } from '@/utils/formatters'
import type { ApprovalStep } from '@/types/erp.types'
import { StatusBadge } from '@/components/shared/StatusBadge'

export function ApprovalTimeline({ steps }: { steps: ApprovalStep[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step.id} className="relative flex gap-3 pl-2">
          {index < steps.length - 1 ? <span className="absolute left-[11px] top-8 h-[calc(100%-8px)] w-0.5 bg-slate-200" aria-hidden /> : null}
          <span className="relative z-[1] mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--portal-navy)] text-[10px] font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-slate-900">{step.actorName}</p>
              <StatusBadge status={step.status} />
            </div>
            <p className="text-xs text-slate-500">
              {step.role} · {formatDateTime(step.timestamp)}
            </p>
            {step.note ? <p className="mt-2 text-sm text-slate-600">{step.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
