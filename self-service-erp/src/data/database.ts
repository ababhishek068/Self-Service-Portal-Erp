import { formatISO } from 'date-fns'
import { createSeedDatabase } from '@/data/seed'
import type { AdminActor } from '@/context/authContextValue'
import type {
  ApprovalRule,
  Department,
  Employee,
  ErpDatabase,
  GlobalAuditEntry,
  ItemMaster,
  PortalModuleKey,
  RequestStatus,
  SystemSettings,
} from '@/types/erp.types'
import { moduleLabels } from '@/utils/constants'

const STORAGE_KEY = 'hijra-self-service-erp-v1'

export function loadDatabase(): ErpDatabase {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = createSeedDatabase()
    saveDatabase(seed)
    return seed
  }
  try {
    return JSON.parse(raw) as ErpDatabase
  } catch {
    const seed = createSeedDatabase()
    saveDatabase(seed)
    return seed
  }
}

export function saveDatabase(db: ErpDatabase) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export function resetDatabase() {
  localStorage.removeItem(STORAGE_KEY)
  return loadDatabase()
}

export function exportDatabaseJson(): string {
  return JSON.stringify(loadDatabase(), null, 2)
}

const delay = <T>(value: T, ms = 280) => new Promise<T>((resolve) => window.setTimeout(() => resolve(value), ms))

function mutate(mutator: (db: ErpDatabase) => void) {
  const db = loadDatabase()
  mutator(db)
  saveDatabase(db)
  return db
}

function audit(
  db: ErpDatabase,
  entry: Omit<GlobalAuditEntry, 'id' | 'timestamp'> & { timestamp?: string },
) {
  db.auditLog.unshift({
    id: `log-${crypto.randomUUID()}`,
    timestamp: entry.timestamp ?? formatISO(new Date()),
    ...entry,
  })
  if (db.auditLog.length > 500) db.auditLog = db.auditLog.slice(0, 500)
}

