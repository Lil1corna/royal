import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ALLOWED_ROLES_IN_DB, INVITE_ALLOWED_ROLE_INPUTS } from './roles'
import { normalizeDbRoleToRoleKey, ROLES } from '@/config/roles'
import { INVITE_ALLOWED_ROLE_INPUTS as exportedFromRoute } from '@/app/api/admin/users/invite/route'

describe('roles contract (API vs DB migration)', () => {
  it('invite route re-exports same allowlist as constants', () => {
    expect([...exportedFromRoute].sort()).toEqual(
      [...INVITE_ALLOWED_ROLE_INPUTS].sort()
    )
  })

  it('every invite API role input normalizes to a DB role in ALLOWED_ROLES_IN_DB', () => {
    for (const input of INVITE_ALLOWED_ROLE_INPUTS) {
      const roleKey = normalizeDbRoleToRoleKey(input)
      const dbKey = ROLES[roleKey].key
      expect(
        ALLOWED_ROLES_IN_DB,
        `input "${input}" → ${dbKey} must be allowed in pending_staff_invites`
      ).toContain(dbKey)
    }
  })

  it('migration SQL CHECK lists every ALLOWED_ROLES_IN_DB value', () => {
    const sql = readFileSync(
      join(process.cwd(), 'supabase/migrations/20260404130000_fix_role_check.sql'),
      'utf8'
    )
    const inBlock = sql.match(/role\s+IN\s*\(([\s\S]*?)\)\s*\)/i)?.[1] ?? ''
    for (const role of ALLOWED_ROLES_IN_DB) {
      expect(inBlock, `missing '${role}' in migration CHECK`).toContain(`'${role}'`)
    }
    const quoted = [...inBlock.matchAll(/'([a-z_]+)'/g)].map((m) => m[1])
    expect(new Set(quoted)).toEqual(new Set(ALLOWED_ROLES_IN_DB))
  })
})
