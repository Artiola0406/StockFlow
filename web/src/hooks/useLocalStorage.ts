import { useCallback, useState } from 'react'
import { lsGet, lsSet } from '../lib/storage'

/** Synced localStorage list state with lsSet on every persist (add/edit/delete). */
export function useLocalStorageState<T>(storageKey: string, fallback: T) {
  const [rows, setRows] = useState<T>(() => lsGet<T>(storageKey, fallback))

  const persist = useCallback(
    (next: T) => {
      lsSet(storageKey, next)
      setRows(next)
    },
    [storageKey],
  )

  return { rows, persist }
}
