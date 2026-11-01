import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { findingsInText, scanTree } from './secrets'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

function token(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.sig`
}

describe('secret scan', () => {
  it('flags secret material and ignores the public publishable key name', () => {
    const secretKey = findingsInText(
      'sample.env',
      `VITE_SUPABASE_PUBLISHABLE_KEY=${'sb_secret_'}${'abcdefghijkl'}`,
    )
    expect(secretKey.map((item) => item.rule)).toContain('secret API key')

    const serviceToken = findingsInText(
      'sample.ts',
      `const key = '${token({ role: 'service_role', ref: 'practice' })}'`,
    )
    expect(serviceToken.map((item) => item.rule)).toContain('service-role token')

    const publishable = findingsInText(
      '.env.example',
      'VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY',
    )
    expect(publishable).toEqual([])

    const anon = findingsInText('config.ts', `const key = '${token({ role: 'anon' })}'`)
    expect(anon).toEqual([])
  })

  it('finds no secrets in the project source', () => {
    expect(scanTree(root)).toEqual([])
  })

  it('finds no secrets or dev-only authenticator preview in the production build', () => {
    const dist = join(root, 'dist')
    if (!existsSync(dist)) return

    expect(scanTree(dist)).toEqual([])

    const files: string[] = []
    const visit = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) visit(path)
        else if (name.endsWith('.js') || name.endsWith('.css') || name.endsWith('.html')) {
          files.push(path)
        }
      }
    }
    visit(dist)
    const bundled = files.map((path) => readFileSync(path, 'utf8')).join('\n')
    expect(bundled).not.toContain('DEVPREVIEW')
    expect(bundled).not.toMatch(/sb_secret_[A-Za-z0-9_-]{12,}/)
    expect(bundled).not.toContain('kimmysdelivery.com/')
  })
})
