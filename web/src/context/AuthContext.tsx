import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  user_role: 'super_admin' | 'manager' | 'staff';
  tenant_id: string | null;
  tenant_name?: string;
  permissions?: string[];
}
interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (page: string) => boolean
  refreshUser: () => Promise<void>
}


const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('stockflow_token')
    if (!savedToken) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()

      if (data.success) {
        setUser(data.data)
        setToken(savedToken)
        localStorage.setItem('stockflow_user', JSON.stringify(data.data))
      } else if (res.status === 401 || !data.success) {
        localStorage.removeItem('stockflow_token')
        localStorage.removeItem('stockflow_user')
        setUser(null)
        setToken(null)
      }
    } catch (error) {
      console.error('Gabim gjatë marrjes së përdoruesit:', error)
      localStorage.removeItem('stockflow_token')
      localStorage.removeItem('stockflow_user')
      setUser(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Kyçja dështoi.')
    }
    
    // Save token and user to localStorage
    localStorage.setItem('stockflow_token', data.token)
    localStorage.setItem('stockflow_user', JSON.stringify(data.user))
    
    // Set state directly from login response
    setUser(data.user)
    setToken(data.token)
  }

  const logout = () => {
    localStorage.removeItem('stockflow_token')
    localStorage.removeItem('stockflow_user')
    setUser(null)
    setToken(null)
    window.location.href = '/login'
  }

  const hasPermission = (page: string): boolean => {
    const ROLE_PERMISSIONS = {
      super_admin: ['dashboard','products','warehouses','stockmovements','suppliers','orders','customers','reports','users','tenants'],
      manager: ['dashboard','products','warehouses','suppliers','orders','customers','reports','stockmovements'],
      staff: ['dashboard','products','stockmovements']
    }
    if (!user) return false
    const role = user.user_role || 'staff'
    if (role === 'super_admin') return true
    return ROLE_PERMISSIONS[role]?.includes(page) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasPermission, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
