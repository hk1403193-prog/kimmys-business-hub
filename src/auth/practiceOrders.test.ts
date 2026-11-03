import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createInitialState, operationsReducer } from '../domain/operations'
import { applyStatus } from '../domain/orders'
import { blankDraft, createSeed } from '../domain/seed'
import { decidePracticeWrite, fictionalOrderProblem } from '../domain/fictional'
import { deliveryWindows } from '../domain/types'
import type { PracticeOrder } from '../domain/types'
import type { OwnerProof } from './access'
import {
  loadPracticeOrders,
  practiceOrderFailureMessage,
  savePracticeOrder,
  type PracticeOrderRecord,
  type PracticeOrdersClient,
  type PracticeQueryResult,
} from './practiceOrders'
import { orderSyncText, sampleStripLabel } from '../state/orderSync'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const today = '2026-11-02'
const at = '2026-11-02T18:00:00.000Z'
const ownerId = '11111111-1111-4111-8111-111111111111'
const owner: OwnerProof = { role: 'owner', assurance: 'aal2', userId: ownerId }

function makeOrder(): PracticeOrder {
  const state = createInitialState(today)
  const draft = blankDraft(today, state.practice)
  draft.customer = 'Riley Sample'
  const next = operationsReducer(state, { type: 'create', draft, at })
  const created = next.orders.find((order) => order.customer === 'Riley Sample')
  if (!created) throw new Error('Missing sample order')
  return created
}

type Call =
  | { kind: 'list'; table: string; columns: string; ownerId: string }
  | { kind: 'insert'; table: string; row: PracticeOrderRecord }
  | { kind: 'update'; table: string; id: string; row: PracticeOrderRecord }

function mockClient(respond: (call: Call) => PracticeQueryResult) {
  const calls: Call[] = []
  const client: PracticeOrdersClient = {
    from(table) {
      return {
        select(columns) {
          return {
            eq(_column, scopedOwner) {
              return {
                order() {
                  return {
                    async limit() {
                      const call: Call = { kind: 'list', table, columns, ownerId: scopedOwner }
                      calls.push(call)
                      return respond(call)
                    },
                  }
                },
              }
            },
          }
        },
        insert(row) {
          return {
            async select() {
              const call: Call = { kind: 'insert', table, row }
              calls.push(call)
              return respond(call)
            },
          }
        },
        update(row) {
          return {
            eq(_column, id) {
              return {
                async select() {
                  const call: Call = { kind: 'update', table, id, row }
                  calls.push(call)
                  return respond(call)
                },
              }
            },
          }
        },
      }
    },
  }
  return { client, calls }
}

describe('fictional order validation', () => {
  it('accepts the built-in samples and a new sample order', () => {
    for (const order of createSeed(today)) {
      expect(fictionalOrderProblem(order)).toBeNull()
    }
    expect(fictionalOrderProblem(makeOrder())).toBeNull()
  })

  it('rejects a real-looking name, phone, email, and the live website', () => {
    const order = makeOrder()
    expect(fictionalOrderProblem({ ...order, customer: 'Kim Smith' })).toMatch(/fictional name/i)
    expect(fictionalOrderProblem({ ...order, phone: '(312) 555-0199' })).toMatch(/555/)
    expect(
      fictionalOrderProblem({
        ...order,
        instructions: 'Fictional note for kim@example.com',
      }),
    ).toMatch(/email/i)
    expect(
      fictionalOrderProblem({
        ...order,
        address: '12 kimmysdelivery.com, Practice Town',
      }),
    ).toMatch(/live customer website/i)
    expect(
      fictionalOrderProblem({ ...order, instructions: 'Leave the bags on the porch.' }),
    ).toMatch(/Fictional/)
  })

  it('refuses to save an invalid order before any database call', async () => {
    const { client, calls } = mockClient(() => {
      throw new Error('database should not be called')
    })
    const result = await savePracticeOrder(
      client,
      owner,
      { ...makeOrder(), customer: 'Kim Smith' },
      'insert',
      at,
    )
    expect(result.status).toBe('invalid')
    if (result.status === 'invalid') expect(result.message).toMatch(/fictional name/i)
    expect(calls).toEqual([])
    expect(decidePracticeWrite('database', { ...makeOrder(), customer: 'Kim Smith' }).kind).toBe(
      'invalid',
    )
  })

  it('keeps a closed order marked closed and an open delivery open', () => {
    const order = makeOrder()
    expect(decidePracticeWrite('database', order).kind).toBe('database')
    expect(decidePracticeWrite('memory', order).kind).toBe('memory')
    expect(decidePracticeWrite('loading', order).kind).toBe('unavailable')
    expect(decidePracticeWrite('blocked', order).kind).toBe('unavailable')
    const closed = applyStatus(order, 'Completed', at)
    expect(closed.status).toBe('Completed')
    expect(fictionalOrderProblem(closed)).toBeNull()
    const delivered = applyStatus(order, 'Delivered', at)
    expect(delivered.status).toBe('Delivered')
    expect(fictionalOrderProblem(delivered)).toBeNull()
  })
})

