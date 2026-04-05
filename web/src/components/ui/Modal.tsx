import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from './Card'
import { cn } from '../../lib/cn'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm dark:bg-black/75"
            aria-label="Mbyll"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn('relative z-[1] w-full max-w-md', className)}
            onClick={(e) => e.stopPropagation()}
          >
            <Card glow="violet" className="border-fuchsia-500/20 dark:border-fuchsia-400/25">
              <h2
                id="modal-title"
                className="mb-4 text-lg font-semibold text-slate-900 dark:text-white"
              >
                {title}
              </h2>
              {children}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
