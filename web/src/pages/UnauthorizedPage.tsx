import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'

export function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-cyber-void px-4 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(34,211,238,0.2) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(167,139,250,0.15) 0%, transparent 50%)',
        }}
      />
      <ShieldOff className="relative z-10 mb-6 h-16 w-16 text-red-400/90" strokeWidth={1.25} />
      <h1 className="relative z-10 text-2xl font-bold text-slate-100">Nuk keni leje</h1>
      <p className="relative z-10 mt-2 max-w-md text-sm text-slate-400">
        Nuk keni të drejtë të hapni këtë faqe. Kontaktoni administratorin nëse mendoni se është gabim.
      </p>
      <Link
        to="/"
        className="relative z-10 mt-8 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:opacity-95"
      >
        Kthehu në Dashboard
      </Link>
    </div>
  )
}
