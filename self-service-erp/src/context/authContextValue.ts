import { createContext } from 'react'
import type { AdminRole } from '@/types/erp.types'

export interface AuthSession {
  id: string
  username: string
  displayName: string
  email: string
  role: AdminRole
}

/** Passed to datastore mutations for audit attribution */
export type AdminActor = Pick<AuthSession, 'displayName'>

export interface AuthContextValue {
  user: AuthSession | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