function nextDocumentNo(db: ErpDatabase, prefix: string) {
  db.documentSequence += 1
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${String(db.documentSequence).padStart(5, '0')}`
}

export async function dbGetDashboard() {
  const db = loadDatabase()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const requestsByStatus = db.requests.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1
      return acc
    },
    {} as Record<RequestStatus, number>,
  )

  const moduleCounts = new Map<string, number>()
  for (const r of db.requests) {
    const label = moduleLabels[r.requestType]
    moduleCounts.set(label, (moduleCounts.get(label) ?? 0) + 1)
  }

  return delay({
    totalRequests: db.requests.length,
    pendingApprovals: db.requests.filter((r) => r.status === 'Pending Approval').length,
    approvedToday: db.requests.filter((r) => {
      if (r.status !== 'Approved' && r.status !== 'Posted') return false
      const last = r.approvalSteps.at(-1)?.timestamp
      return last ? new Date(last) >= todayStart : false
    }).length,
    postedThisMonth: db.requests.filter((r) => r.status === 'Posted').length,
    activeEmployees: db.employees.filter((e) => e.isActive).length,
    lowStockItems: db.items.filter((i) => i.isActive && i.stock < 50 && !i.isFixedAsset).length,
    requestsByStatus,
    requestsByModule: [...moduleCounts.entries()].map(([module, count]) => ({ module, count })),
    recentActivity: [...db.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    syncHealth: [
      { label: 'Local datastore', status: 'ok' as const, detail: 'All records persisted in browser storage' },
      { label: 'Portal API', status: 'warn' as const, detail: 'Not connected — configure apiBaseUrl when backend is ready' },
      { label: 'Posting queue', status: 'ok' as const, detail: `${db.requests.filter((r) => r.status === 'Approved').length} approved awaiting post` },
    ],
  })
}

export async function dbListRequests(filters?: {
  module?: PortalModuleKey
  status?: RequestStatus
  departmentCode?: string
  search?: string
}) {
  const db = loadDatabase()
  let rows = [...db.requests]
  if (filters?.module) rows = rows.filter((r) => r.requestType === filters.module)
  if (filters?.status) rows = rows.filter((r) => r.status === filters.status)
  if (filters?.departmentCode) rows = rows.filter((r) => r.departmentCode === filters.departmentCode)
  if (filters?.search) {
    const q = filters.search.toLowerCase()
    rows = rows.filter(
      (r) =>
        r.requestNo.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.makerName.toLowerCase().includes(q) ||
        r.makerEmployeeNo.toLowerCase().includes(q),
    )
  }
  return delay(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
}

export async function dbGetRequest(id: string) {
  const db = loadDatabase()
  const request = db.requests.find((r) => r.id === id)
  if (!request) throw new Error('Request not found')
  return delay(request)
}

export async function dbUpdateRequestStatus(
  id: string,
  status: RequestStatus,
  actor: AdminActor,
  note?: string,
) {
  mutate((db) => {
    const request = db.requests.find((r) => r.id === id)
    if (!request) throw new Error('Request not found')
    request.status = status
    const step = {
      id: `step-${crypto.randomUUID()}`,
      actorEmployeeNo: 'ERP-ADMIN',
      actorName: actor.displayName,
      role: 'Admin' as const,
      status,
      timestamp: formatISO(new Date()),
      note,
    }
    request.approvalSteps.push(step)
    request.auditTrail.push({
      id: `audit-${crypto.randomUUID()}`,
      actorEmployeeNo: 'ERP-ADMIN',
      actorName: actor.displayName,
      action: `Admin set status to ${status}`,
      timestamp: formatISO(new Date()),
      comment: note,
    })
    if (status === 'Posted') {
      request.sourceDocument.postedAt = formatISO(new Date())
      request.sourceDocument.documentNo = nextDocumentNo(db, 'POST')
    }
    audit(db, {
      category: 'request',
      action: `Status → ${status}`,
      actor: actor.displayName,
      entityId: id,
      entityLabel: request.requestNo,
      details: note,
    })
  })
  return dbGetRequest(id)
}

export async function dbReassignApprover(id: string, employeeNo: string, actor: AdminActor) {
  mutate((db) => {
    const request = db.requests.find((r) => r.id === id)
    if (!request) throw new Error('Request not found')
    const emp = db.employees.find((e) => e.employeeNo === employeeNo)
    if (!emp) throw new Error('Employee not found')
    request.approverEmployeeNo = emp.employeeNo
    request.approverName = emp.displayName
    request.auditTrail.push({
      id: `audit-${crypto.randomUUID()}`,
      actorEmployeeNo: 'ERP-ADMIN',
      actorName: actor.displayName,
      action: `Reassigned approver to ${emp.displayName}`,
      timestamp: formatISO(new Date()),
    })
    audit(db, { category: 'request', action: 'Approver reassigned', actor: actor.displayName, entityId: id, entityLabel: request.requestNo })
  })
  return dbGetRequest(id)
}

export async function dbDeleteRequest(id: string, actor: AdminActor) {
  mutate((db) => {
    const idx = db.requests.findIndex((r) => r.id === id)
    if (idx < 0) throw new Error('Request not found')
    const [removed] = db.requests.splice(idx, 1)
    audit(db, { category: 'request', action: 'Request deleted', actor: actor.displayName, entityId: id, entityLabel: removed.requestNo })
  })
  return delay(true)
}

export async function dbListEmployees() {
  const db = loadDatabase()
  return delay([...db.employees].sort((a, b) => a.displayName.localeCompare(b.displayName)))
}

export async function dbUpsertEmployee(employee: Employee, actor: AdminActor) {
  mutate((db) => {
    const idx = db.employees.findIndex((e) => e.id === employee.id)
    if (idx >= 0) db.employees[idx] = employee
    else db.employees.push(employee)
    audit(db, {
      category: 'employee',
      action: idx >= 0 ? 'Employee updated' : 'Employee created',
      actor: actor.displayName,
      entityId: employee.id,
      entityLabel: employee.employeeNo,
    })
  })
  return delay(employee)
}

export async function dbListDepartments() {
  return delay(loadDatabase().departments)
}

export async function dbUpsertDepartment(department: Department, actor: AdminActor) {
  mutate((db) => {
    const idx = db.departments.findIndex((d) => d.code === department.code)
    if (idx >= 0) db.departments[idx] = department
    else db.departments.push(department)
    audit(db, { category: 'master', action: 'Department saved', actor: actor.displayName, entityLabel: department.code })
  })
  return delay(department)
}

export async function dbListItems() {
  return delay(loadDatabase().items)
}

export async function dbUpsertItem(item: ItemMaster, actor: AdminActor) {
  mutate((db) => {
    const idx = db.items.findIndex((i) => i.code === item.code)
    if (idx >= 0) db.items[idx] = item
    else db.items.push(item)
    audit(db, { category: 'master', action: 'Item saved', actor: actor.displayName, entityLabel: item.code })
  })
  return delay(item)
}

export async function dbAdjustStock(code: string, delta: number, actor: AdminActor) {
  mutate((db) => {
    const item = db.items.find((i) => i.code === code)
    if (!item) throw new Error('Item not found')
    item.stock = Math.max(0, item.stock + delta)
    audit(db, { category: 'master', action: `Stock adjusted by ${delta}`, actor: actor.displayName, entityLabel: code, details: `New stock: ${item.stock}` })
  })
  return delay(true)
}

export async function dbListApprovalRules() {
  return delay(loadDatabase().approvalRules)
}

export async function dbUpsertApprovalRule(rule: ApprovalRule, actor: AdminActor) {
  mutate((db) => {
    const idx = db.approvalRules.findIndex((r) => r.id === rule.id)
    if (idx >= 0) db.approvalRules[idx] = rule
    else db.approvalRules.push(rule)
    audit(db, { category: 'system', action: 'Workflow rule saved', actor: actor.displayName, entityId: rule.id })
  })
  return delay(rule)
}

export async function dbGetSettings() {
  return delay(loadDatabase().systemSettings)
}

export async function dbSaveSettings(settings: SystemSettings, actor: AdminActor) {
  mutate((db) => {
    db.systemSettings = settings
    audit(db, { category: 'system', action: 'Settings updated', actor: actor.displayName })
  })
  return delay(settings)
}

export async function dbListAuditLog() {
  return delay(loadDatabase().auditLog)
}

export async function dbAuthenticate(username: string, password: string) {
  const db = loadDatabase()
  const user = db.adminUsers.find((u) => u.username === username && u.password === password)
  if (!user) throw new Error('Invalid credentials')
  audit(db, { category: 'auth', action: 'Admin signed in', actor: user.displayName })
  saveDatabase(db)
  return delay({ id: user.id, username: user.username, displayName: user.displayName, email: user.email, role: user.role })
}

export type SafeAdminUser = Awaited<ReturnType<typeof dbAuthenticate>>
