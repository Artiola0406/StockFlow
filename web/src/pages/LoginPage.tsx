import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Package, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'

export function LoginPage() {
  const { user, isLoading: authLoading, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#22d3ee] border-t-transparent" />
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(email, password)
      window.location.href = '/dashboard'
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      if (message.toLowerCase().includes('failed to fetch') || message.toLowerCase().includes('network')) {
        setError('Cannot connect to server')
      } else {
        setError(message)
      }
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

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div
          className={cn(
            'w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl backdrop-blur-xl',
            'shadow-[0_0_60px_rgba(34,211,238,0.08)]',
          )}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-fuchsia-600 shadow-[0_0_24px_rgba(56,189,248,0.45)]">
              <Package className="h-7 w-7 text-white" strokeWidth={2} />
              <span className="absolute inset-0 rounded-xl ring-1 ring-white/30" />
            </div>
            <h1
              className="bg-gradient-to-r from-[#22d3ee] via-[#38bdf8] to-[#a78bfa] bg-clip-text text-3xl font-bold tracking-tight text-transparent"
              style={{ WebkitBackgroundClip: 'text' }}
            >
              StockFlow
            </h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              NEURAL INVENTORY SYSTEM
            </p>
            <h2 className="mt-6 text-xl font-semibold text-slate-100">Mirë se vini</h2>
            <p className="mt-1 text-sm text-slate-400">Kyçuni në StockFlow</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-[#f87171]"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Kyçja dështoi</p>
                  <p className="mt-0.5 text-red-200/90">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-slate-400">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="email@stockflow.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  'w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500',
                  'outline-none transition-shadow focus:border-[#22d3ee]/50 focus:ring-2 focus:ring-[#22d3ee]/30',
                )}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-slate-400">
                Fjalëkalimi
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Fjalëkalimi juaj"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    'w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-4 pr-12 text-sm text-slate-100 placeholder:text-slate-500',
                    'outline-none transition-shadow focus:border-[#22d3ee]/50 focus:ring-2 focus:ring-[#22d3ee]/30',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#22d3ee]"
                  aria-label={showPassword ? 'Fshih fjalëkalimin' : 'Shfaq fjalëkalimin'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-slate-950 transition-all',
                'bg-gradient-to-r from-[#22d3ee] to-[#38bdf8] shadow-lg shadow-cyan-500/25',
                'hover:brightness-110 hover:shadow-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Duke u kyçur...
                </>
              ) : (
                'Kyçu'
              )}
            </button>
          </form>

          
          <div className="mt-6 text-center">
            <p className="text-[#94a3b8]">
              Nuk keni llogari?{' '}
              <a
                href="/register"
                className="font-semibold text-[#22d3ee] transition-colors hover:text-[#06b6d4]"
              >
                Regjistrohu falas
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
