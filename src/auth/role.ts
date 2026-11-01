export const OWNER_ROLE = 'owner'

export function appRole(appMetadata: unknown): string | null {
  if (!appMetadata || typeof appMetadata !== 'object') return null
  const role = (appMetadata as Record<string, unknown>).role
  if (typeof role !== 'string') return null
  if (role.length === 0 || role.length > 64) return null
  return role
}

export function isOwnerRole(appMetadata: unknown): boolean {
  return appRole(appMetadata) === OWNER_ROLE
}
