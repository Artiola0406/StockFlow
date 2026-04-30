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
    const token = localStorage.getItem('stockflow_token')
    const savedUser = localStorage.getItem('stockflow_user')
    
    if (!token) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      return
    }

    // Set user from localStorage immediately
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setToken(token)
      } catch (error) {
        console.error('Error parsing saved user:', error)
      }
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('stockflow_token')
          localStorage.removeItem('stockflow_user')
          setToken(null)
          setUser(null)
          window.location.href = '/login'
          return
        }
        throw new Error('Failed to fetch user data')
      }

      const result = await response.json()
      if (result.success) {
        const userData = result.data
        const user = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          user_role: userData.user_role || 'manager',
          tenant_id: userData.tenant_id || null
        }
        setUser(user)
        setToken(token)
        localStorage.setItem('stockflow_user', JSON.stringify(user))
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      localStorage.removeItem('stockflow_token')
      localStorage.removeItem('stockflow_user')
      setToken(null)
      setUser(null)
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

    const raw = await res.text()
    let data: any = {}
    try {
      data = raw ? JSON.parse(raw) : {}
    } catch {
      data = { message: raw || 'Login failed' }
    }
    console.log("LOGIN RESPONSE:", data)

    if (!res.ok) {
      throw new Error(data.message || 'Login failed')
    }

    if (!data.success) throw new Error(data.message)
    
    // Save token and user to localStorage
    localStorage.setItem('stockflow_token', data.token)
    localStorage.setItem('stockflow_user', JSON.stringify(data.user))
    
    // Set state directly from login response
    setUser(data.user)
    setToken(data.token)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('stockflow_token')
    localStorage.removeItem('stockflow_user')
    window.location.href = '/login'
  }

  const ROLE_PERMISSIONS: Record<string, string[]> = {
    super_admin: ['dashboard','products','warehouses','stockmovements',
      'suppliers','orders','customers','reports','users','tenants'],
    manager: ['dashboard','products','warehouses','suppliers',
      'orders','customers','reports','stockmovements'],
    staff: ['dashboard','products','stockmovements']
  }

  const hasPermission = (page: string): boolean => {
    if (!user) return false
    const userRole = user.user_role || 'staff'
    if (userRole === 'super_admin') return true
    return ROLE_PERMISSIONS[userRole]?.includes(page) ?? false
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
