import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { dbGetSettings, dbSaveSettings } from '@/data/database'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import type { SystemSettings } from '@/types/erp.types'

export function Settings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const settings = useQuery({ queryKey: ['settings'], queryFn: dbGetSettings })
  const [form, setForm] = useState<SystemSettings | null>(null)

  useEffect(() => {
    if (settings.data) setForm(settings.data)
  }, [settings.data])

  const save = useMutation({
    mutationFn: () => dbSaveSettings(form!, user!),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })

  if (!form) return null

  return (
    <PageWrapper title="System Settings" description="Global ERP configuration — portal API URL will connect here when your backend is ready.">
      <div className="portal-form-card max-w-xl">
        <div className="portal-form-card-header px-4 py-3 font-semibold text-white">Configuration</div>
        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <div><Label>Organization</Label><Input value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} /></div>
          <div><Label>Fiscal year</Label><Input value={form.fiscalYear} onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })} /></div>
          <div><Label>Request prefix</Label><Input value={form.requestPrefix} onChange={(e) => setForm({ ...form, requestPrefix: e.target.value })} /></div>
          <div>
            <Label>Portal / API base URL</Label>
            <Input placeholder="https://api.your-backend.com" value={form.apiBaseUrl} onChange={(e) => setForm({ ...form, apiBaseUrl: e.target.value })} />
            <p className="mt-1 text-xs text-slate-500">Leave empty until your Self Service backend is deployed.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.autoPostApproved} onChange={(e) => setForm({ ...form, autoPostApproved: e.target.checked })} />
            Auto-post approved documents
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.allowBackdating} onChange={(e) => setForm({ ...form, allowBackdating: e.target.checked })} />
            Allow backdating on requests
          </label>
          <Button type="submit" variant="accent">Save settings</Button>
        </form>
      </div>
    </PageWrapper>
  )
}
