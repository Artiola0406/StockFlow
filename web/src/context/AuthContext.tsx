import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'administrator' | 'menaxher' | 'staf'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (page: string) => boolean
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  administrator: [
    'dashboard',
    'products',
    'warehouses',
    'stockmovements',
    'suppliers',
    'orders',
    'customers',
    'reports',
    'users',
  ],
  menaxher: [
    'dashboard',
    'products',
    'warehouses',
    'orders',
    'suppliers',
    'reports',
    'customers',
  ],
  staf: ['dashboard', 'stockmovements', 'products'],
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('stockflow_token')
    const savedUser = localStorage.getItem('stockflow_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      try {
        setUser(JSON.parse(savedUser) as User)
      } catch {
        localStorage.removeItem('stockflow_token')
        localStorage.removeItem('stockflow_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('stockflow_token', data.token)
    localStorage.setItem('stockflow_user', JSON.stringify(data.user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('stockflow_token')
    localStorage.removeItem('stockflow_user')
    window.location.href = '/login'
  }

  const hasPermission = (page: string): boolean => {
    if (!user) return false
    return ROLE_PERMISSIONS[user.role]?.includes(page) ?? false
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
