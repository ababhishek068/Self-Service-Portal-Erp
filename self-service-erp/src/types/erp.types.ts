export const requestStatuses = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Rejected',
  'Cancelled',
  'Posted',
] as const

export type RequestStatus = (typeof requestStatuses)[number]

export type BadgeStatus =
  | RequestStatus
  | 'Pass'
  | 'Fail'
  | 'Pending'
  | 'Open'
  | 'Synced'
  | 'Error'
  | 'Active'
  | 'Inactive'

export type AdminRole = 'super_admin' | 'finance_admin' | 'hr_admin' | 'facility_admin' | 'auditor'

export interface AdminUser {
  id: string
  username: string
  displayName: string
  email: string
  role: AdminRole
  password: string
}

export interface Department {
  code: string
  name: string
  branchCode: string
  spendingLimit: number
  isActive: boolean
}

export interface ItemMaster {
  code: string
  description: string
  uom: string
  stock: number
  unitPrice: number
  categoryCode: string
  isFixedAsset: boolean
  isActive: boolean
}

export interface Employee {
  id: string
  employeeNo: string
  displayName: string
  email: string
  departmentCode: string
  departmentName: string
  branchCode: string
  branchName: string
  jobTitle: string
  jobGrade: string
  placeOfDuty: string
  accountNumber: string
  managerEmployeeNo: string
  leaveBalance: number
  responsibleCenter: string
  permissionDepartments: string[]
  isActive: boolean
}

export interface Attachment {
  id: string
  fileName: string
  fileType: string
  size: number
  progress: number
  uploadedAt: string
}

export interface ApprovalStep {
  id: string
  actorEmployeeNo: string
  actorName: string
  role: 'Maker' | 'Checker' | 'Finance' | 'Facility' | 'HR' | 'System' | 'Admin'
  status: RequestStatus | 'Submitted'
  timestamp: string
  note?: string
}

export interface AuditTrailEntry {
  id: string
  actorEmployeeNo: string
  actorName: string
  action: string
  timestamp: string
  comment?: string
}

export interface SourceDocument {
  documentNo: string
  externalDocumentNo?: string
  erpEntity: string
  erpId?: string
  postedAt?: string
}

export interface BaseRequest {
  id: string
  requestNo: string
  requestType: PortalModuleKey
  title: string
  status: RequestStatus
  makerEmployeeNo: string
  makerName: string
  departmentCode: string
  departmentName: string
  responsibleCenter: string
  amount: number
  sourceDocument: SourceDocument
  createdAt: string
  submittedAt?: string
  approverEmployeeNo?: string
  approverName?: string
  auditTrail: AuditTrailEntry[]
  approvalSteps: ApprovalStep[]
  attachments: Attachment[]
  payload?: Record<string, unknown>
}

export type PortalRequest = BaseRequest

export interface ApprovalQueueItem {
  id: string
  requestNo: string
  module: string
  title: string
  makerEmployeeNo: string
  makerName: string
  amount: number
  status: RequestStatus
  submittedAt: string
  approverEmployeeNo: string
  sourceDocumentNo: string
}

export type PortalModuleKey =
  | 'imprest'
  | 'imprestSurrender'
  | 'staffClaim'
  | 'pettyCash'
  | 'storeRequisition'
  | 'purchaseRequisition'
  | 'fuelRequest'
  | 'transport'
  | 'maintenance'
  | 'transferOrder'
  | 'gatePass'
  | 'leave'
  | 'overtime'
  | 'travel'

export interface ApprovalRule {
  id: string
  module: PortalModuleKey
  departmentCode: string
  minAmount: number
  maxAmount: number
  checkerRole: string
  isActive: boolean
}

export interface SystemSettings {
  organizationName: string
  fiscalYear: string
  defaultCurrency: string
  requestPrefix: string
  autoPostApproved: boolean
  allowBackdating: boolean
  apiBaseUrl: string
}

export interface GlobalAuditEntry {
  id: string
  category: 'request' | 'employee' | 'master' | 'system' | 'auth'
  action: string
  actor: string
  entityId?: string
  entityLabel?: string
  timestamp: string
  details?: string
}

export interface ErpDatabase {
  version: number
  employees: Employee[]
  departments: Department[]
  items: ItemMaster[]
  requests: PortalRequest[]
  approvalRules: ApprovalRule[]
  systemSettings: SystemSettings
  auditLog: GlobalAuditEntry[]
  documentSequence: number
  adminUsers: AdminUser[]
}

export interface DashboardSummary {
  totalRequests: number
  pendingApprovals: number
  approvedToday: number
  postedThisMonth: number
  activeEmployees: number
  lowStockItems: number
  requestsByStatus: Record<RequestStatus, number>
  requestsByModule: { module: string; count: number }[]
  recentActivity: PortalRequest[]
  syncHealth: { label: string; status: 'ok' | 'warn' | 'error'; detail: string }[]
}
