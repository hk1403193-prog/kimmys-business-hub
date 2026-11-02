import { isOwnerRole } from './role'

export type AccessDecision =
  | { kind: 'unauthenticated' }
  | { kind: 'forbidden' }
  | { kind: 'mfa-enroll' }
  | { kind: 'mfa-challenge' }
  | { kind: 'allowed' }

export type OwnerProof = {
  role: 'owner'
  assurance: 'aal2'
  userId: string
}

export class OwnerAccessError extends Error {
  readonly code = 'owner-access-denied'

  constructor() {
    super('Protected operation refused.')
    this.name = 'OwnerAccessError'
  }
}

export function decideAccess(input: {
  hasSession: boolean
  appMetadata: unknown
  userMetadata?: unknown
  currentLevel: string | null
  nextLevel: string | null
}): AccessDecision {
  if (!input.hasSession) return { kind: 'unauthenticated' }

  // user_metadata is editable by the signed-in person. It never grants access.
  void input.userMetadata
  if (!isOwnerRole(input.appMetadata)) return { kind: 'forbidden' }
  if (input.currentLevel === 'aal2') return { kind: 'allowed' }
  if (input.nextLevel === 'aal2') return { kind: 'mfa-challenge' }
  return { kind: 'mfa-enroll' }
}

export function ownerProof(input: {
  userId: string | null
  appMetadata: unknown
  currentLevel: string | null
}): OwnerProof | null {
  if (!input.userId || input.userId.trim() === '') return null
  if (!isOwnerRole(input.appMetadata)) return null
  if (input.currentLevel !== 'aal2') return null
  return { role: 'owner', assurance: 'aal2', userId: input.userId }
}

export function requireOwnerProof(proof: OwnerProof | null): OwnerProof {
  if (
    !proof ||
    proof.role !== 'owner' ||
    proof.assurance !== 'aal2' ||
    proof.userId.trim() === ''
  ) {
    throw new OwnerAccessError()
  }

  return proof
}
