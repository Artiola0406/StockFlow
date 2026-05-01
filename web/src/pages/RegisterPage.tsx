import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Package, Eye, EyeOff, AlertCircle, Loader2, User, Mail, Building, Lock } from 'lucide-react'
import { cn } from '../lib/cn'

export function RegisterPage() {
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

  const validateForm = () => {
    if (!name?.trim()) {
      setError('Emri është i detyrueshëm')
      return false
    }
    if (!email?.trim()) {
      setError('Email është i detyrueshëm')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Email nuk është i vlefshëm')
      return false
    }
    if (!businessName?.trim()) {
      setError('Emri i biznesit është i detyrueshëm')
      return false
    }
    if (!password || password.length < 6) {
      setError('Fjalëkalimi duhet të ketë së paku 6 karaktere')
      return false
    }
    if (password !== confirmPassword) {
      setError('Fjalëkalimet nuk përputhen')
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
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          password, 
          businessName: businessName.trim() 
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Regjistrimi dështoi')
        return
      }

      // Store token and user to localStorage, then redirect to dashboard
      localStorage.setItem('stockflow_token', data.token)
      localStorage.setItem('stockflow_user', JSON.stringify(data.user))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regjistrimi dështoi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-[#e2e8f0]">
      {/* Animated background effects */}
      <div
        className="pointer-events-none absolute inset-0 animate-cyber-gradient opacity-90"
        style={{
          background:
            'linear-gradient(125deg, #030712 0%, #0f172a 25%, #1e1b4b 50%, #0c4a6e 75%, #030712 100%)',
          backgroundSize: '200% 200%',
        }}
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[55vh] w-[55vh] rounded-full opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(56,189,248,0.35) 0%, transparent 65%)',
          animation: 'cyber-pulse-glow 8s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 h-[50vh] w-[50vh] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 68%)',
          animation: 'cyber-pulse-glow 10s ease-in-out infinite 1s',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30h60M30 0v60' stroke='%2338bdf8' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div
          className={cn(
            'w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur-xl',
            'shadow-[0_0_60px_rgba(34,211,238,0.08)]',
          )}
        >
          {/* Logo and Header */}
          <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
            <div className="relative mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-fuchsia-600 shadow-[0_0_24px_rgba(56,189,248,0.45)]">
              <Package className="h-6 w-6 sm:h-7 sm:w-7 text-white" strokeWidth={2} />
              <span className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
            </div>
            <h1
              className="bg-gradient-to-r from-[#22d3ee] via-[#38bdf8] to-[#a78bfa] bg-clip-text text-2xl sm:text-3xl font-bold tracking-tight text-transparent"
              style={{ WebkitBackgroundClip: 'text' }}
            >
              StockFlow
            </h1>
            <p className="mt-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              NEURAL INVENTORY SYSTEM
            </p>
            <h2 className="mt-4 sm:mt-6 text-lg sm:text-xl font-semibold text-slate-100">Krijo Llogarinë</h2>
            <p className="mt-1 text-sm text-slate-400">Regjistro biznesin tënd për të filluar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 sm:px-4 py-3 text-sm text-[#f87171]"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Regjistrimi dështoi</p>
                  <p className="mt-0.5 text-red-200/90">{error}</p>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label htmlFor="register-name" className="mb-1.5 block text-xs font-medium text-slate-400">
                Emri juaj
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5" />
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Shkruani emrin tuaj"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3 text-sm text-slate-100 placeholder:text-slate-500',
                    'outline-none transition-shadow focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30',
                    'disabled:opacity-50'
                  )}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-xs font-medium text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5" />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@shembull.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3 text-sm text-slate-100 placeholder:text-slate-500',
                    'outline-none transition-shadow focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30',
                    'disabled:opacity-50'
                  )}
                />
              </div>
            </div>

            {/* Business Name Field */}
            <div>
              <label htmlFor="register-business" className="mb-1.5 block text-xs font-medium text-slate-400">
                Emri i Biznesit
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5" />
                <input
                  id="register-business"
                  type="text"
                  autoComplete="organization"
                  placeholder="Studio i Thonjve Erta"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={submitting}
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3 text-sm text-slate-100 placeholder:text-slate-500',
                    'outline-none transition-shadow focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30',
                    'disabled:opacity-50'
                  )}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-xs font-medium text-slate-400">
                Fjalëkalimi
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Të paktën 6 karaktere"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500',
                    'outline-none transition-shadow focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30',
                    'disabled:opacity-50'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={submitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-cyan-400 disabled:opacity-50"
                  aria-label={showPassword ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="register-confirm" className="mb-1.5 block text-xs font-medium text-slate-400">
                Konfirmo Fjalëkalimin
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5" />
                <input
                  id="register-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Përsëritni fjalëkalimin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500',
                    'outline-none transition-shadow focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/30',
                    'disabled:opacity-50'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  disabled={submitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-cyan-400 disabled:opacity-50"
                  aria-label={showConfirmPassword ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-slate-950 transition-all',
                'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25',
                'hover:brightness-110 hover:shadow-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-60',
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
          <div className="mt-6 text-center">
            <p className="text-[#94a3b8] text-sm">
              Keni llogari?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#22d3ee] transition-colors hover:text-[#06b6d4]"
              >
                Kyçuni
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
