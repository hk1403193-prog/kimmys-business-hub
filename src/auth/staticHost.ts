import { sectionIds } from '../sections'
import { LOGIN_PATH, RECOVER_PATH, UPDATE_PASSWORD_PATH } from './gate'

const AUTH_PATHS = [LOGIN_PATH, RECOVER_PATH, UPDATE_PASSWORD_PATH] as const

export function staticAppPaths(): string[] {
  const exact = [...AUTH_PATHS, ...sectionIds.map((id) => `/${id}`)]
  return exact.flatMap((path) => [path, `${path}/`])
}

export function staticRedirectDocument(): string {
  const notes = [
    '# Practice site on Cloudflare Pages. This file is not a secret.',
    '# A 200 line serves the app and keeps the phone address the same.',
    '# That is required for Forgot password, the reset link, and a direct section address.',
    '# Do not replace these lines with a catch-all. A catch-all would also replace the JavaScript, CSS, and icon.',
    '# Do not add 404.html. Pages would stop its own single-page fallback.',
  ]
  const rules = staticAppPaths().map((path) => `${path} /index.html 200`)
  return `${[...notes, ...rules].join('\n')}\n`
}

export type StaticRule = {
  source: string
  destination: string
  code: string
}

export function staticRedirectRules(document: string): StaticRule[] {
  return document
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      const parts = line.split(/\s+/)
      if (parts.length !== 3) {
        throw new Error('Static host rule must be a source, a destination, and a code.')
      }
      return { source: parts[0], destination: parts[1], code: parts[2] }
    })
}

export function staticRuleFor(document: string, requestPath: string): StaticRule | null {
  return staticRedirectRules(document).find((rule) => rule.source === requestPath) ?? null
}
