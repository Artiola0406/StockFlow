import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Package, Eye, EyeOff, AlertCircle, Loader2, Building2, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'

export function RegisterPage() {
  const { user, isLoading: authLoading, login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#22d3ee] border-t-transparent" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword || !businessName) {
      setError('Të gjitha fushat janë të detyrueshme')
      return false
    }
    if (password.length < 8) {
      setError('Fjalëkalimi duhet të ketë të paktën 8 karaktere')
      return false
    }
    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Email nuk është i vlefshëm')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, businessName }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Regjistrimi dështoi')
      }

      const data = await response.json()
      if (!data.success) throw new Error(data.message)

      // Auto-login after successful registration
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regjistrimi dështoi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-[#e2e8f0]">
      <div
        className="pointer-events-none absolute inset-0 animate-cyber-gradient opacity-90"
        style={{
          background:
            'linear-gradient(125deg, #030712 0%, #0f172a 25%, #1e1b4b 50%, #0c4a6e 75%, #030712 100%)',
          backgroundSize: '200% 200%',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-[#334155] bg-[#0f172a]/80 backdrop-blur-xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-[#22d3ee] bg-[#030712] shadow-lg shadow-[#22d3ee]/20">
                <Package className="h-8 w-8 text-[#22d3ee]" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[#e2e8f0] mb-2">Krijo Llogarinë</h1>
              <p className="text-[#94a3b8]">
                Regjistro biznesin tënd për të filluar menaxhimin e inventarit
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 rounded-lg border border-[#ef4444]/20 bg-[#ef4444]/10 p-4">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#ef4444]" />
                  <p className="text-sm text-[#ef4444]">{error}</p>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#e2e8f0]">
                    Emri juaj
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748b]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(
                        'w-full rounded-lg border border-[#334155] bg-[#0f172a] pl-10 pr-4 py-3 text-[#e2e8f0] transition-all',
                        'placeholder:text-[#64748b]',
                        'focus:border-[#22d3ee] focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/20'
                      )}
                      placeholder="Shkruani emrin tuaj"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#e2e8f0]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748b]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        'w-full rounded-lg border border-[#334155] bg-[#0f172a] pl-10 pr-4 py-3 text-[#e2e8f0] transition-all',
                        'placeholder:text-[#64748b]',
                        'focus:border-[#22d3ee] focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/20'
                      )}
                      placeholder="email@shembull.com"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#e2e8f0]">
                  Emri i Biznesit
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748b]" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={cn(
                      'w-full rounded-lg border border-[#334155] bg-[#0f172a] pl-10 pr-4 py-3 text-[#e2e8f0] transition-all',
                      'placeholder:text-[#64748b]',
                      'focus:border-[#22d3ee] focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/20'
                    )}
                    placeholder="Studio i Thonjve Erta"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#e2e8f0]">
                    Fjalëkalimi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748b]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        'w-full rounded-lg border border-[#334155] bg-[#0f172a] pl-10 pr-12 py-3 text-[#e2e8f0] transition-all',
                        'placeholder:text-[#64748b]',
                        'focus:border-[#22d3ee] focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/20'
                      )}
                      placeholder="Të paktën 8 karaktere"
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] transition-colors hover:text-[#e2e8f0]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#e2e8f0]">
                    Konfirmo Fjalëkalimin
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748b]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(
                        'w-full rounded-lg border border-[#334155] bg-[#0f172a] pl-10 pr-12 py-3 text-[#e2e8f0] transition-all',
                        'placeholder:text-[#64748b]',
                        'focus:border-[#22d3ee] focus:outline-none focus:ring-2 focus:ring-[#22d3ee]/20'
                      )}
                      placeholder="Përsëritni fjalëkalimin"
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] transition-colors hover:text-[#e2e8f0]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  'w-full rounded-lg py-3 font-semibold transition-all',
                  'bg-gradient-to-r from-[#22d3ee] to-[#a855f7] text-white',
                  'shadow-lg shadow-[#22d3ee]/20',
                  'hover:shadow-[#22d3ee]/30 hover:from-[#06b6d4] hover:to-[#9333ea]',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'flex items-center justify-center gap-2'
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Duke regjistruar...
                  </>
                ) : (
                  'Krijo Llogarinë'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-[#94a3b8]">
                Keni llogari?{' '}
                <a
                  href="/login"
                  className="font-semibold text-[#22d3ee] transition-colors hover:text-[#06b6d4]"
                >
                  Kyçuni
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
