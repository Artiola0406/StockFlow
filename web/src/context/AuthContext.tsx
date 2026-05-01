import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

type Role = 'super_admin' | 'manager' | 'staff'

interface User {
  id: string
  name: string
  email: string
  role: Role | string
  tenant_id: number | string | null
  permissions?: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, businessName?: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
  hasPermission: (page: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: ['*'],
  manager: ['dashboard', 'products', 'warehouses', 'suppliers', 'orders', 'customers', 'reports', 'stockmovements'],
  staff: ['dashboard', 'products', 'stockmovements'],
}

function clearStoredSession() {
  localStorage.removeItem('stockflow_token')
  localStorage.removeItem('stockflow_user')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('stockflow_token')
    if (!savedToken) {
      setUser(null)
      setToken(null)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${savedToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        clearStoredSession()
        setUser(null)
        setToken(null)
        return
      }

      const data = (await res.json()) as User
      setUser(data)
      setToken(savedToken)
      localStorage.setItem('stockflow_user', JSON.stringify(data))
    } catch {
      clearStoredSession()
      setUser(null)
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      let data: { token?: string; user?: User; error?: string } = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (!data.token || !data.user) {
        throw new Error('Login failed')
      }

      localStorage.setItem('stockflow_token', data.token)
      localStorage.setItem('stockflow_user', JSON.stringify(data.user))
      setUser(data.user)
      setToken(data.token)
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to server')
      }
      throw error
    }
  }

  const register = async (name: string, email: string, password: string, businessName?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, businessName }),
      })

      let data: { error?: string } = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      return true
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to server')
      }
      throw error
    }
  }

  const logout = () => {
    clearStoredSession()
    setUser(null)
    setToken(null)
    navigate('/login', { replace: true })
  }

  const hasPermission = (page: string) => {
    if (!user) return false
    const role = (user.role || 'staff') as string
    const permissions = ROLE_PERMISSIONS[role] || []
    return permissions.includes('*') || permissions.includes(page)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isLoading: loading,
      login,
      register,
      logout,
      refreshUser,
      hasPermission,
    }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
