import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'administrator' | 'menaxher' | 'staf'
  permissions: string[]
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
    if (!token) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      return
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
        setUser({
          id: userData.id.toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions || []
        })
        setToken(token)
        localStorage.setItem('stockflow_user', JSON.stringify({
          id: userData.id.toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions || []
        }))
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
    
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Login failed')
    }
    
    const data = await res.json()
    if (!data.success) throw new Error(data.message)
    
    setToken(data.token)
    localStorage.setItem('stockflow_token', data.token)
    
    // Fetch user data with permissions
    await refreshUser()
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('stockflow_token')
    localStorage.removeItem('stockflow_user')
    window.location.href = '/login'
  }

  const hasPermission = (page: string): boolean => {
    if (!user || !user.permissions) return false
    return user.permissions.includes(page)
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
