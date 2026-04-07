import { Card } from '../components/ui/Card'
import { UserCog } from 'lucide-react'

export function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Përdoruesit</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Menaxhimi i llogarive (nën zhvillim).
        </p>
      </div>
      <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <UserCog className="h-14 w-14 text-neon-cyan/80" strokeWidth={1.25} />
        <p className="max-w-sm text-sm text-slate-600 dark:text-slate-400">
          Këtu do të shtohet lista e përdoruesve dhe rolet. Për momentin vetëm administratori sheh këtë faqe.
        </p>
      </Card>
    </div>
  )
}
