import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Download, RefreshCcw, Upload } from 'lucide-react'
import { exportDatabaseJson, loadDatabase, resetDatabase, saveDatabase } from '@/data/database'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/button'
import type { ErpDatabase } from '@/types/erp.types'

export function DataStore() {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState('')
  const db = loadDatabase()

  const refresh = () => {
    void queryClient.invalidateQueries()
    setMessage('Cache refreshed — UI synced with local datastore.')
  }

  const download = () => {
    const blob = new Blob([exportDatabaseJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hijra-erp-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('Database exported.')
  }

  const reset = () => {
    if (!window.confirm('Reset all data to seed defaults? This cannot be undone.')) return
    resetDatabase()
    refresh()
    setMessage('Database reset to factory seed.')
  }

  const importJson = (text: string) => {
    const parsed = JSON.parse(text) as ErpDatabase
    saveDatabase(parsed)
    refresh()
    setMessage('Database imported successfully.')
  }

  return (
    <PageWrapper
      title="Data Store"
      description="This browser-local database acts as your ERP until the Self Service API is connected. Export, import, or reset as needed."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="portal-panel p-5">
          <h2 className="mb-4 font-semibold text-[var(--portal-navy)]">Current snapshot</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-500">Employees</dt><dd className="font-bold">{db.employees.length}</dd></div>
            <div><dt className="text-slate-500">Requests</dt><dd className="font-bold">{db.requests.length}</dd></div>
            <div><dt className="text-slate-500">Items</dt><dd className="font-bold">{db.items.length}</dd></div>
            <div><dt className="text-slate-500">Audit entries</dt><dd className="font-bold">{db.auditLog.length}</dd></div>
          </dl>
          {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
        </div>

        <div className="portal-panel space-y-3 p-5">
          <h2 className="font-semibold text-[var(--portal-navy)]">Operations</h2>
          <Button variant="default" className="w-full justify-start" onClick={refresh}>
            <RefreshCcw className="h-4 w-4" /> Refresh UI from store
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={download}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <Button variant="destructive" className="w-full justify-start" onClick={reset}>
            <RefreshCcw className="h-4 w-4" /> Reset to seed data
          </Button>
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            Import JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  try {
                    importJson(String(reader.result))
                  } catch {
                    setMessage('Invalid JSON file.')
                  }
                }
                reader.readAsText(file)
              }}
            />
          </label>
        </div>
      </div>

      <div className="portal-panel mt-6 p-5 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Future backend integration</p>
        <p className="mt-2">
          When your Self Service API is ready, point <strong>System Settings → Portal API URL</strong> to it and replace
          <code className="mx-1 rounded bg-slate-100 px-1">src/data/database.ts</code> calls with HTTP fetch — the UI and types already match portal modules.
        </p>
      </div>
    </PageWrapper>
  )
}
