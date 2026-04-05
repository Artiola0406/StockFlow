import { cn } from '../lib/cn'
import { useTheme } from '../context/ThemeContext'

export function CyberBackground() {
  const { isDark } = useTheme()

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {isDark ? (
        <>
          <div
            className="absolute inset-0 animate-cyber-gradient"
            style={{
              background:
                'linear-gradient(125deg, #020617 0%, #0f172a 25%, #1e1b4b 50%, #0c4a6e 75%, #020617 100%)',
            }}
          />
          <div
            className="animate-cyber-float absolute -left-1/4 top-0 h-[55vh] w-[55vh] rounded-full opacity-70"
            style={{
              background:
                'radial-gradient(circle, rgba(56,189,248,0.35) 0%, transparent 65%)',
              animation: 'cyber-pulse-glow 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute -right-1/4 bottom-0 h-[50vh] w-[50vh] rounded-full opacity-60"
            style={{
              background:
                'radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 68%)',
              animation: 'cyber-pulse-glow 10s ease-in-out infinite 1s',
            }}
          />
          <div
            className="absolute left-1/3 top-1/2 h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
            style={{
              background:
                'radial-gradient(circle, rgba(244,114,182,0.28) 0%, transparent 70%)',
              animation: 'cyber-pulse-glow 12s ease-in-out infinite 0.5s',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M0 30h60M30 0v60' stroke='%2338bdf8' stroke-width='0.5'/%3E%3C/svg%3E")`,
            }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(145deg, #f8fafc 0%, #eef2ff 35%, #fae8ff 65%, #ecfeff 100%)',
            }}
          />
          <div
            className="absolute -right-20 top-10 h-72 w-72 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(56,189,248,0.2), transparent 70%)',
            }}
          />
          <div
            className="absolute -left-16 bottom-20 h-64 w-64 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(167,139,250,0.18), transparent 70%)',
            }}
          />
        </>
      )}
      <div
        className={cn(
          'absolute inset-0',
          isDark ? 'bg-slate-950/20' : 'bg-white/30',
        )}
      />
    </div>
  )
}