describe('owner access to practice orders', () => {
  it('saves and reloads a fictional order for the verified owner only', async () => {
    const order = makeOrder()
    let stored: PracticeOrderRecord | null = null
    const { client, calls } = mockClient((call) => {
      if (call.kind === 'insert' || call.kind === 'update') {
        stored = call.row
        return { data: [{ id: call.row.id }], error: null }
      }
      return { data: stored ? [stored] : [], error: null }
    })

    const saved = await savePracticeOrder(client, owner, order, 'insert', at)
    expect(saved).toEqual({ status: 'ok', order })
    expect(calls[0]).toMatchObject({ kind: 'insert', table: 'practice_orders' })
    if (calls[0]?.kind !== 'insert') throw new Error('Expected an insert')
    expect(calls[0].row.owner_id).toBe(ownerId)
    expect(calls[0].row.fiction_label.startsWith('FICTIONAL:')).toBe(true)
    expect(calls[0].row.payload.fiction).toBe('practice')
    expect(calls[0].row.closed).toBe(false)
    expect(calls[0].row.customer_label).toBe('Riley Sample')

    const loaded = await loadPracticeOrders(client, owner)
    expect(loaded).toEqual({ status: 'ok', orders: [order], withheld: 0 })
    expect(calls[1]).toMatchObject({
      kind: 'list',
      table: 'practice_orders',
      ownerId,
    })
    if (calls[1]?.kind === 'list') {
      expect(calls[1].columns).toContain('owner_id')
      expect(calls[1].columns).toContain('payload')
      expect(calls[1].columns).not.toContain('*')
    }

    const closed = applyStatus(order, 'Completed', at)
    const updated = await savePracticeOrder(client, owner, closed, 'update', at)
    expect(updated.status).toBe('ok')
    if (calls[2]?.kind !== 'update') throw new Error('Expected an update')
    expect(calls[2].id).toBe(order.id)
    expect(calls[2].row.closed).toBe(true)
    expect(calls[2].row.status).toBe('Completed')
  })

  it('hides a stored row that is not fictional', async () => {
    const order = makeOrder()
    let stored: PracticeOrderRecord | null = null
    const { client } = mockClient((call) => {
      if (call.kind === 'insert') {
        stored = call.row
        return { data: [{ id: order.id }], error: null }
      }
      const tampered = stored
        ? {
            ...stored,
            customer_label: 'Real Person',
            payload: { ...stored.payload, customer: 'Real Person' },
          }
        : null
      return { data: stored && tampered ? [stored, tampered] : [], error: null }
    })

    await savePracticeOrder(client, owner, order, 'insert', at)
    const loaded = await loadPracticeOrders(client, owner)
    expect(loaded).toEqual({ status: 'ok', orders: [order], withheld: 1 })
    if (loaded.status === 'ok') {
      expect(loaded.orders.some((item) => item.customer === 'Real Person')).toBe(false)
    }
  })
})

