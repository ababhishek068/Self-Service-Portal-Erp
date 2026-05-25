import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Banknote,
  BarChart3,
  Building2,
  Car,
  ChevronDown,
  ClipboardList,
  Database,
  FileText,
  Fuel,
  Gauge,
  Landmark,
  PackageCheck,
  Plane,
  ReceiptText,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react'
import type { PortalModuleKey } from '@/types/erp.types'

export interface NavItem {
  label: string
  path?: string
  icon: LucideIcon
  children?: NavItem[]
}

export const navigationMenu: NavItem[] = [
  { label: 'Command Center', path: '/', icon: Gauge },
  { label: 'All Requests', path: '/requests', icon: ClipboardList },
  {
    label: 'Finance',
    icon: Landmark,
    children: [
      { label: 'Imprest', path: '/finance/imprest', icon: Banknote },
      { label: 'Imprest Surrender', path: '/finance/imprest-surrender', icon: ReceiptText },
      { label: 'Staff Claims', path: '/finance/staff-claim', icon: FileText },
      { label: 'Petty Cash', path: '/finance/petty-cash', icon: Banknote },
    ],
  },
  {
    label: 'Facility',
    icon: Building2,
    children: [
      { label: 'Store Requisition', path: '/facility/store-requisition', icon: Store },
      { label: 'Purchase Requisition', path: '/facility/purchase-requisition', icon: ShoppingCart },
      { label: 'Fuel', path: '/facility/fuel-request', icon: Fuel },
      { label: 'Transport', path: '/facility/transport-request', icon: Car },
      { label: 'Maintenance', path: '/facility/maintenance-request', icon: Wrench },
      { label: 'Transfer Orders', path: '/facility/transfer-order', icon: PackageCheck },
      { label: 'Gate Pass', path: '/facility/gate-pass', icon: Building2 },
    ],
  },
  {
    label: 'Human Resources',
    icon: Users,
    children: [
      { label: 'Leave', path: '/hr/leave', icon: FileText },
      { label: 'Overtime', path: '/hr/overtime', icon: Activity },
      { label: 'Travel', path: '/hr/travel', icon: Plane },
    ],
  },
  {
    label: 'Master Data',
    icon: Database,
    children: [
      { label: 'Employees', path: '/master/employees', icon: UserCog },
      { label: 'Departments', path: '/master/departments', icon: Building2 },
      { label: 'Item Catalog', path: '/master/items', icon: Store },
    ],
  },
  { label: 'Workflow Rules', path: '/system/workflow', icon: Shield },
  { label: 'Audit Trail', path: '/system/audit', icon: BarChart3 },
  { label: 'System Settings', path: '/system/settings', icon: Settings },
  { label: 'Data Store', path: '/system/datastore', icon: Database },
]

export { ChevronDown }

export const moduleLabels: Record<PortalModuleKey, string> = {
  imprest: 'Imprest Requisition',
  imprestSurrender: 'Imprest Surrender',
  staffClaim: 'Staff Claims',
  pettyCash: 'Petty Cash',
  storeRequisition: 'Store Requisition',
  purchaseRequisition: 'Purchase Requisition',
  fuelRequest: 'Fuel Requisition',
  transport: 'Transport Requisition',
  maintenance: 'Maintenance Request',
  transferOrder: 'Transfer Orders',
  gatePass: 'Gate Pass',
  leave: 'Leave Requisition',
  overtime: 'Overtime Request',
  travel: 'Travel Request',
}

export const modulePaths: Record<PortalModuleKey, string> = {
  imprest: '/finance/imprest',
  imprestSurrender: '/finance/imprest-surrender',
  staffClaim: '/finance/staff-claim',
  pettyCash: '/finance/petty-cash',
  storeRequisition: '/facility/store-requisition',
  purchaseRequisition: '/facility/purchase-requisition',
  fuelRequest: '/facility/fuel-request',
  transport: '/facility/transport-request',
  maintenance: '/facility/maintenance-request',
  transferOrder: '/facility/transfer-order',
  gatePass: '/facility/gate-pass',
  leave: '/hr/leave',
  overtime: '/hr/overtime',
  travel: '/hr/travel',
}

export const financeModules: PortalModuleKey[] = ['imprest', 'imprestSurrender', 'staffClaim', 'pettyCash']
export const facilityModules: PortalModuleKey[] = [
  'storeRequisition',
  'purchaseRequisition',
  'fuelRequest',
  'transport',
  'maintenance',
  'transferOrder',
  'gatePass',
]
export const hrModules: PortalModuleKey[] = ['leave', 'overtime', 'travel']

export const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  finance_admin: 'Finance Admin',
  hr_admin: 'HR Admin',
  facility_admin: 'Facility Admin',
  auditor: 'Auditor',
}
