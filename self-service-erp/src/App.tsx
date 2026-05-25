import { Navigate, Route, Routes } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { MainContent } from '@/components/layout/MainContent'
import { MobileNav } from '@/components/layout/MobileNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { LayoutProvider } from '@/context/LayoutContext'
import { useAuth } from '@/hooks/useAuth'
import { Login } from '@/pages/auth/Login'
import { Dashboard } from '@/pages/dashboard/Dashboard'
import { Departments } from '@/pages/master/Departments'
import { Employees } from '@/pages/master/Employees'
import { Items } from '@/pages/master/Items'
import { ModuleHub } from '@/pages/modules/ModuleHub'
import { AllRequests } from '@/pages/requests/AllRequests'
import { RequestDetail } from '@/pages/requests/RequestDetail'
import { AuditLog } from '@/pages/system/AuditLog'
import { DataStore } from '@/pages/system/DataStore'
import { Settings } from '@/pages/system/Settings'
import { Workflow } from '@/pages/system/Workflow'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <LayoutProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Topbar />
            <MobileNav />
            <MainContent />
          </div>
        </div>
        <Footer />
      </div>
    </LayoutProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="requests" element={<AllRequests />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="finance/imprest" element={<ModuleHub module="imprest" />} />
        <Route path="finance/imprest-surrender" element={<ModuleHub module="imprestSurrender" />} />
        <Route path="finance/staff-claim" element={<ModuleHub module="staffClaim" />} />
        <Route path="finance/petty-cash" element={<ModuleHub module="pettyCash" />} />
        <Route path="facility/store-requisition" element={<ModuleHub module="storeRequisition" />} />
        <Route path="facility/purchase-requisition" element={<ModuleHub module="purchaseRequisition" />} />
        <Route path="facility/fuel-request" element={<ModuleHub module="fuelRequest" />} />
        <Route path="facility/transport-request" element={<ModuleHub module="transport" />} />
        <Route path="facility/maintenance-request" element={<ModuleHub module="maintenance" />} />
        <Route path="facility/transfer-order" element={<ModuleHub module="transferOrder" />} />
        <Route path="facility/gate-pass" element={<ModuleHub module="gatePass" />} />
        <Route path="hr/leave" element={<ModuleHub module="leave" />} />
        <Route path="hr/overtime" element={<ModuleHub module="overtime" />} />
        <Route path="hr/travel" element={<ModuleHub module="travel" />} />
        <Route path="master/employees" element={<Employees />} />
        <Route path="master/departments" element={<Departments />} />
        <Route path="master/items" element={<Items />} />
        <Route path="system/workflow" element={<Workflow />} />
        <Route path="system/audit" element={<AuditLog />} />
        <Route path="system/settings" element={<Settings />} />
        <Route path="system/datastore" element={<DataStore />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
