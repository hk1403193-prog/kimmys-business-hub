export function normalizeTotpCode(value: string): string {
  return value.replace(/\s+/g, '')
}

export function isTotpCode(value: string): boolean {
  return /^\d{6}$/.test(normalizeTotpCode(value))
}

export function groupSecret(secret: string): string {
  const compact = secret.replace(/\s+/g, '').toUpperCase()
  return compact.replace(/(.{4})/g, '$1 ').trim()
}

export function compactSecret(secret: string): string {
  return secret.replace(/\s+/g, '')
}
