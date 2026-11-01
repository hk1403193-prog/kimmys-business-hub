import { isSectionId, sectionIds, type SectionId } from '../sections'
import type { AccessDecision } from './access'

export const LOGIN_PATH = '/login'
export const RECOVER_PATH = '/recover'
export const UPDATE_PASSWORD_PATH = '/auth/update-password'

export type GateScreen =
  | 'loading'
  | 'setup'
  | 'login'
  | 'recover'
  | 'update-password'
  | 'forbidden'
  | 'mfa-enroll'
  | 'mfa-challenge'
  | 'command-center'

export type GateResult = {
  screen: GateScreen
  section: SectionId | null
}

export function commandCenterIsOpen(screen: GateScreen): boolean {
  return screen === 'command-center'
}

export function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

export function devPreview(
  dev: boolean,
  search: string,
): 'mfa-enroll' | 'mfa-challenge' | null {
  if (!dev) return null
  const value = new URLSearchParams(search).get('preview')
  if (value === 'mfa-enroll' || value === 'mfa-challenge') return value
  return null
}

export function resolveGate(input: {
  loading: boolean
  configured: boolean
  pathname: string
  hash: string
  decision: AccessDecision
}): GateResult {
  if (!input.configured) {
    return { screen: 'setup', section: null }
  }

  if (input.loading) {
    return { screen: 'loading', section: null }
  }

  const path = normalizePath(input.pathname)

  if (path === UPDATE_PASSWORD_PATH) {
    return { screen: 'update-password', section: null }
  }

  if (input.decision.kind === 'allowed') {
    const hash = input.hash.replace(/^#/, '')
    const section = isSectionId(hash) ? hash : 'dashboard'
    return { screen: 'command-center', section }
  }

  if (input.decision.kind === 'forbidden') {
    return { screen: 'forbidden', section: null }
  }

  if (input.decision.kind === 'mfa-enroll') {
    return { screen: 'mfa-enroll', section: null }
  }

  if (input.decision.kind === 'mfa-challenge') {
    return { screen: 'mfa-challenge', section: null }
  }

  if (path === RECOVER_PATH) {
    return { screen: 'recover', section: null }
  }

  return { screen: 'login', section: null }
}

export function protectedSectionTargets(): string[] {
  return sectionIds.flatMap((id) => [`/${id}`, `#${id}`])
}