describe('unauthorized practice order access', () => {
  it('does not query when owner verification is missing', async () => {
    const order = makeOrder()
    const { client, calls } = mockClient(() => {
      throw new Error('database should not be called')
    })
    const strangers = [
      null,
      { role: 'owner', assurance: 'aal1', userId: ownerId },
      { role: 'staff', assurance: 'aal2', userId: ownerId },
      { role: 'owner', assurance: 'aal2', userId: 'user-1' },
      { role: 'owner', assurance: 'aal2', userId: '' },
    ] as Array<OwnerProof | null>

    for (const proof of strangers) {
      expect((await loadPracticeOrders(client, proof)).status).toBe('refused')
      expect((await savePracticeOrder(client, proof, order, 'insert', at)).status).toBe('refused')
    }
    expect(calls).toEqual([])
    expect(practiceOrderFailureMessage({ status: 'refused' })).toMatch(/refused/)
  })

  it('reports a database denial without repeating the row', async () => {
    const { client } = mockClient(() => ({
      data: [{ customer: 'Kim Smith', phone: '(312) 555-0100' }],
      error: { message: 'permission denied for Kim Smith', code: '42501' },
    }))
    const result = await loadPracticeOrders(client, owner)
    expect(result.status).toBe('denied')
    const message = practiceOrderFailureMessage(result)
    expect(message).toMatch(/refused/)
    expect(message).not.toMatch(/Kim Smith/)
    expect(message).not.toMatch(/312/)
  })

  it('reports a missing table without opening the command center data', async () => {
    const { client } = mockClient(() => ({
      data: null,
      error: { message: 'relation does not exist', code: '42P01' },
    }))
    const result = await savePracticeOrder(client, owner, makeOrder(), 'update', at)
    expect(result.status).toBe('not-installed')
    expect(practiceOrderFailureMessage(result)).toMatch(/Phase 3.1 SQL/)
  })
})

describe('practice order database rules', () => {
  const sql = readFileSync(
    join(root, 'supabase/migrations/20261102180000_practice_orders.sql'),
    'utf8',
  )
  const notes = readFileSync(
    join(root, 'supabase/migrations/20261101120000_practice_owner_lock.sql'),
    'utf8',
  )
  const normalized = sql.toLowerCase()

  it('locks fictional orders to the verified owner and leaves the notes policies alone', () => {
    expect(normalized).toContain('enable row level security')
    expect(normalized).toContain('force row level security')
    expect(normalized).toContain('revoke all on table public.practice_orders from anon')
    expect(normalized).toContain('revoke all on table public.practice_orders from public')
    expect(normalized).toContain('revoke all on table public.practice_orders from authenticated')
    expect(normalized).toContain(
      'grant select, insert, update on table public.practice_orders to authenticated',
    )
    expect(normalized).not.toMatch(/grant\s+[^;]*\sto\s+anon\b/)
    expect(normalized).not.toMatch(/grant\s+[^;]*\sto\s+public\b/)
    expect(normalized).not.toMatch(/\bfor delete\b/)
    expect(normalized).not.toMatch(/grant\s+delete\b/)
    expect(sql).toContain('public.is_verified_owner()')
    expect(sql).toContain('owner_id = auth.uid()')
    expect(sql).not.toContain('user_metadata')
    expect(sql).not.toContain('practice_owner_notes')
    expect(sql).not.toMatch(/create or replace function public\.is_verified_owner/i)
    expect(sql).not.toMatch(/sb_secret_|service_role/)
    expect(normalized).toContain("like 'fictional:%'")
    expect(normalized).toContain('kimmysdelivery')
    for (const window of deliveryWindows) {
      expect(sql).toContain(`'${window}'`)
    }
    expect(notes).toContain('create policy practice_owner_notes_select')
    expect(notes).toContain('create policy practice_owner_notes_insert')
    expect(notes).toContain('create policy practice_owner_notes_update')
    expect(notes).toContain('create policy practice_owner_notes_delete')
  })

  it('describes saved, unsaved, and failed practice orders without calling them customer records', () => {
    expect(
      sampleStripLabel({ persistence: 'database', phase: 'idle', message: null }),
    ).toBe('Fictional sample data · Saved for this owner')
    expect(
      sampleStripLabel({ persistence: 'memory', phase: 'idle', message: null }),
    ).toBe('Fictional sample data · Not saved')
    expect(
      sampleStripLabel({ persistence: 'database', phase: 'error', message: 'nope' }),
    ).toBe('Fictional sample data · Save needs attention')
    expect(
      orderSyncText({ persistence: 'loading', phase: 'loading', message: null }),
    ).toMatch(/Loading saved practice orders/)
    expect(readFileSync(join(root, 'src/auth/practiceOrders.ts'), 'utf8')).not.toContain(
      'practice_owner_notes',
    )
  })
})
