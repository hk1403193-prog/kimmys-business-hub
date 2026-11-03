export type OrderSync = {
  persistence: 'loading' | 'database' | 'memory' | 'blocked'
  phase: 'loading' | 'idle' | 'saving' | 'saved' | 'error'
  message: string | null
}

export type OrderWriteResult =
  | { ok: true; message: string }
  | { ok: false; message: string }

export function sampleStripLabel(sync: OrderSync): string {
  if (sync.persistence === 'loading' || sync.phase === 'loading') {
    return 'Fictional sample data · Loading'
  }
  if (sync.phase === 'saving') return 'Fictional sample data · Saving'
  if (sync.persistence === 'database' && sync.phase === 'error') {
    return 'Fictional sample data · Save needs attention'
  }
  if (sync.persistence === 'database') return 'Fictional sample data · Saved for this owner'
  return 'Fictional sample data · Not saved'
}

export function orderSyncText(sync: OrderSync): string {
  if (sync.phase === 'loading' || sync.persistence === 'loading') {
    return 'Loading saved practice orders.'
  }
  if (sync.phase === 'saving') return 'Saving the fictional practice order.'
  if (sync.message) return sync.message
  if (sync.persistence === 'database') {
    return 'Practice orders are saved for this owner. A refresh or a later sign-in keeps them. They are fictional.'
  }
  if (sync.persistence === 'memory') {
    return 'Practice orders are not saved yet. A refresh brings the original samples back.'
  }
  return 'Practice orders could not be loaded.'
}

export function orderSyncTone(sync: OrderSync): 'info' | 'ok' | 'error' {
  if (sync.phase === 'error') return 'error'
  if (sync.phase === 'saved') return 'ok'
  return 'info'
}

export function practiceWriteSuccess(status: string): string {
  if (status === 'Completed') {
    return 'Sample order closed. It stays in the history after a refresh.'
  }
  if (status === 'Canceled') {
    return 'Sample order canceled. It stays in the history after a refresh.'
  }
  return 'Sample order saved. It stays after a refresh and the next sign-in.'
}

export const MEMORY_SAVE_MESSAGE =
  'Saved in this browser only. A refresh brings the original samples back.'
