import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'

export function Login() {
  const { isAuthenticated, login } = useAuth()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('demo')
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <main className="portal-login-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="portal-ambient pointer-events-none absolute inset-0" aria-hidden>
        <span className="portal-orb portal-orb-navy opacity-50" />
        <span className="portal-orb portal-orb-orange opacity-40" />
      </div>
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="animate-page-in mb-8 text-center">
          <div className="portal-logo-float mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 via-[var(--portal-navy)] to-[var(--portal-orange)] text-2xl font-bold text-white shadow-xl ring-4 ring-white/60">
            H
          </div>
          <h1 className="portal-page-title text-2xl font-bold">HIJRA BANK</h1>
          <p className="mt-2 text-lg font-semibold tracking-wide text-[var(--portal-navy)]">SELF SERVICE ERP</p>
          <p className="mt-1 text-sm text-slate-500">Enterprise administration console</p>
        </div>

        <div className="portal-form-card animate-page-in w-full" style={{ animationDelay: '80ms' }}>
          <div className="portal-form-card-header px-4 py-3 text-center font-semibold text-white">Administrator Sign In</div>
          <div className="p-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setError('')
                void login(username, password).catch(() => setError('Invalid username or password'))
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" className="portal-input" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" className="portal-input" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" variant="accent" className="w-full rounded-full">
                Enter console
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-500">
              Demo: <strong>admin</strong> / <strong>demo</strong> or <strong>finance</strong> / <strong>demo</strong>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
