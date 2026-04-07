import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: React.ReactNode
  requiredPage?: string
}

export function ProtectedRoute({ children, requiredPage }: Props) {
  const { user, isLoading, hasPermission } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-void">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neon-cyan border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requiredPage && !hasPermission(requiredPage)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
