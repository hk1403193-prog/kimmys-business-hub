import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { sectionIds } from '../sections'
import { LOGIN_PATH, RECOVER_PATH, UPDATE_PASSWORD_PATH } from './gate'
import {
  staticAppPaths,
  staticRedirectDocument,
  staticRedirectRules,
  staticRuleFor,
} from './staticHost'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const redirectsPath = join(root, 'public/_redirects')

describe('static host fallback', () => {
  const document = readFileSync(redirectsPath, 'utf8')
  const rules = staticRedirectRules(document)

  it('matches the practice Pages file that the build copies', () => {
    expect(document).toBe(staticRedirectDocument())
    expect(rules.map((rule) => rule.source)).toEqual(staticAppPaths())
  })

  it('serves the app for password recovery and direct section addresses', () => {
    const required = [
      LOGIN_PATH,
      RECOVER_PATH,
      UPDATE_PASSWORD_PATH,
      `${UPDATE_PASSWORD_PATH}/`,
      ...sectionIds.flatMap((id) => [`/${id}`, `/${id}/`]),
    ]

    for (const path of required) {
      expect(staticRuleFor(document, path)).toEqual({
        source: path,
        destination: '/index.html',
        code: '200',
      })
    }
  })

  it('leaves JavaScript, CSS, and the icon as real files', () => {
    for (const rule of rules) {
      expect(rule.source.includes('*')).toBe(false)
      expect(rule.source.startsWith('/assets')).toBe(false)
      expect(rule.source).not.toBe('/favicon.svg')
      expect(rule.destination).toBe('/index.html')
      expect(rule.code).toBe('200')
    }

    expect(staticRuleFor(document, '/assets/index.js')).toBeNull()
    expect(staticRuleFor(document, '/favicon.svg')).toBeNull()
    expect(existsSync(join(root, 'public/404.html'))).toBe(false)
  })

  it('copies the same fallback into a production build when one exists', () => {
    const built = join(root, 'dist/_redirects')
    if (!existsSync(built)) return
    expect(readFileSync(built, 'utf8')).toBe(document)
    expect(existsSync(join(root, 'dist/404.html'))).toBe(false)
    expect(existsSync(join(root, 'dist/index.html'))).toBe(true)
    expect(existsSync(join(root, 'dist/favicon.svg'))).toBe(true)
  })
})
