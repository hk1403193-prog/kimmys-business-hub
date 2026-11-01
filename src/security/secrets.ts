import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { jwtPayload } from '../auth/config'

export type SecretFinding = {
  path: string
  rule: string
  line: number
}

const TEXT = /\.(ts|tsx|js|mjs|cjs|css|html|sql|md|json|svg|txt|example)$/i
const SKIP = new Set(['node_modules', '.git', 'coverage', '.vite'])

function lineHasServiceRoleToken(line: string): boolean {
  const matches = line.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)
  if (!matches) return false
  return matches.some((token) => jwtPayload(token)?.role === 'service_role')
}

const rules: Array<{ name: string; test: (line: string) => boolean }> = [
  {
    name: 'secret API key',
    test: (line) => /sb_secret_[A-Za-z0-9_-]{12,}/.test(line),
  },
  {
    name: 'private key',
    test: (line) => /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(line),
  },
  {
    name: 'database connection string',
    test: (line) => /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/i.test(line),
  },
  {
    name: 'service-role token',
    test: lineHasServiceRoleToken,
  },
  {
    name: 'hosted project URL',
    test: (line) => /https:\/\/[a-z0-9]{20}\.supabase\.co/.test(line),
  },
]

export function findingsInText(path: string, text: string): SecretFinding[] {
  const findings: SecretFinding[] = []
  const lines = text.split(/\r?\n/)
  lines.forEach((line, index) => {
    for (const rule of rules) {
      if (rule.test(line)) {
        findings.push({ path, rule: rule.name, line: index + 1 })
      }
    }
  })
  return findings
}

function shouldScan(name: string): boolean {
  return name === '.env' || name.startsWith('.env') || TEXT.test(name)
}

export function scanTree(root: string): SecretFinding[] {
  const findings: SecretFinding[] = []

  const visit = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name)) continue
      const path = join(dir, name)
      const stat = statSync(path)
      if (stat.isDirectory()) {
        visit(path)
        continue
      }
      if (!shouldScan(name)) continue
      const text = readFileSync(path, 'utf8')
      findings.push(...findingsInText(relative(root, path), text))
    }
  }

  visit(root)
  return findings
}
