import { requireOwnerProof, type OwnerProof } from './access'
import { isOwnerRole } from './role'

export const PRACTICE_NOTES_TABLE = 'practice_owner_notes'

export type NotesRead =
  | { status: 'refused' }
  | { status: 'denied' }
  | { status: 'not-installed' }
  | { status: 'unavailable' }
  | { status: 'ok'; fictionalCount: number; unlabeled: number }

export type NotesClient = {
  from: (table: string) => {
    select: (columns: string) => {
      limit: (count: number) => PromiseLike<{
        data: Array<{ body?: unknown }> | null
        error: { message: string; code?: string } | null
      }>
    }
  }
}

export function canUseProtectedTable(
  claims: {
    role?: unknown
    aal?: unknown
    app_metadata?: unknown
    user_metadata?: unknown
  } | null,
): boolean {
  if (!claims) return false
  if (claims.role !== 'authenticated') return false
  if (claims.aal !== 'aal2') return false
  return isOwnerRole(claims.app_metadata)
}

function databaseDenied(error: { message: string; code?: string }): boolean {
  const message = error.message.toLowerCase()
  const code = error.code ?? ''
  return (
    code === '42501' ||
    code === 'PGRST301' ||
    message.includes('permission') ||
    message.includes('not authorized') ||
    message.includes('jwt') ||
    message.includes('row-level security') ||
    message.includes('rls')
  )
}

function tableMissing(error: { message: string; code?: string }): boolean {
  const message = error.message.toLowerCase()
  const code = error.code ?? ''
  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  )
}

export async function readPracticeOwnerNotes(
  client: NotesClient,
  proof: OwnerProof | null,
): Promise<NotesRead> {
  try {
    requireOwnerProof(proof)
  } catch {
    return { status: 'refused' }
  }

  const { data, error } = await client
    .from(PRACTICE_NOTES_TABLE)
    .select('body')
    .limit(20)

  if (error) {
    if (databaseDenied(error)) return { status: 'denied' }
    if (tableMissing(error)) return { status: 'not-installed' }
    return { status: 'unavailable' }
  }

  const rows = data ?? []
  let fictionalCount = 0
  let unlabeled = 0

  for (const row of rows) {
    if (typeof row.body === 'string' && row.body.startsWith('FICTIONAL:')) {
      fictionalCount += 1
    } else {
      unlabeled += 1
    }
  }

  return { status: 'ok', fictionalCount, unlabeled }
}

export function notesStatusMessage(result: NotesRead): string {
  switch (result.status) {
    case 'refused':
      return 'This read was refused before it was sent. Owner verification is required.'
    case 'denied':
      return 'The practice database refused this read.'
    case 'not-installed':
      return 'The practice lock table is not installed yet. Run the Phase 3 SQL in the practice project only.'
    case 'unavailable':
      return 'The practice lock could not be checked.'
    case 'ok':
      if (result.unlabeled > 0) {
        return `The practice lock allowed this read. Fictional notes found: ${result.fictionalCount}. Unlabeled rows were not shown.`
      }
      return `The practice lock allowed this read. Fictional notes found: ${result.fictionalCount}.`
  }
}
