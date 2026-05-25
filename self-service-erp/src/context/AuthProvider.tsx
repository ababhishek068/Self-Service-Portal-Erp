import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { dbAuthenticate } from '@/data/database'
import { AuthContext, type AuthSession } from '@/context/authContextValue'

const SESSION_KEY = 'hijra-erp-session'

function readSession(): AuthSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(() => readSession())

  const login = useCallback(async (username: string, password: string) => {
    const session = await dbAuthenticate(username, password)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
